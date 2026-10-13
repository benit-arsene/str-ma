import { createInterface } from "node:readline/promises";

import { pool } from "../db.js";
import { hashPassword } from "../middleware/auth.js";

const USERNAME_REGEX = /^[a-z0-9_-]{3,32}$/;
const MIN_PASSWORD_LENGTH = 12;

async function main() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    let username = process.env.HP_ADMIN_USERNAME || "";
    if (!username) {
      username = await rl.question("Admin username: ");
    }
    username = username.trim().toLowerCase();

    if (!USERNAME_REGEX.test(username)) {
      throw new Error(
        "Username must be 3-32 characters and contain only letters, numbers, underscores, or hyphens."
      );
    }

    let password = process.env.HP_ADMIN_PASSWORD || "";
    if (!password) {
      password = await rl.question("Admin password: ");
      const confirmation = await rl.question("Confirm password: ");
      if (password !== confirmation) {
        throw new Error("Passwords do not match.");
      }
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
      );
    }

    const { salt, hash } = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO admins (username, password_salt, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING
       RETURNING id, username`,
      [username, salt, hash]
    );

    if (result.rows.length === 0) {
      throw new Error(
        "An administrator with that username already exists."
      );
    }

    console.log(
      `Administrator "${result.rows[0].username}" created successfully.`
    );
  } finally {
    rl.close();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
