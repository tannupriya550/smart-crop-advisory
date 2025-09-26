import { Router } from "express";
import Land from "../models/Land";

const router = Router();

// ✅ Get all available lands
router.get("/", async (_req, res) => {
  try {
    const lands = await Land.find({ status: "available" });
    res.json(lands);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add new land (admin use only)
router.post("/", async (req, res) => {
  try {
    const { lat, lng, size, price, status } = req.body;
    const land = new Land({ lat, lng, size, price, status });
    await land.save();
    res.status(201).json(land);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
