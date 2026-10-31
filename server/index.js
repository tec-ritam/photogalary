import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import db, { initDatabase } from "./db.js";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  authenticateToken,
} from "./auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Directories
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Serve uploaded static files
app.use("/uploads", express.static(UPLOADS_DIR));

// Initialize SQLite database & tables
initDatabase();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max per image
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Helper to format SQLite photo row to frontend model
function formatPhoto(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    url: row.url,
    localFile: row.local_file,
    uploaded: Boolean(row.uploaded),
    dateAdded: row.date_added,
    rating: row.rating,
    isFavorite: Boolean(row.is_favorite),
    isTrashed: Boolean(row.is_trashed),
    album: row.album || null,
    userId: row.user_id,
    uploaderName: row.uploader_name || "Community",
    createdAt: row.created_at,
  };
}

/* ══════════════════════════════════════════════════
   AUTHENTICATION ROUTES
   ══════════════════════════════════════════════════ */

// Register new user
app.post("/api/auth/register", (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    const trimmedUser = (username || "").trim();
    const trimmedEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();
    const cleanName = (name || "").trim() || trimmedUser;

    if (!trimmedUser || trimmedUser.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters long" });
    }
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      return res.status(400).json({ error: "A valid email address is required" });
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Check if username or email already exists
    const existing = db
      .prepare("SELECT id, username, email FROM users WHERE username = ? OR email = ?")
      .get(trimmedUser, trimmedEmail);

    if (existing) {
      if (existing.username.toLowerCase() === trimmedUser.toLowerCase()) {
        return res.status(409).json({ error: "Username is already taken" });
      }
      return res.status(409).json({ error: "Email is already registered" });
    }

    const passwordHash = hashPassword(cleanPassword);
    const result = db.prepare(`
      INSERT INTO users (username, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, 'user')
    `).run(trimmedUser, trimmedEmail, passwordHash, cleanName);

    const newUser = {
      id: result.lastInsertRowid,
      username: trimmedUser,
      email: trimmedEmail,
      name: cleanName,
      role: "user",
    };

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: newUser,
    });
  } catch (err) {
    console.error("[Auth] Register error:", err);
    res.status(500).json({ error: "Failed to create account: " + err.message });
  }
});

// Login
app.post("/api/auth/login", (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const identifier = (usernameOrEmail || "").trim();
    const cleanPassword = (password || "").trim();

    if (!identifier || !cleanPassword) {
      return res.status(400).json({ error: "Username/Email and password are required" });
    }

    const user = db
      .prepare("SELECT * FROM users WHERE username = ? OR email = ?")
      .get(identifier, identifier.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: "Invalid username/email or password" });
    }

    const isMatch = verifyPassword(cleanPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username/email or password" });
    }

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name || user.username,
      role: user.role || "user",
      avatarUrl: user.avatar_url,
    };

    const token = generateToken(userData);

    res.json({
      success: true,
      message: `Welcome back, ${userData.name}!`,
      token,
      user: userData,
    });
  } catch (err) {
    console.error("[Auth] Login error:", err);
    res.status(500).json({ error: "Login failed: " + err.message });
  }
});

// Current user profile
app.get("/api/auth/me", authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = db
    .prepare("SELECT id, username, email, name, role, avatar_url, created_at FROM users WHERE id = ?")
    .get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name || user.username,
    role: user.role,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
  });
});

/* ══════════════════════════════════════════════════
   SYSTEM & HEALTH
   ══════════════════════════════════════════════════ */

