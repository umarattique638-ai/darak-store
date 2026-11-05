import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { createApp } from "./app.js";

async function main() {
  await connectDB();
  const server = createApp().listen(env.PORT, () => {
    console.info(`🚀 API ready on http://localhost:${env.PORT}/api  (${env.NODE_ENV})`);
  });

  const shutdown = (signal: string) => {
    console.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("❌ Failed to start:", err);
  process.exit(1);
});
