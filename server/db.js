import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "gallery.db");
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency and foreign keys
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/* ── Initialize Database Tables ── */
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'user',
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      url TEXT NOT NULL,
      local_file TEXT,
      uploaded INTEGER DEFAULT 0,
      date_added TEXT,
      rating INTEGER DEFAULT 0,
      is_favorite INTEGER DEFAULT 0,
      is_trashed INTEGER DEFAULT 0,
      album TEXT,
      user_id INTEGER,
      uploader_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL COLLATE NOCASE
    );

    CREATE TABLE IF NOT EXISTS screenshots (
      id TEXT PRIMARY KEY,
      photo_title TEXT,
      url TEXT NOT NULL,
      captured_at TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS features (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      votes INTEGER DEFAULT 1,
      status TEXT DEFAULT 'new',
      is_section INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure is_trashed and album columns exist for upgrades
  try {
    db.exec("ALTER TABLE photos ADD COLUMN is_trashed INTEGER DEFAULT 0");
  } catch {
    /* column already exists */
  }
  try {
    db.exec("ALTER TABLE photos ADD COLUMN album TEXT");
  } catch {
    /* column already exists */
  }

  migrateLegacyJsonData();
}

/* ── Seamless Migration from JSON Files ── */
function migrateLegacyJsonData() {
  try {
    // 1. Categories Migration
    const catCount = db.prepare("SELECT COUNT(*) AS count FROM categories").get().count;
    if (catCount === 0) {
      const defaultCats = ["Nature", "Travel", "Architecture", "Abstract", "Portraits"];
      const catFile = path.join(DATA_DIR, "categories.json");
      let catsToInsert = defaultCats;
      if (fs.existsSync(catFile)) {
        try {
          const fileCats = JSON.parse(fs.readFileSync(catFile, "utf-8"));
          if (Array.isArray(fileCats) && fileCats.length > 0) {
            catsToInsert = Array.from(new Set([...defaultCats, ...fileCats]));
          }
        } catch (e) {
          console.warn("Could not parse categories.json:", e.message);
        }
      }
      const insertCat = db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)");
      const insertManyCats = db.transaction((cats) => {
        for (const c of cats) {
          if (c && c.trim()) insertCat.run(c.trim());
        }
      });
      insertManyCats(catsToInsert);
      console.log(`[Database] Initialized categories table (${catsToInsert.length} items).`);
    }

    // 2. Photos Migration
    const photoCount = db.prepare("SELECT COUNT(*) AS count FROM photos").get().count;
    if (photoCount === 0) {
      const photoFile = path.join(DATA_DIR, "photos.json");
      let photosToInsert = [];
      if (fs.existsSync(photoFile)) {
        try {
          photosToInsert = JSON.parse(fs.readFileSync(photoFile, "utf-8"));
        } catch (e) {
          console.warn("Could not parse photos.json:", e.message);
        }
      }

      if (!Array.isArray(photosToInsert) || photosToInsert.length === 0) {
        // Initial fallback photos if photos.json was empty
        photosToInsert = [
          { id: "1", title: "Mountain Escape", category: "Nature", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800", dateAdded: "2023-01-15", rating: 4, isFavorite: false },
          { id: "2", title: "Ocean View", category: "Travel", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", dateAdded: "2023-02-10", rating: 5, isFavorite: true },
          { id: "3", title: "City Lights", category: "Travel", url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800", dateAdded: "2023-03-05", rating: 3, isFavorite: false },
          { id: "4", title: "Forest Path", category: "Nature", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800", dateAdded: "2023-04-20", rating: 4, isFavorite: false },
          { id: "5", title: "Modern Architecture", category: "Architecture", url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800", dateAdded: "2023-05-12", rating: 5, isFavorite: false },
          { id: "6", title: "Desert Journey", category: "Travel", url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800", dateAdded: "2023-06-18", rating: 4, isFavorite: false },
          { id: "7", title: "Northern Lights", category: "Nature", url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800", dateAdded: "2023-07-22", rating: 5, isFavorite: true },
          { id: "8", title: "Tokyo Streets", category: "Travel", url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800", dateAdded: "2023-08-14", rating: 4, isFavorite: false },
          { id: "9", title: "Glass Building", category: "Architecture", url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800", dateAdded: "2023-09-01", rating: 3, isFavorite: false },
        ];
      }

      const insertPhoto = db.prepare(`
        INSERT OR REPLACE INTO photos (id, title, category, url, local_file, uploaded, date_added, rating, is_favorite, uploader_name)
        VALUES (@id, @title, @category, @url, @localFile, @uploaded, @dateAdded, @rating, @isFavorite, @uploaderName)
      `);

      const insertManyPhotos = db.transaction((items) => {
        for (const item of items) {
          insertPhoto.run({
            id: String(item.id),
            title: item.title || "Untitled",
            category: item.category || "All",
            url: item.url,
            localFile: item.localFile || null,
            uploaded: item.uploaded ? 1 : 0,
            dateAdded: item.dateAdded || new Date().toISOString().split("T")[0],
            rating: Number(item.rating) || 0,
            isFavorite: item.isFavorite ? 1 : 0,
            uploaderName: item.uploaderName || "System",
          });
        }
      });
      insertManyPhotos(photosToInsert);
      console.log(`[Database] Initialized photos table (${photosToInsert.length} photos migrated).`);
    }

    // 3. Screenshots Migration
    const screenCount = db.prepare("SELECT COUNT(*) AS count FROM screenshots").get().count;
    if (screenCount === 0) {
      const screenFile = path.join(DATA_DIR, "screenshots.json");
      if (fs.existsSync(screenFile)) {
        try {
          const screens = JSON.parse(fs.readFileSync(screenFile, "utf-8"));
          if (Array.isArray(screens) && screens.length > 0) {
            const insertScreen = db.prepare(`
              INSERT OR REPLACE INTO screenshots (id, photo_title, url, captured_at)
              VALUES (@id, @photoTitle, @url, @capturedAt)
            `);
            const insertManyScreens = db.transaction((items) => {
              for (const s of items) {
                insertScreen.run({
                  id: String(s.id),
                  photoTitle: s.photoTitle || "Snapshot",
                  url: s.url,
                  capturedAt: s.capturedAt || new Date().toLocaleString(),
                });
              }
            });
            insertManyScreens(screens);
          }
        } catch (e) {
          console.warn("Could not parse screenshots.json:", e.message);
        }
      }
    }

    // 4. Features Migration
    const featCount = db.prepare("SELECT COUNT(*) AS count FROM features").get().count;
    if (featCount === 0) {
      const featFile = path.join(DATA_DIR, "features.json");
      let featsToInsert = [
        { id: "feat-1", title: "AI Auto-Tagging", description: "Automatically tag photos using AI recognition", votes: 24, status: "planned", isSection: false },
        { id: "feat-2", title: "Shared Albums", description: "Create albums and share with friends via link", votes: 18, status: "in-progress", isSection: false },
        { id: "feat-3", title: "Cloud Backup", description: "Sync and backup photos to cloud storage", votes: 31, status: "planned", isSection: false },
      ];
      if (fs.existsSync(featFile)) {
        try {
          const fileFeats = JSON.parse(fs.readFileSync(featFile, "utf-8"));
          if (Array.isArray(fileFeats) && fileFeats.length > 0) {
            featsToInsert = fileFeats;
          }
        } catch (e) {
          console.warn("Could not parse features.json:", e.message);
        }
      }
      const insertFeat = db.prepare(`
        INSERT OR REPLACE INTO features (id, title, description, votes, status, is_section)
        VALUES (@id, @title, @description, @votes, @status, @isSection)
      `);
      const insertManyFeats = db.transaction((items) => {
        for (const f of items) {
          insertFeat.run({
            id: String(f.id),
            title: f.title || "Feature",
            description: f.description || "",
            votes: Number(f.votes) || 1,
            status: f.status || "new",
            isSection: f.isSection ? 1 : 0,
          });
        }
      });
      insertManyFeats(featsToInsert);
    }
  } catch (err) {
    console.error("[Database] Migration error:", err.message);
  }
}

export default db;
