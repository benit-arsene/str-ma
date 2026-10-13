import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { pool } from "../db.js";

const scryptAsync = promisify(scrypt);

export const SESSION_COOKIE_NAME = "hp_admin_session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const SESSION_TOKEN_BYTES = 32;
const SALT_BYTES = 16;
const HASH_BYTES = 64;

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;

export async function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES);
  const hash = await scryptAsync(password, salt, HASH_BYTES);
  return { salt: salt.toString("hex"), hash: hash.toString("hex") };
}

export async function verifyPassword(password, saltHex, hashHex) {
  const candidate = await scryptAsync(password, Buffer.from(saltHex, "hex"), HASH_BYTES);
  const expected = Buffer.from(hashHex, "hex");
  if (candidate.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(candidate, expected);
}

export function generateSessionToken() {
  return randomBytes(SESSION_TOKEN_BYTES).toString("hex");
}

export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function parseCookieHeader(header) {
  const cookies = {};
  if (!header) return cookies;

  for (const part of header.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;

    const name = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (!name) continue;

    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
  }

  return cookies;
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS,
  };
}

const loginAttempts = new Map();

export function checkLoginRateLimit(key) {
  const record = loginAttempts.get(key);
  if (!record) {
    return { limited: false, retryAfter: 0 };
  }

  const now = Date.now();
  if (now >= record.resetAt) {
    loginAttempts.delete(key);
    return { limited: false, retryAfter: 0 };
  }

  if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return { limited: true, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }

  return { limited: false, retryAfter: 0 };
}

export function recordLoginAttempt(key) {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || now >= record.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }

  record.count += 1;
}

export function clearLoginAttempts(key) {
  loginAttempts.delete(key);
}

export async function createAdminSession(adminId, token) {
  const tokenHash = hashToken(token);
  await pool.query("DELETE FROM admin_sessions WHERE expires_at < now()");
  await pool.query(
    "INSERT INTO admin_sessions (admin_id, token_hash, expires_at) VALUES ($1, $2, now() + ($3::int * interval '1 second'))",
    [adminId, tokenHash, Math.floor(SESSION_TTL_MS / 1000)]
  );
}

export async function findAdminByToken(tokenHash) {
  const result = await pool.query(
    `SELECT s.admin_id, a.username
       FROM admin_sessions s
       JOIN admins a ON a.id = s.admin_id
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

export async function destroyAdminSession(tokenHash) {
  await pool.query("DELETE FROM admin_sessions WHERE token_hash = $1", [tokenHash]);
}

export function requireAdmin(req, res, next) {
  handleRequireAdmin(req, res, next).catch(next);
}

async function handleRequireAdmin(req, res, next) {
  res.set("Cache-Control", "no-store");

  const cookies = parseCookieHeader(req.get("Cookie"));
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const admin = await findAdminByToken(hashToken(token));
  if (!admin) {
    return res.status(401).json({ error: "Authentication required" });
  }

  req.admin = { id: admin.admin_id, username: admin.username };
  return next();
}

export function requireSameOrigin(req, res, next) {
  const origin = req.get("Origin");
  if (!origin) {
    return next();
  }

  let originUrl;
  try {
    originUrl = new URL(origin);
  } catch {
    return res.status(403).json({ error: "Invalid request origin" });
  }

  const forwardedHost = req.get("X-Forwarded-Host");
  const hostHeader = (forwardedHost || req.get("Host") || "").split(",")[0].trim();
  if (!hostHeader) {
    return res.status(403).json({ error: "Invalid request origin" });
  }

  const [hostName] = hostHeader.split(":");

  // Compare hostnames only: in development the Vite proxy rewrites the Host
  // header to the API origin (e.g. localhost:5000) while the browser sends
  // the frontend origin (e.g. http://localhost:5173). A cross-site attacker
  // always has a different hostname, so hostname equality is the CSRF signal
  // here; SameSite=Lax cookies provide the primary browser-side protection.
  const matches = originUrl.hostname.toLowerCase() === hostName.toLowerCase();

  if (!matches) {
    return res.status(403).json({ error: "Cross-site request rejected" });
  }

  return next();
}
