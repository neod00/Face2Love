import { config } from "dotenv";
config();
import express from "express";
import { createServer } from "http";
import path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import analyzeRouter from "./routes/analyze.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Log environment
const googleCredsPath = path.join(process.cwd(), 'google-credentials.json');
console.log('Google Cloud Credentials File available:', fs.existsSync(googleCredsPath));
console.log('Google API Key available (AIza...):', !!process.env.GOOGLE_API_KEY);
console.log('OpenAI API Key available:', !!process.env.OPENAI_API_KEY);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API routes - always register regardless of environment
app.use("/api", analyzeRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

// Serve static files only in local dev (Vercel handles static files itself)
const isVercel = !!process.env.VERCEL;
if (!isVercel) {
  const staticPath = path.resolve(__dirname, "..", "dist");
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  }

  // Start local server
  const port = process.env.PORT || 3000;
  const server = createServer(app);
  server.listen(port, () => {
    console.log(`Server running locally on http://localhost:${port}/`);
  });
}

// Export for Vercel serverless
export default app;
