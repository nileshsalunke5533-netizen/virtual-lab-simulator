import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { config } from "../config/env.js";

export async function requireAuth(req, res, next) {
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authentication is required." });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const [users] = await pool.execute(
      `SELECT id, name, roll_no, email, branch, semester, role, status
         FROM users
        WHERE id = ?
        LIMIT 1`,
      [payload.sub]
    );
    const user = users[0];

    if (!user || user.status !== "active" || user.role !== payload.role) {
      return res.status(401).json({ error: "This account is unavailable." });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Your session is invalid or expired." });
    }
    return next(error);
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: "You are not authorized to access this resource." });
    }
    return next();
  };
}
