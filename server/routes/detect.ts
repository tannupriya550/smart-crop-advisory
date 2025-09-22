// server/routes/detect.ts
import { Router } from "express";
import axios from "axios";

const router = Router();

router.post("/", async (req, res) => {
  try {
    let { imageBase64 } = req.body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({ message: "Image is required" });
    }

    // Strip prefix if present (e.g., "data:image/jpeg;base64,")
    if (imageBase64.startsWith("data:image")) {
      imageBase64 = imageBase64.split(",")[1];
    }

    // Build payload — Roboflow requires the full `data:image/...;base64,`
    const body = `image=data:image/jpeg;base64,${imageBase64}`;

    // Send to Roboflow
    const response = await axios.post(
      `https://detect.roboflow.com/crop-disease-detection-uinxx/1?api_key=${process.env.ROBOFLOW_API_KEY}`,
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return res.json(response.data);
  } catch (err: any) {
    // 🔎 Improved error handling: log AND return Roboflow’s error
    const errorDetails = err.response?.data || err.message || "Unknown error";

    console.error("Detection error:", errorDetails);

    res.status(err.response?.status || 500).json({
      message: "Server error",
      error: errorDetails,
    });
  }
});

export default router;
