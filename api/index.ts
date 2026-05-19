import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import Groq from 'groq-sdk';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Snippet } from './models.js';

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

// Cached MongoDB Connection for Serverless/Vercel environments
let cachedConnection: typeof mongoose | null = null;
let cachedPromise: Promise<typeof mongoose> | null = null;

async function connectToDatabase(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    if (process.env.DOCKER === 'true' || process.env.NODE_ENV !== 'production') {
      const localUri = 'mongodb://localhost:27017/devreview';
      if (!cachedPromise) {
        cachedPromise = mongoose.connect(localUri).then((m) => {
          console.log('Connected to local MongoDB');
          return m;
        });
      }
      cachedConnection = await cachedPromise;
      return cachedConnection;
    }
    throw new Error('Database is not configured. Please add MONGODB_URI to your environment variables.');
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(MONGODB_URI).then((m) => {
      console.log('Connected to MongoDB');
      return m;
    });
  }

  try {
    cachedConnection = await cachedPromise;
  } catch (e) {
    cachedPromise = null;
    throw e;
  }

  return cachedConnection;
}

// Middleware to ensure DB connection is ready before processing requests
const ensureDbConnection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectToDatabase();
    next();
  } catch (error: any) {
    res.status(503).json({
      error: 'Database is not configured or could not be reached.',
      details: error.message
    });
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Groq client lazily to prevent global module crash if environment variable is missing
let groq: Groq | null = null;
const getGroqClient = (): Groq => {
  if (!groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is missing or empty.');
    }
    groq = new Groq({ apiKey });
  }
  return groq;
};

const upload = multer({ storage: multer.memoryStorage() });

// Authentication Middleware
interface AuthRequest extends Request {
  user?: any;
}
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Invalid token.' });
      return;
    }
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', ensureDbConnection, async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required.' });
      return;
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ error: 'Username already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

app.post('/api/auth/login', ensureDbConnection, async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// --- SYSTEM PROMPT ---
const SYSTEM_PROMPT = `You are an expert software engineer and code analyzer.
Your task is to analyze the provided code file and extract its function hierarchy and details.

You MUST return ONLY a structured JSON object that exactly matches the following schema. Do not include any markdown formatting (like \`\`\`json), explanations, or extra text.

Schema:
{
  "nodes": [
    {
      "id": "uniqueFunctionId", // A unique string identifier for the function (e.g., func1, or the function name)
      "label": "functionName",  // The name of the function
      "details": {
        "docs": "A brief explanation of what the function does.",
        "refactoredCode": "A clean, refactored version of the ENTIRE function code. DO NOT abbreviate or use '...'. Provide the FULL code.",
        "jestTest": "A complete, fully functional Jest unit test for the function. DO NOT abbreviate."
      }
    }
  ],
  "edges": [
    {
      "source": "callerFuncId", // The ID of the function that calls the target function
      "target": "calledFuncId"  // The ID of the function being called
    }
  ]
}

Analyze the code to identify all functions and their calling relationships (edges).
If there are no function calls, the edges array should be empty.
Ensure the returned string can be directly parsed by JSON.parse().`;

// --- PROTECTED ROUTE ---
app.post('/api/analyze', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const groqClient = getGroqClient();
    const response = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Here is the code file:\n\n${fileContent}` }
      ],
      temperature: 0.1,
    });

    const aiMessage = response.choices[0]?.message?.content || "";
    const jsonString = aiMessage.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(jsonString);

    // Try to save the snippet to database if available
    try {
      await connectToDatabase();
      const snippet = new Snippet({
        userId: req.user.userId,
        code: fileContent,
        analysisResult: parsedData
      });
      await snippet.save();
    } catch (dbError) {
      console.log('Skipping snippet save as database is not configured or reachable:', dbError);
    }

    res.json(parsedData);
  } catch (error: any) {
    res.status(500).json({ 
      error: 'An error occurred while analyzing the file.',
      details: error.error?.error?.message || error.message || "Unknown error"
    });
  }
});

app.get('/api/snippets', authenticateToken, ensureDbConnection, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const snippets = await Snippet.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching snippets' });
  }
});

// Start server locally if not running on Vercel
if (process.env.NODE_ENV !== 'production' || process.env.DOCKER === 'true') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Export the Express app for Vercel Serverless Functions
export default app;
