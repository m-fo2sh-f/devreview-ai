import express, { Request, Response } from 'express';
import multer from 'multer';
import Groq from 'groq-sdk';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Configure Multer for in-memory file upload
const upload = multer({ storage: multer.memoryStorage() });

// System Prompt for Groq (LLaMA 3)
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
        "refactoredCode": "A clean, refactored version of the function code.",
        "jestTest": "A basic Jest unit test for the function."
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

// Route: POST /api/analyze
app.post('/api/analyze', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    // Extract text content from the uploaded file
    const fileContent = req.file.buffer.toString('utf-8');
    const response = await groq.chat.completions.create({
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

    // Send the parsed data back to the client
    res.json(parsedData);
  
  } catch (error: any) {
    res.status(500).json({ 
      error: 'An error occurred while analyzing the file.',
      details: error.error?.error?.message || error.message || "Unknown error"
    });
  }
});

// Export the Express app so Vercel can run it as a serverless function
export default app;
