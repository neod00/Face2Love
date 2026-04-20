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

async function configureServer() {
  const server = createServer(app);

  // Log environment
  const googleCredsPath = path.join(process.cwd(), 'google-credentials.json');
  console.log('Google Cloud Credentials File available:', fs.existsSync(googleCredsPath));
  console.log('Google API Key available (AIza...):', !!process.env.GOOGLE_API_KEY);
  console.log('OpenAI API Key available:', !!process.env.OPENAI_API_KEY);

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // API routes
  app.use("/api", analyzeRouter);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist"); // Vercel often flattens this

  // Serve static files if the directory exists
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  } else {
    console.log(`Static path not found: ${staticPath}. Skipping static file serving.`);
    // Basic health check for API in dev
    app.get("/", (_req, res) => {
      res.json({ message: "Face2Love API is running", env: process.env.NODE_ENV });
    });
  }

  return server;
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  configureServer().then(server => {
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`Server running locally on http://localhost:${port}/`);
    });
  }).catch(console.error);
}

// Important: export the app for Vercel
export default app;

