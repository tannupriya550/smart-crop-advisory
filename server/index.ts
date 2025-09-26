// server/index.ts
import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import dotenv from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose"; // ✅ MongoDB
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from "helmet";
import cors from "cors";
import axios from "axios";

import authRoutes from "./routes/auth";
import detectionRoutes from "./routes/detect";
import landRoutes from "./routes/land"; // ✅ land routes

dotenv.config();

const app: Express = express();

// ✅ Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Hide Express signature ---
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");
  next();
});

// --- Security headers ---
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          // ⛔ removed Replit banner
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com", // ✅ allow Google Fonts
        ],
        "font-src": [
          "'self'",
          "https://fonts.gstatic.com", // ✅ allow Google Fonts font files
          "data:",
        ],
        "img-src": ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// --- Enable CORS ---
app.use(cors());

// --- Body parsing ---
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

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

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/detect", detectionRoutes);
app.use("/api/land", landRoutes); // ✅ land API

(async () => {
  try {
    // ✅ Connect MongoDB
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartcrop";
    await mongoose.connect(mongoUri);
    log("✅ MongoDB connected");

    const server = await registerRoutes(app);

    // --- Error handler ---
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      log(`Error: ${message}`);
    });

    // --- Health check ---
    app.get("/health", (_req, res) => {
      res.json({ status: "ok" });
    });

    // --- Debug env ---
    app.get("/api/check-env", (_req, res) => {
      const hasKey = !!process.env.WEATHER_API_KEY;
      res.json({
        WEATHER_API_KEY: hasKey ? "✅ Loaded" : "❌ Missing",
      });
    });

    // --- Current weather ---
    app.get("/api/weather", async (req, res) => {
      try {
        const city = (req.query.city as string) || "Delhi";
        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey) {
          return res.status(500).json({ error: "Weather API key not configured" });
        }

        const { data } = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );

        res.json(data);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // --- Forecast ---
    app.get("/api/forecast", async (req, res) => {
      try {
        const city = (req.query.city as string) || "Delhi";
        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey) {
          return res.status(500).json({ error: "Weather API key not configured" });
        }

        const { data } = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );

        res.json(data);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // --- 🌧 Rain alert ---
    app.get("/api/weather/rain-alert", async (req, res) => {
      try {
        const city = (req.query.city as string) || "Delhi";
        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey) {
          return res.status(500).json({ error: "Weather API key not configured" });
        }

        const { data } = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );

        // Check next 12 hours (4 x 3-hour slots)
        const upcoming = data.list.slice(0, 4);
        const rainExpected = upcoming.some((f: any) =>
          f.weather[0].main.toLowerCase().includes("rain")
        );

        res.json({ rainExpected, forecast: upcoming });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // --- Serve frontend ---
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // --- Catch-all for React Router ---
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "../dist/public/index.html"));
    });

    // --- Start server ---
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(port, () => {
      log(`✅ Server running on port ${port}`);
    });
  } catch (err) {
    log("❌ Failed to start server:");
    console.error(err);
    process.exit(1);
  }
})();
