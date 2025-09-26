import mongoose, { Schema, Document } from "mongoose";

export interface ILand extends Document {
  lat: number;
  lng: number;
  size: string;
  price: string;
  status: string;
}

const LandSchema: Schema = new Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  size: { type: String, required: true },   // e.g., "5 acres"
  price: { type: String, required: true },  // e.g., "₹2,50,000"
  status: { type: String, default: "available" }, // available/sold
});

export default mongoose.model<ILand>("Land", LandSchema);
