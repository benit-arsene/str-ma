import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(__dirname, "..", ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set."
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});