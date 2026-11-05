import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { allowedOrigins, isProd } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { apiLimiter, originCheck, sanitize } from "./middlewares/security.middleware.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.json({ limit: "200kb" }));
  app.use(cookieParser());
  app.use(morgan(isProd ? "combined" : "dev"));
  app.use("/api", apiLimiter, originCheck, sanitize, apiRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
