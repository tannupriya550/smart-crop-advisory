// server/routes/detect.ts
import { Router } from "express";
import axios from "axios";
import FormData from "form-data";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({ message: "Image is required" });
    }

    console.log("Base64 length:", imageBase64.length);
    console.log("Base64 starts with:", imageBase64.substring(0, 50));

    const url = `https://detect.roboflow.com/${process.env.ROBOFLOW_MODEL}/${process.env.ROBOFLOW_VERSION}?api_key=${process.env.ROBOFLOW_API_KEY}`;

    // ✅ Use FormData
    const formData = new FormData();
    formData.append("image", imageBase64);

    const response = await axios.post(url, formData, {
      headers: formData.getHeaders(),
    });

    res.json(response.data);
  } catch (err: any) {
    const errorDetails = err.response?.data || err.message || "Unknown error";
    console.error("Detection error:", errorDetails);

    res.status(err.response?.status || 500).json({
      message: "Detection failed",
      error: errorDetails,
    });
  }
});

export default router;
