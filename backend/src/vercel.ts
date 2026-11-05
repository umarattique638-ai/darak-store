/**
 * Vercel serverless entry. The Express app is created once per warm instance and
 * the MongoDB connection is cached between invocations (no new pool per request).
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";

const app = createApp();
let connecting: Promise<void> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (mongoose.connection.readyState !== 1) {
    connecting ??= connectDB().catch((err) => {
      connecting = null; // allow a retry on the next request
      throw err;
    });
    try {
      await connecting;
    } catch (err) {
      console.error("❌ MongoDB connection failed", err);
      res.statusCode = 503;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ success: false, error: { code: "DB_UNAVAILABLE", message: "Database is not reachable. Check MONGO_URL and Atlas Network Access." } }));
      return;
    }
  }
  app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
}
