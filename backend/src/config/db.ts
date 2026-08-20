import mongoose from "mongoose";
import { MONGODB_URI } from "./env.js";

const connectDB = async () => {
  const connection = await mongoose.connect(MONGODB_URI);

  console.log(`✅ MongoDB Connected: ${connection.connection.name}`);
};

export default connectDB;