// Health Check
app.get("/api/health", (req, res) => {
  const photoCount = db.prepare("SELECT COUNT(*) as count FROM photos").get().count;
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;

  res.json({
    status: "ok",
    database: "SQLite (better-sqlite3)",
    message: "PixVerse Backend with SQLite Database is running smoothly 🚀",
    stats: {
      photos: photoCount,
      users: userCount,
    },
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

/* ══════════════════════════════════════════════════
   PHOTOS API (DATABASE BACKED)
   ══════════════════════════════════════════════════ */

// Get all photos (filtered by userId for strict user multi-tenant isolation)
app.get("/api/photos", (req, res) => {
  try {
    const { userId } = req.query;
    let rows = [];
    if (userId) {
      const numId = Number(userId);
      if (!isNaN(numId)) {
        rows = db.prepare("SELECT * FROM photos WHERE user_id = ? OR user_id = ? ORDER BY created_at DESC").all(userId, numId);
      } else {
        rows = db.prepare("SELECT * FROM photos WHERE user_id = ? ORDER BY created_at DESC").all(userId);
      }
    }
    res.json(rows.map(formatPhoto));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload multiple photos (Stores in uploads/ and database)
app.post("/api/photos/upload", authenticateToken, upload.array("images", 10), (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: "No image files provided" });
    }

    const host = `${req.protocol}://${req.get("host")}`;
    const userId = req.user ? req.user.id : (req.body.userId || null);
    const uploaderName = req.user ? (req.user.name || req.user.username) : (req.body.uploaderName || "User");
    const chosenCategory = (req.body.category || "").trim() || "My Uploads";
    const customTitle = (req.body.title || "").trim();

    // Auto-save category into categories table if not default
    if (chosenCategory && chosenCategory !== "My Uploads" && chosenCategory !== "All") {
      try {
        db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run(chosenCategory);
      } catch {}
    }

    const insertStmt = db.prepare(`
      INSERT INTO photos (
        id, title, category, url, local_file, uploaded, date_added, rating, is_favorite, user_id, uploader_name
      ) VALUES (
        @id, @title, @category, @url, @localFile, @uploaded, @dateAdded, @rating, @isFavorite, @userId, @uploaderName
      )
    `);

    const newPhotos = [];
    const transaction = db.transaction((fileList) => {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const originalTitle = file.originalname.replace(/\.[^/.]+$/, "");
        const finalTitle = customTitle
          ? (fileList.length > 1 ? `${customTitle} (${i + 1})` : customTitle)
          : originalTitle || "Uploaded Photo";

        const photoRecord = {
          id: "upload-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
          title: finalTitle,
          category: chosenCategory,
          url: `${host}/uploads/${file.filename}`,
          localFile: file.filename,
          uploaded: 1,
          dateAdded: new Date().toISOString().split("T")[0],
          rating: 0,
          isFavorite: 0,
          userId,
          uploaderName,
        };
        insertStmt.run(photoRecord);
        newPhotos.push(formatPhoto({
          id: photoRecord.id,
          title: photoRecord.title,
          category: photoRecord.category,
          url: photoRecord.url,
          local_file: photoRecord.localFile,
          uploaded: 1,
          date_added: photoRecord.dateAdded,
          rating: 0,
          is_favorite: 0,
          user_id: userId,
          uploader_name: uploaderName,
          created_at: new Date().toISOString(),
        }));
      }
    });

    transaction(files);

    res.status(201).json({
      success: true,
      message: `Uploaded and saved ${newPhotos.length} photo(s) into database!`,
      photos: newPhotos,
    });
  } catch (err) {
    console.error("[Upload] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add photo via URL
app.post("/api/photos", authenticateToken, (req, res) => {
  try {
    const { title, category, url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Photo URL is required" });
    }

    const id = "url-" + Date.now();
    const photoCategory = category || "All";
    const photoTitle = title || "New Photo";
    const dateAdded = new Date().toISOString().split("T")[0];
    const userId = req.user ? req.user.id : null;
    const uploaderName = req.user ? (req.user.name || req.user.username) : "Community";

    db.prepare(`
      INSERT INTO photos (id, title, category, url, date_added, rating, is_favorite, user_id, uploader_name)
      VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?)
    `).run(id, photoTitle, photoCategory, url, dateAdded, userId, uploaderName);

    const inserted = db.prepare("SELECT * FROM photos WHERE id = ?").get(id);
    res.status(201).json(formatPhoto(inserted));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle favorite
app.put("/api/photos/:id/favorite", (req, res) => {
  try {
    const { id } = req.params;
    const photo = db.prepare("SELECT * FROM photos WHERE id = ?").get(id);

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const newFav = photo.is_favorite ? 0 : 1;
    db.prepare("UPDATE photos SET is_favorite = ? WHERE id = ?").run(newFav, id);

    const updated = db.prepare("SELECT * FROM photos WHERE id = ?").get(id);
    res.json(formatPhoto(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update star rating
app.put("/api/photos/:id/rating", (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const photo = db.prepare("SELECT * FROM photos WHERE id = ?").get(id);

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const newRating = Math.max(0, Math.min(5, Number(rating) || 0));
    db.prepare("UPDATE photos SET rating = ? WHERE id = ?").run(newRating, id);

    const updated = db.prepare("SELECT * FROM photos WHERE id = ?").get(id);
    res.json(formatPhoto(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle trash photo (Move to Trash / Bin)
app.put("/api/photos/:id/trash", (req, res) => {
  try {
    const { id } = req.params;
    const photo = db.prepare("SELECT * FROM photos WHERE id = ?").get(id);
    if (!photo) return res.status(404).json({ error: "Photo not found" });

    db.prepare("UPDATE photos SET is_trashed = 1 WHERE id = ?").run(id);
    const updated = db.prepare("SELECT * FROM photos WHERE id = ?").get(id);
    res.json(formatPhoto(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restore photo from trash
app.put("/api/photos/:id/restore", (req, res) => {
  try {
    const { id } = req.params;
    const photo = db.prepare("SELECT * FROM photos WHERE id = ?").get(id);
    if (!photo) return res.status(404).json({ error: "Photo not found" });

    db.prepare("UPDATE photos SET is_trashed = 0 WHERE id = ?").run(id);
    const updated = db.prepare("SELECT * FROM photos WHERE id = ?").get(id);
    res.json(formatPhoto(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Batch trash photos
app.post("/api/photos/batch/trash", (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ error: "List of IDs required" });
    }
    const stmt = db.prepare("UPDATE photos SET is_trashed = 1 WHERE id = ?");
    const runBatch = db.transaction((idList) => {
      for (const id of idList) stmt.run(String(id));
    });
    runBatch(ids);
    res.json({ success: true, count: ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Batch restore photos
app.post("/api/photos/batch/restore", (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ error: "List of IDs required" });
    }
    const stmt = db.prepare("UPDATE photos SET is_trashed = 0 WHERE id = ?");
    const runBatch = db.transaction((idList) => {
      for (const id of idList) stmt.run(String(id));
    });
    runBatch(ids);
    res.json({ success: true, count: ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Batch favorite photos
app.post("/api/photos/batch/favorite", (req, res) => {
  try {
    const { ids, isFavorite } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ error: "List of IDs required" });
    }
    const favValue = isFavorite ? 1 : 0;
    const stmt = db.prepare("UPDATE photos SET is_favorite = ? WHERE id = ?");
    const runBatch = db.transaction((idList) => {
      for (const id of idList) stmt.run(favValue, String(id));
    });
    runBatch(ids);
    res.json({ success: true, count: ids.length, isFavorite: favValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete photo permanently
app.delete("/api/photos/:id", (req, res) => {
  try {
    const { id } = req.params;
    const target = db.prepare("SELECT * FROM photos WHERE id = ?").get(id);

    if (!target) {
      return res.status(404).json({ error: "Photo not found" });
    }

    // If local file was uploaded, delete it from disk
    if (target.local_file) {
      const filePath = path.join(UPLOADS_DIR, target.local_file);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn("Could not delete file:", e.message);
        }
      }
    }

    db.prepare("DELETE FROM photos WHERE id = ?").run(id);

    res.json({ success: true, message: "Photo deleted from database successfully", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ══════════════════════════════════════════════════
   CATEGORIES API (DATABASE BACKED)
   ══════════════════════════════════════════════════ */

// Get custom categories (isolated by user if userId provided)
app.get("/api/categories", (req, res) => {
  try {
    const { userId } = req.query;
    if (userId) {
      const numId = Number(userId);
      const rows = !isNaN(numId)
        ? db.prepare("SELECT DISTINCT category FROM photos WHERE (user_id = ? OR user_id = ?) AND category IS NOT NULL").all(userId, numId)
        : db.prepare("SELECT DISTINCT category FROM photos WHERE user_id = ? AND category IS NOT NULL").all(userId);
      const userCats = rows.map((r) => r.category).filter(Boolean);
      return res.json(["My Uploads", ...new Set(userCats)]);
    }
    res.json(["My Uploads"]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new category
app.post("/api/categories", (req, res) => {
  try {
    const { name } = req.body;
    const trimmed = (name || "").trim();
    if (!trimmed) {
      return res.status(400).json({ error: "Category name is required" });
    }

    db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run(trimmed);
    const rows = db.prepare("SELECT name FROM categories ORDER BY id ASC").all();
    res.status(201).json({ success: true, categories: rows.map((r) => r.name), added: trimmed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete category
app.delete("/api/categories/:name", (req, res) => {
  try {
    const { name } = req.params;
    db.prepare("DELETE FROM categories WHERE LOWER(name) = LOWER(?)").run(name);
    // Safely reassign any photos in this category to 'My Uploads'
    db.prepare("UPDATE photos SET category = 'My Uploads' WHERE LOWER(category) = LOWER(?)").run(name);
    const rows = db.prepare("SELECT name FROM categories ORDER BY id ASC").all();
    res.json({ success: true, categories: rows.map((r) => r.name) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ══════════════════════════════════════════════════
   SCREENSHOTS API (DATABASE BACKED)
   ══════════════════════════════════════════════════ */

// Get screenshots
app.get("/api/screenshots", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM screenshots ORDER BY created_at DESC").all();
    res.json(
      rows.map((r) => ({
        id: r.id,
        photoTitle: r.photo_title,
        url: r.url,
        capturedAt: r.captured_at,
        userId: r.user_id,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save screenshot
app.post("/api/screenshots", authenticateToken, (req, res) => {
  try {
    const { photoTitle, url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Screenshot URL is required" });
    }

    const id = "ss-" + Date.now();
    const capturedAt = new Date().toLocaleString();
    const userId = req.user ? req.user.id : null;

    db.prepare(`
      INSERT INTO screenshots (id, photo_title, url, captured_at, user_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, photoTitle || "Snapshot", url, capturedAt, userId);

    res.status(201).json({
      id,
      photoTitle: photoTitle || "Snapshot",
      url,
      capturedAt,
      userId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete screenshot
app.delete("/api/screenshots/:id", (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM screenshots WHERE id = ?").run(id);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ══════════════════════════════════════════════════
   FEATURE REQUESTS API (DATABASE BACKED)
   ══════════════════════════════════════════════════ */

// Get feature requests
app.get("/api/features", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM features ORDER BY votes DESC, created_at DESC").all();
    res.json(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        votes: r.votes,
        status: r.status,
        isSection: Boolean(r.is_section),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit feature request
app.post("/api/features", (req, res) => {
  try {
    const { title, description, isSection } = req.body;
    const trimmedTitle = (title || "").trim();
    if (!trimmedTitle) {
      return res.status(400).json({ error: "Feature title is required" });
    }

    const id = "feat-" + Date.now();
    const desc = (description || "").trim() || "User introduced section/feature";
    const isSec = isSection ? 1 : 0;

    db.prepare(`
      INSERT INTO features (id, title, description, votes, status, is_section)
      VALUES (?, ?, ?, 1, 'new', ?)
    `).run(id, trimmedTitle, desc, isSec);

    // If introduced as a section, also add to categories
    if (isSec) {
      db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run(trimmedTitle);
    }

    res.status(201).json({
      id,
      title: trimmedTitle,
      description: desc,
      votes: 1,
      status: "new",
      isSection: Boolean(isSec),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upvote feature request
app.put("/api/features/:id/vote", (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("UPDATE features SET votes = votes + 1 WHERE id = ?").run(id);
    const updated = db.prepare("SELECT * FROM features WHERE id = ?").get(id);

    if (!updated) {
      return res.status(404).json({ error: "Feature request not found" });
    }

    res.json({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      votes: updated.votes,
      status: updated.status,
      isSection: Boolean(updated.is_section),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 PixVerse Backend running on port ${PORT}`);
  console.log(`🗄️ Database: SQLite (server/data/gallery.db)`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📸 Uploads: http://localhost:${PORT}/uploads`);
  console.log(`===============================================`);
});
