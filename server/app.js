import cors from "cors";
import express from "express";
import { config } from "./config/env.js";
import apiRoutes from "./routes/api.js";

const app = express();

app.use(cors((request, callback) => {
  const origin = request.header("Origin");
  if (!origin) return callback(null, { origin: true });

  const explicitlyAllowed = config.clientOrigins.includes(origin);
  let localDevelopmentOrigin = false;
  if (config.nodeEnv !== "production") {
    try {
      const parsed = new URL(origin);
      localDevelopmentOrigin =
        ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname) &&
        ["http:", "https:"].includes(parsed.protocol);
    } catch {
      localDevelopmentOrigin = false;
    }
  }

  return callback(null, {
    origin: explicitlyAllowed || localDevelopmentOrigin,
  });
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", apiRoutes);

app.use((error, _req, res, next) => {
  void next;
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "That roll number or email is already registered." });
  }

  const status = Number(error.status) || 500;
  if (status >= 500) {
    console.error("API request failed:", error);
  }
  return res.status(status).json({
    error: status >= 500 ? "An unexpected server error occurred." : error.message,
  });
});

export default app;
