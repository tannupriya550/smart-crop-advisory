import mongoose from "mongoose";
import dotenv from "dotenv";
import Land from "./models/Land.js"; // ✅ adjust path if needed

dotenv.config();

const lands = [
  {
    lat: 28.7041,
    lng: 77.1025,
    size: "5 acres",
    price: "₹2,50,000",
    status: "available",
  },
  {
    lat: 19.076,
    lng: 72.8777,
    size: "3 acres",
    price: "₹1,80,000",
    status: "available",
  },
  {
    lat: 13.0827,
    lng: 80.2707,
    size: "10 acres",
    price: "₹5,00,000",
    status: "sold",
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ Connected to MongoDB");

    // Clear old data
    await Land.deleteMany({});
    console.log("🗑️ Old land data removed");

    // Insert new demo data
    await Land.insertMany(lands);
    console.log("🌱 Seeded land data successfully!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding land data:", err);
    process.exit(1);
  }
})();
