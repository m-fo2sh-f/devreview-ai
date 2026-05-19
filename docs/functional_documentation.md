# DevReview AI - Functional Documentation

## Project Overview
DevReview AI is a centralized hub for teams to upload code snippets and receive AI-driven feedback on code style, patterns, and documentation. The platform utilizes a React frontend with interactive SVG visualizations (React Flow) and a Node.js/Express backend that integrates with Groq's LLaMA 3 model for code analysis.

## User Stories & Acceptance Criteria

### 1. User Authentication
**User Story:** As a developer, I want to create an account and log in securely so that my code snippets are protected and private.
**Acceptance Criteria:**
- Users can register with a unique username and password.
- Passwords must be securely hashed in the database (bcrypt).
- Users can log in and receive a JSON Web Token (JWT) for session management.
- Unauthenticated users attempting to access the dashboard are redirected to the login page.

### 2. Code Upload & Analysis
**User Story:** As a developer, I want to upload a JavaScript or TypeScript file so that the AI can analyze its structure and quality.
**Acceptance Criteria:**
- The platform supports Drag and Drop file uploads.
- The backend validates the upload and sends it to the AI provider (Groq LLaMA 3).
- The AI correctly identifies the function hierarchy (nodes and edges).
- The AI drafts functional documentation, refactored code, and Jest unit tests for each function.
- The analyzed data is securely saved in the database attached to the user's ID.

### 3. Interactive Visualization (Flowchart)
**User Story:** As a team lead, I want to see a visual representation of the uploaded code so I can quickly understand the architecture and dependencies.
**Acceptance Criteria:**
- The frontend renders an interactive flowchart using HTML5/SVG (React Flow).
- The chart automatically layouts top-down using Dagre.
- Nodes represent functions, and edges represent calling relationships.
- Smooth CSS animations and keyframes enhance the UI experience.

### 4. Code Details Sidebar
**User Story:** As a code reviewer, I want to click on a function node to see detailed AI feedback, refactored code, and test stubs.
**Acceptance Criteria:**
- Clicking a node opens a slide-out sidebar.
- The sidebar displays:
  - Functional Documentation
  - Refactored Code (with syntax highlighting)
  - Jest Unit Tests (with syntax highlighting)
- Horizontal scrolling is disabled on code blocks to ensure readability via text wrapping.

## Technology Stack
- **Frontend:** React (Vite), React Flow, Tailwind CSS, TypeScript
- **Backend:** Node.js, Express, Mongoose, JWT, bcrypt
- **Database:** MongoDB
- **AI Integration:** Groq API (LLaMA 3.3 70B Versatile)
- **Deployment & DevOps:** Docker Compose (Local/Containerized), Vercel (Cloud Deployment)
