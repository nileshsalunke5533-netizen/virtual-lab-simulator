import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import process from "node:process";
import app from "./app.js";
import pool from "./config/db.js";
import { config } from "./config/env.js";
import { ensureSchema } from "./config/schema.js";

export async function startServer() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    await ensureSchema();
    app.listen(config.port, () => {
      console.log(`LabSim API listening at http://localhost:${config.port}/api`);
    });
  } catch (error) {
    console.error(
      `Unable to connect to MySQL at ${config.dbHost}:${config.dbPort}/${config.dbName}. Start XAMPP MySQL and verify the project-root .env settings.`,
      error.message
    );
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await startServer();
}
