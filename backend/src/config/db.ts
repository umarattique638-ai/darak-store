import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  mongoose.connection.on("disconnected", () => console.warn("⚠️  MongoDB disconnected"));
  mongoose.connection.on("reconnected", () => console.info("✅ MongoDB reconnected"));
  await mongoose.connect(env.MONGO_URL, {
    dbName: env.MONGO_DB_NAME,
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 10,
  });
  console.info(`✅ MongoDB connected (db: ${env.MONGO_DB_NAME})`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
