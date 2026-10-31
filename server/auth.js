import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "framespace_super_secret_jwt_key_2026";
export const JWT_EXPIRES_IN = "7d";

/**
 * Hash a plain text password
 */
export function hashPassword(plainPassword) {
  return bcrypt.hashSync(plainPassword, 10);
}

/**
 * Verify a plain text password against a hashed password
 */
export function verifyPassword(plainPassword, hash) {
  return bcrypt.compareSync(plainPassword, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role || "user",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Express middleware to verify JWT token (optional or required)
 * Attaches req.user if valid token is provided
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Invalid or expired token
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
}

/**
 * Middleware that strictly requires authentication
 */
export function requireAuth(req, res, next) {
  authenticateToken(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required. Please log in." });
    }
    next();
  });
}
