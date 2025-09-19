import express, { type Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fetch from "node-fetch"; // install with: npm install node-fetch

import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from "helmet";

// Load env vars
dotenv.config();

const app = express();

// Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Hide Express signature ---
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");
  next();
});

// --- Security headers via Helmet ---
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// --- Body parsing ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Request logging middleware ---
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // --- Register API routes ---
    const server = await registerRoutes(app);

    // --- Error handling middleware ---
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      log(`Error: ${message}`);
    });

    // --- Health check route ---
    app.get("/health", (_req, res) => {
      res.json({ status: "ok" });
    });

    // --- Debug route: check if WEATHER_API_KEY is loaded ---
    app.get("/api/check-env", (_req, res) => {
      const hasKey = !!process.env.WEATHER_API_KEY;
      res.json({
        WEATHER_API_KEY: hasKey ? "✅ Loaded" : "❌ Missing",
      });
    });

    // --- Weather route ---
    app.get("/api/weather", async (req, res) => {
      try {
        const city = (req.query.city as string) || "Delhi";
        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey) {
          return res
            .status(500)
            .json({ error: "Weather API key not configured" });
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );

        if (!response.ok) {
          throw new Error(`Weather API failed: ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // --- Setup Vite or serve static ---
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // --- Catch-all route for React Router (important for Render) ---
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "../dist/public/index.html"));
    });

    // --- Start server ---
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(port, () => {
      log(`Server running on port ${port}`);
    });
  } catch (err) {
    log("Failed to start server:");
    console.error(err);
    process.exit(1);
  }
})();
