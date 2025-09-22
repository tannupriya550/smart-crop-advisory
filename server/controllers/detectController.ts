// server/controllers/detectController.ts
import { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import path from "path";

export const detectImage = async (req: Request, res: Response) => {
  try {
    // Accept both { imageBase64: '...' } JSON or raw string body
    let base64: string | undefined = req.body?.imageBase64 ?? (typeof req.body === "string" ? req.body : undefined);

    if (!base64) {
      return res.status(400).json({ message: "No imageBase64 provided" });
    }

    // Remove data URI prefix and whitespace/newlines
    base64 = base64.replace(/^data:image\/\w+;base64,/, "").replace(/\s+/g, "");

    // sanity check decode
    const buffer = Buffer.from(base64, "base64");
    if (!buffer || buffer.length < 10) {
      return res.status(400).json({ message: "Decoded buffer too small — malformed base64" });
    }

    // Optional debug save (helps confirm the image decoded correctly)
    try {
      const tmp = path.join(process.cwd(), "tmp");
      fs.mkdirSync(tmp, { recursive: true });
      const debugPath = path.join(tmp, `upload-${Date.now()}.jpg`);
      fs.writeFileSync(debugPath, buffer);
      console.log("Saved debug image to:", debugPath);
    } catch (e) {
      console.warn("Could not save debug image:", e);
    }

    // Build Roboflow URL from env
    const endpoint = process.env.ROBOFLOW_ENDPOINT; // e.g. https://detect.roboflow.com/<model>/<version>
    const apiKey = process.env.ROBOFLOW_API_KEY;
    if (!endpoint || !apiKey) {
      return res.status(500).json({ message: "Roboflow endpoint or API key not configured in .env" });
    }

    const url = `${endpoint}?api_key=${apiKey}`;

    // Roboflow expects raw base64 body with form-urlencoded content-type
    const rfResp = await axios.post(url, base64, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 20000,
    });

    return res.json(rfResp.data);
  } catch (err: any) {
    console.error("detectImage error:", err?.response?.data || err.message || err);
    return res.status(500).json({
      message: "Detection error",
      error: err?.response?.data || err.message,
    });
  }
};
