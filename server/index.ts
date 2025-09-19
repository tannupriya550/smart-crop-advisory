import dotenv from "dotenv";
dotenv.config();
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from "helmet";

const app = express();

// --- Hide Express + scrub headers ---
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");
  res.removeHeader("Via");
  res.removeHeader("X-Served-By");
  res.removeHeader("X-Forwarded-Host");
  res.removeHeader("X-Forwarded-Server");

  // Optional: set your own "Server" header
  // res.setHeader("Server", "SmartCropAdvisory/1.0");

  next();
});

// --- Secure headers via helmet ---
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        // Allow inline scripts/styles for React/Vite dev
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false, // needed for React/Vite dev compatibility
  })
);

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

    // --- Setup Vite or serve static files ---
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

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

// --- Health check route ---
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
// --- Debug route to check env vars (remove later in prod!) ---
app.get("/env-check", (_req, res) => {
  res.json({
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL ? "✔️ Loaded" : "❌ Not found",
    SESSION_SECRET: process.env.SESSION_SECRET ? "✔️ Loaded" : "❌ Not found",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "✔️ Loaded" : "❌ Not found",
  });
});

