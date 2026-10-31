/**
 * PixVerse API Service
 * Powered by Supabase Cloud (Postgres DB, RLS, Storage)
 * With client-side resilience & offline fallback
 */

import { supabase } from "./supabase.js";

const isBrowser = typeof window !== "undefined";
const isLocalhost =
  isBrowser &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "");

export const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  (isLocalhost ? "http://localhost:5000" : "");

const TOKEN_KEY = "pixverse_auth_token";
const CURRENT_USER_KEY = "pixverse_current_user";
const USERS_STORAGE_KEY = "pixverse_users_db";

/* ── User Registry & Storage Helpers ── */
function getStoredUsers() {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Filter out any legacy demo accounts
          return parsed.filter((u) => u.username !== "demo" && u.username !== "alex" && u.id !== "usr_demo" && u.id !== "usr_alex");
        }
      }
    }
  } catch {}
  return [];
}

/* ── Session & Storage Helpers ── */
export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setAuthToken(token, persistent = true) {
  try {
    if (token) {
      if (persistent) {
        localStorage.setItem(TOKEN_KEY, token);
        sessionStorage.removeItem(TOKEN_KEY);
      } else {
        sessionStorage.setItem(TOKEN_KEY, token);
        localStorage.removeItem(TOKEN_KEY);
      }
    } else {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.warn("Could not set auth token:", err);
  }
}

export function clearAuthToken() {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.warn("Could not clear auth token:", err);
  }
}

export function getCurrentUser() {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    }
  } catch {}
  return null;
}

export function setCurrentUser(user) {
  try {
    if (typeof localStorage !== "undefined") {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
  } catch {}
}



function saveStoredUsers(users) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  } catch (err) {
    console.warn("Could not save users to local storage:", err);
  }
}

/* ── Backend / Supabase Health Check ── */
export async function checkBackendHealth() {
  let isExpressOnline = false;
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) isExpressOnline = true;
    } catch {}
  }

  let isSupabaseOnline = false;
  try {
    const { error } = await supabase
      .from("categories")
      .select("count", { count: "exact", head: true });
    if (!error) isSupabaseOnline = true;
  } catch {}

  if (isSupabaseOnline || isExpressOnline) {
    return {
      status: "ok",
      online: true,
      provider: isSupabaseOnline && isExpressOnline ? "Supabase Cloud & Express" : isSupabaseOnline ? "Supabase Cloud" : "Express SQLite",
      express: isExpressOnline,
      supabase: isSupabaseOnline,
    };
  }

  return { status: "ok", online: true, provider: "Local Database Fallback", express: false, supabase: false };
}

/* ── Authentication APIs with Supabase ── */

export async function registerApi({
  username,
  email,
  password,
  name,
  avatarColor = "#4285f4",
  rememberMe = true,
}) {
  const cleanUsername = (username || "").trim().toLowerCase();
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanName = (name || "").trim() || cleanUsername;

  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error("Username must be at least 3 characters long");
  }
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Please enter a valid email address");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const newUser = {
    id: userId,
    username: cleanUsername,
    email: cleanEmail,
    name: cleanName,
    role: "Member",
    avatar_color: avatarColor,
    bio: "",
    created_at: new Date().toISOString(),
  };

  // 1. Try Supabase Postgres Insert
  try {
    const { error: checkErr, data: existing } = await supabase
      .from("profiles")
      .select("id, username, email")
      .or(`username.ilike.${cleanUsername},email.ilike.${cleanEmail}`);

    if (existing && existing.length > 0) {
      if (existing[0].username.toLowerCase() === cleanUsername) {
        throw new Error("Username is already taken");
      }
      throw new Error("An account with this email already exists");
    }

    if (!checkErr) {
      const { error: insErr } = await supabase.from("profiles").insert([newUser]);
      if (insErr && insErr.message) {
        console.warn("Supabase profile insert notice:", insErr.message);
      }
    }
  } catch (err) {
    if (err.message && (err.message.includes("taken") || err.message.includes("already exists"))) {
      throw err;
    }
  }

  // 2. Also register in local Express backend if online
  if (API_BASE) {
    try {
      await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUsername,
          email: cleanEmail,
          password,
          name: cleanName,
        }),
        signal: AbortSignal.timeout(1500),
      });
    } catch {}
  }

  // 3. Save to local stored users with password
  const users = getStoredUsers();
  users.push({ ...newUser, password, avatarColor });
  saveStoredUsers(users);

  const token = `pv_token_${userId}_${Date.now()}`;
  setAuthToken(token, rememberMe);

  const userObj = {
    id: userId,
    username: cleanUsername,
    email: cleanEmail,
    name: cleanName,
    role: "Member",
    avatarColor,
    bio: "",
    createdAt: newUser.created_at,
  };

  setCurrentUser(userObj);
  return { success: true, token, user: userObj };
}

export async function loginApi({ usernameOrEmail, password, rememberMe = true }) {
  const query = (usernameOrEmail || "").trim().toLowerCase();
  const cleanPassword = (password || "").trim();
  if (!query) throw new Error("Please enter your username or email");
  if (!cleanPassword) throw new Error("Please enter your password");

  // 1. Check local stored users (which stores real user records with password)
  const users = getStoredUsers();
  const localMatch = users.find(
    (u) => (u.username && u.username.toLowerCase() === query) || (u.email && u.email.toLowerCase() === query)
  );

  if (localMatch) {
    if (localMatch.password && localMatch.password !== cleanPassword) {
      throw new Error("Invalid username/email or password");
    }
    const userObj = {
      id: localMatch.id,
      username: localMatch.username,
      email: localMatch.email,
      name: localMatch.name || localMatch.username,
      role: localMatch.role || "Member",
      avatarColor: localMatch.avatarColor || localMatch.avatar_color || "#4285f4",
      bio: localMatch.bio || "",
      createdAt: localMatch.createdAt || localMatch.created_at || new Date().toISOString(),
    };
    const token = `pv_token_${localMatch.id}_${Date.now()}`;
    setAuthToken(token, rememberMe);
    setCurrentUser(userObj);
    return { success: true, token, user: userObj };
  }

  // 3. Try Express backend if online
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail: query, password: cleanPassword }),
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          const userObj = {
            id: `usr_${data.user.id}`,
            username: data.user.username,
            email: data.user.email,
            name: data.user.name || data.user.username,
            role: data.user.role === "admin" ? "Pro Photographer" : "Member",
            avatarColor: "#4285f4",
            bio: "",
            createdAt: data.user.createdAt || new Date().toISOString(),
          };
          const token = data.token || `pv_token_${data.user.id}_${Date.now()}`;
          setAuthToken(token, rememberMe);
          setCurrentUser(userObj);

          users.push({ ...userObj, password: cleanPassword });
          saveStoredUsers(users);

          return { success: true, token, user: userObj };
        }
      }
    } catch {}
  }

  // 4. Try Supabase lookup
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.${query},email.ilike.${query}`)
      .maybeSingle();

    if (!error && data) {
      const userObj = {
        id: data.id,
        username: data.username,
        email: data.email,
        name: data.name || data.username,
        role: data.role || "Member",
        avatarColor: data.avatar_color || "#4285f4",
        bio: data.bio || "",
        createdAt: data.created_at,
      };
      const token = `pv_token_${data.id}_${Date.now()}`;
      setAuthToken(token, rememberMe);
      setCurrentUser(userObj);

      // Cache password so future logins require it
      users.push({ ...userObj, password: cleanPassword });
      saveStoredUsers(users);

      return { success: true, token, user: userObj };
    }
  } catch (err) {
    console.warn("Supabase login query note:", err.message);
  }

  throw new Error("Invalid username/email or password");
}

export async function getMeApi() {
  const token = getAuthToken();
  if (!token) return null;

  const current = getCurrentUser();
  if (current && (current.id === "usr_demo" || current.id === "usr_alex" || current.username === "demo" || current.username === "alex")) {
    clearAuthToken();
    return null;
  }
  if (current && current.id) return current;

  // If token exists, try recovering profile from Supabase
  if (token.startsWith("pv_token_")) {
    if (token.includes("demo") || token.includes("alex")) {
      clearAuthToken();
      return null;
    }
    const parts = token.split("_");
    const userId = parts.slice(2, -1).join("_") || parts[2];
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (data) {
        const recovered = {
          id: data.id,
          username: data.username,
          email: data.email,
          name: data.name || data.username,
          role: data.role || "Member",
          avatarColor: data.avatar_color || "#4285f4",
          bio: data.bio || "",
          createdAt: data.created_at,
        };
        setCurrentUser(recovered);
        return recovered;
      }
    } catch {}

    const users = getStoredUsers();
    const found = users.find((u) => u.id === userId);
    if (found) {
      const recovered = {
        id: found.id,
        username: found.username,
        email: found.email,
        name: found.name || found.username,
        role: found.role || "Member",
        avatarColor: found.avatarColor || found.avatar_color || "#4285f4",
        bio: found.bio || "",
        createdAt: found.createdAt || found.created_at,
      };
      setCurrentUser(recovered);
      return recovered;
    }
  }

  // Clear stale token and return null instead of forcing Demo User
  clearAuthToken();
  return null;
}

export async function updateProfileApi({ name, email, avatarColor, bio }) {
  const current = await getMeApi();
  if (!current) throw new Error("Must be signed in to update profile");

  const updatedUser = {
    ...current,
    name: (name || current.name).trim(),
    email: (email || current.email).trim(),
    avatarColor: avatarColor || current.avatarColor,
    bio: bio !== undefined ? bio.trim() : current.bio,
  };

  // 1. Update Supabase
  try {
    await supabase.from("profiles").update({
      name: updatedUser.name,
      email: updatedUser.email,
      avatar_color: updatedUser.avatarColor,
      bio: updatedUser.bio,
    }).eq("id", current.id);
  } catch (err) {
    console.warn("Supabase profile update note:", err.message);
  }

  // 2. Update local snapshot
  setCurrentUser(updatedUser);

  return { success: true, user: updatedUser };
}

export async function resetPasswordApi({ email, newPassword }) {
  if (!email || !newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (user) {
    user.password = newPassword;
    saveStoredUsers(users);
  }

  return { success: true, message: "Password updated successfully" };
}

/* ── Photos APIs with Supabase Postgres ── */

function formatPhotoRow(p) {
  return {
    id: String(p.id),
    title: p.title,
    category: p.category || "My Uploads",
    url: p.url,
    isFavorite: Boolean(p.is_favorite),
    isTrashed: Boolean(p.is_trashed),
    rating: p.rating || 5,
    uploaded: Boolean(p.uploaded),
    uploaderName: p.uploader_name || "PixVerse",
    userId: p.user_id,
    album: p.album || p.category,
    dateAdded: p.date_added || (p.created_at ? p.created_at.slice(0, 10) : "2026-10-29"),
    size: p.size || "1.5 MB",
    dimensions: p.dimensions || "1920x1080",
  };
}

const DEFAULT_FALLBACK_PHOTOS = [
  { id: "1", title: "Mountain Escape", category: "Nature", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000", dateAdded: "2026-10-29", rating: 5, isFavorite: false, uploaderName: "Unsplash" },
  { id: "2", title: "Ocean View", category: "Travel", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000", dateAdded: "2026-10-28", rating: 5, isFavorite: true, uploaderName: "Unsplash" },
  { id: "3", title: "City Lights", category: "Travel", url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1000", dateAdded: "2026-10-25", rating: 4, isFavorite: false, uploaderName: "Unsplash" },
  { id: "4", title: "Forest Path", category: "Nature", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000", dateAdded: "2026-09-18", rating: 4, isFavorite: false, uploaderName: "Unsplash" },
  { id: "5", title: "Modern Architecture", category: "Architecture", url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1000", dateAdded: "2026-09-12", rating: 5, isFavorite: false, uploaderName: "Unsplash" },
  { id: "6", title: "Desert Journey", category: "Travel", url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1000", dateAdded: "2026-08-15", rating: 4, isFavorite: false, uploaderName: "Unsplash" },
  { id: "7", title: "Northern Lights", category: "Nature", url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1000", dateAdded: "2026-07-22", rating: 5, isFavorite: true, uploaderName: "Unsplash" },
  { id: "8", title: "Tokyo Streets", category: "Travel", url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1000", dateAdded: "2026-06-14", rating: 4, isFavorite: false, uploaderName: "Unsplash" },
  { id: "9", title: "Glass Building", category: "Architecture", url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1000", dateAdded: "2026-05-01", rating: 4, isFavorite: false, uploaderName: "Unsplash" },
];

export async function fetchPhotosApi(userId = null) {
  const me = getCurrentUser();
  const effectiveUserId = userId || (me ? String(me.id) : null);
  const photosMap = new Map();

  // If no user is logged in, return an empty array for a clean interface
  if (!effectiveUserId) {
    return [];
  }

  // 1. Fetch from Supabase Postgres for this specific user
  try {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("user_id", effectiveUserId)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      data.forEach((row) => {
        const formatted = formatPhotoRow(row);
        if (formatted && formatted.id) {
          photosMap.set(formatted.id, formatted);
        }
      });
    }
  } catch (err) {
    console.warn("Supabase fetch photos note:", err.message);
  }

  // 2. Fetch from Express backend for this specific user if online
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/photos?userId=${encodeURIComponent(effectiveUserId)}`, {
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) {
        const serverPhotos = await res.json();
        if (Array.isArray(serverPhotos)) {
          serverPhotos.forEach((row) => {
            if (row && row.id && !photosMap.has(String(row.id))) {
              photosMap.set(String(row.id), {
                id: String(row.id),
                title: row.title,
                category: row.category || "My Uploads",
                url: row.url,
                isFavorite: Boolean(row.isFavorite),
                isTrashed: Boolean(row.isTrashed),
                rating: row.rating || 5,
                uploaded: Boolean(row.uploaded),
                uploaderName: row.uploaderName || (me ? (me.name || me.username) : "You"),
                userId: effectiveUserId,
                album: row.album || row.category,
                dateAdded: row.dateAdded || "2026-10-29",
                size: row.size || "1.5 MB",
                dimensions: row.dimensions || "1920x1080",
              });
            }
          });
        }
      }
    } catch {}
  }

  // 3. Merge from user-isolated localStorage cache
  try {
    const userStorageKey = `pixverse_photos_${effectiveUserId}`;
    const local = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
    if (Array.isArray(local)) {
      local.forEach((p) => {
        if (p && p.id && !photosMap.has(String(p.id))) {
          photosMap.set(String(p.id), formatPhotoRow(p));
        }
      });
    }
  } catch {}

  const userPhotos = Array.from(photosMap.values());

  // Cache to user-isolated localStorage
  try {
    localStorage.setItem(`pixverse_photos_${effectiveUserId}`, JSON.stringify(userPhotos));
  } catch {}

  return userPhotos;
}

export async function uploadPhotosApi(fileList, category = "My Uploads", customTitle = "") {
  const me = await getMeApi();
  const userId = me ? String(me.id) : null;
  const uploaderName = me ? (me.name || me.username) : "You";
  const targetCategory = (category || "My Uploads").trim();

  const photoRecords = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const id = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}_${i}`;
    let fileUrl = "";

    // 1. Try uploading to Supabase Storage bucket 'photos'
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `uploads/${Date.now()}_${cleanName}`;
      const { data: upData, error: upErr } = await supabase.storage
        .from("photos")
        .upload(storagePath, file, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (!upErr && upData) {
        const { data: pubData } = supabase.storage.from("photos").getPublicUrl(storagePath);
        fileUrl = pubData.publicUrl;
      } else if (upErr) {
        console.warn("Supabase storage upload note:", upErr.message);
      }
    } catch (e) {
      console.warn("Storage upload error:", e.message);
    }

    // 2. Fallback to base64 DataURL if storage upload was not successful
    if (!fileUrl) {
      fileUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    }

    const titleToUse = customTitle
      ? fileList.length > 1
        ? `${customTitle} (${i + 1})`
        : customTitle
      : file.name.replace(/\.[^/.]+$/, "");

    const record = {
      id,
      title: titleToUse,
      category: targetCategory,
      url: fileUrl,
      uploaded: true,
      date_added: new Date().toISOString().slice(0, 10),
      rating: 5,
      is_favorite: false,
      is_trashed: false,
      album: targetCategory,
      user_id: userId,
      uploader_name: uploaderName,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      dimensions: "1920x1080",
    };

    // 3. Insert record into Supabase Postgres photos table with user_id
    try {
      const { error: insErr } = await supabase.from("photos").insert([record]);
      if (insErr) {
        console.warn("Supabase photo insert notice:", insErr.message);
      }
    } catch (err) {
      console.warn("Supabase photo insert catch:", err.message);
    }

    photoRecords.push(record);
  }

  // 4. Also upload to Express backend if online to keep SQLite synchronized
  if (API_BASE) {
    try {
      const formData = new FormData();
      for (let i = 0; i < fileList.length; i++) {
        formData.append("images", fileList[i]);
      }
      formData.append("category", targetCategory);
      if (customTitle) formData.append("title", customTitle);
      if (userId) formData.append("userId", userId);
      formData.append("uploaderName", uploaderName);

      const token = getAuthToken();
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${API_BASE}/api/photos/upload`, {
        method: "POST",
        headers,
        body: formData,
        signal: AbortSignal.timeout(3000),
      });
    } catch (err) {
      console.warn("Express upload sync note:", err.message);
    }
  }

  // 5. Save to user-isolated localStorage cache
  if (userId) {
    try {
      const key = `pixverse_photos_${userId}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([...photoRecords, ...existing]));
    } catch {}

    // Save custom category to user's categories list if not default
    if (targetCategory && targetCategory !== "My Uploads" && targetCategory !== "All") {
      try {
        const catKey = `pixverse_categories_${userId}`;
        const existingCats = JSON.parse(localStorage.getItem(catKey) || "[]");
        if (!existingCats.includes(targetCategory)) {
          existingCats.push(targetCategory);
          localStorage.setItem(catKey, JSON.stringify(existingCats));
        }
      } catch {}
    }
  }

  const formatted = photoRecords.map(formatPhotoRow);
  return { success: true, count: formatted.length, photos: formatted };
}

export async function toggleFavoriteApi(id) {
  try {
    const { data } = await supabase.from("photos").select("is_favorite").eq("id", id).maybeSingle();
    const newFav = data ? !data.is_favorite : true;
    await supabase.from("photos").update({ is_favorite: newFav }).eq("id", id);
  } catch (err) {
    console.warn("toggleFavorite notice:", err.message);
  }

  // Update user-isolated localStorage cache
  const me = getCurrentUser();
  if (me && me.id) {
    try {
      const key = `pixverse_photos_${me.id}`;
      const local = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = local.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }
  return { success: true };
}

export async function trashPhotoApi(id) {
  try {
    await supabase.from("photos").update({ is_trashed: true }).eq("id", id);
  } catch (err) {
    console.warn("trashPhoto notice:", err.message);
  }

  const me = getCurrentUser();
  if (me && me.id) {
    try {
      const key = `pixverse_photos_${me.id}`;
      const local = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = local.map((p) => (p.id === id ? { ...p, isTrashed: true } : p));
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }
  return { success: true };
}

export async function restorePhotoApi(id) {
  try {
    await supabase.from("photos").update({ is_trashed: false }).eq("id", id);
  } catch (err) {
    console.warn("restorePhoto notice:", err.message);
  }

  const me = getCurrentUser();
  if (me && me.id) {
    try {
      const key = `pixverse_photos_${me.id}`;
      const local = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = local.map((p) => (p.id === id ? { ...p, isTrashed: false } : p));
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }
  return { success: true };
}

export async function deletePhotoApi(id) {
  try {
    await supabase.from("photos").delete().eq("id", id);
  } catch (err) {
    console.warn("deletePhoto notice:", err.message);
  }

  const me = getCurrentUser();
  if (me && me.id) {
    try {
      const key = `pixverse_photos_${me.id}`;
      const local = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = local.filter((p) => p.id !== id);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }
  return { success: true };
}

export async function batchTrashPhotosApi(ids) {
  try {
    await supabase.from("photos").update({ is_trashed: true }).in("id", ids);
  } catch (err) {
    console.warn("batchTrash notice:", err.message);
  }

  const me = getCurrentUser();
  if (me && me.id) {
    try {
      const key = `pixverse_photos_${me.id}`;
      const local = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = local.map((p) => (ids.includes(p.id) ? { ...p, isTrashed: true } : p));
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }
  return { success: true };
}

export async function batchRestorePhotosApi(ids) {
  try {
    await supabase.from("photos").update({ is_trashed: false }).in("id", ids);
  } catch (err) {
    console.warn("batchRestore notice:", err.message);
  }

  const me = getCurrentUser();
  if (me && me.id) {
    try {
      const key = `pixverse_photos_${me.id}`;
      const local = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = local.map((p) => (ids.includes(p.id) ? { ...p, isTrashed: false } : p));
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }
  return { success: true };
}

export async function batchFavoritePhotosApi(ids, isFavorite) {
  try {
    await supabase.from("photos").update({ is_favorite: Boolean(isFavorite) }).in("id", ids);
  } catch (err) {
    console.warn("batchFavorite notice:", err.message);
  }

  const me = getCurrentUser();
  if (me && me.id) {
    try {
      const key = `pixverse_photos_${me.id}`;
      const local = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = local.map((p) => (ids.includes(p.id) ? { ...p, isFavorite: Boolean(isFavorite) } : p));
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }
  return { success: true };
}

/* ── User-Isolated Categories APIs ── */

export async function fetchCategoriesApi(userId = null) {
  const me = getCurrentUser();
  const effectiveUserId = userId || (me ? String(me.id) : null);
  const catSet = new Set(["My Uploads"]);

  if (!effectiveUserId) {
    return Array.from(catSet);
  }

  // 1. Read from user-isolated LocalStorage key
  try {
    const userCats = JSON.parse(localStorage.getItem(`pixverse_categories_${effectiveUserId}`) || "[]");
    if (Array.isArray(userCats)) {
      userCats.forEach((c) => {
        if (c && typeof c === "string" && c.trim()) catSet.add(c.trim());
      });
    }
  } catch {}

  // 2. Extract categories from this user's cached photos
  try {
    const localPhotos = JSON.parse(localStorage.getItem(`pixverse_photos_${effectiveUserId}`) || "[]");
    if (Array.isArray(localPhotos)) {
      localPhotos.forEach((p) => {
        if (p.category && p.category.trim() && p.category !== "All" && p.category !== "Favorites") {
          catSet.add(p.category.trim());
        }
        if (p.album && p.album.trim() && p.album !== "All" && p.album !== "Favorites") {
          catSet.add(p.album.trim());
        }
      });
    }
  } catch {}

  // 3. Extract categories from Supabase for this user
  try {
    const { data } = await supabase
      .from("photos")
      .select("category, album")
      .eq("user_id", effectiveUserId);

    if (Array.isArray(data)) {
      data.forEach((p) => {
        if (p.category && p.category.trim() && p.category !== "All" && p.category !== "Favorites") {
          catSet.add(p.category.trim());
        }
        if (p.album && p.album.trim() && p.album !== "All" && p.album !== "Favorites") {
          catSet.add(p.album.trim());
        }
      });
    }
  } catch {}

  // 4. Extract categories from Express SQLite for this user
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/categories?userId=${encodeURIComponent(effectiveUserId)}`, {
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) {
        const serverCats = await res.json();
        if (Array.isArray(serverCats)) {
          serverCats.forEach((c) => {
            if (c && typeof c === "string" && c.trim()) catSet.add(c.trim());
          });
        }
      }
    } catch {}
  }

  const result = Array.from(catSet);
  try {
    localStorage.setItem(`pixverse_categories_${effectiveUserId}`, JSON.stringify(result));
  } catch {}

  return result;
}

export async function addCategoryApi(name, userId = null) {
  const clean = (name || "").trim();
  if (!clean) return { success: false };

  const me = getCurrentUser();
  const effectiveUserId = userId || (me ? String(me.id) : null);

  // 1. Immediately persist to user-isolated localStorage
  if (effectiveUserId) {
    try {
      const key = `pixverse_categories_${effectiveUserId}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      if (!existing.some((c) => c.toLowerCase() === clean.toLowerCase())) {
        existing.push(clean);
        localStorage.setItem(key, JSON.stringify(existing));
      }
    } catch {}
  }

  // 2. Post to Express backend if online
  if (API_BASE) {
    try {
      await fetch(`${API_BASE}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clean, userId: effectiveUserId }),
        signal: AbortSignal.timeout(1500),
      });
    } catch {}
  }

  return { success: true, name: clean };
}

export async function deleteCategoryApi(name, userId = null) {
  const clean = (name || "").trim();
  if (!clean) return { success: false };

  const me = getCurrentUser();
  const effectiveUserId = userId || (me ? String(me.id) : null);

  // 1. Remove from user-isolated localStorage
  if (effectiveUserId) {
    try {
      const key = `pixverse_categories_${effectiveUserId}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = existing.filter((c) => c.toLowerCase() !== clean.toLowerCase());
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}

    // Update photos category in user-isolated localStorage
    try {
      const photoKey = `pixverse_photos_${effectiveUserId}`;
      const photos = JSON.parse(localStorage.getItem(photoKey) || "[]");
      const updatedPhotos = photos.map((p) =>
        p.category && p.category.toLowerCase() === clean.toLowerCase()
          ? { ...p, category: "My Uploads", album: "My Uploads" }
          : p
      );
      localStorage.setItem(photoKey, JSON.stringify(updatedPhotos));
    } catch {}

    // 2. Update photos in Supabase for this user
    try {
      await supabase
        .from("photos")
        .update({ category: "My Uploads" })
        .eq("user_id", effectiveUserId)
        .ilike("category", clean);
    } catch {}
  }

  // 3. Delete from Express backend if online
  if (API_BASE) {
    try {
      await fetch(`${API_BASE}/api/categories/${encodeURIComponent(clean)}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(1500),
      });
    } catch {}
  }

  return { success: true };
}

/* ── Feature Requests APIs with Supabase ── */

export async function fetchFeaturesApi() {
  try {
    const { data, error } = await supabase
      .from("features")
      .select("*")
      .order("votes", { ascending: false });

    if (!error && Array.isArray(data)) {
      return data;
    }
  } catch (err) {
    console.warn("fetchFeatures notice:", err.message);
  }
  return [];
}

export async function addFeatureApi(feature) {
  try {
    await supabase.from("features").insert([feature]);
  } catch (err) {
    console.warn("addFeature notice:", err.message);
  }
  return { success: true };
}

export async function upvoteFeatureApi(id) {
  try {
    const { data } = await supabase.from("features").select("votes").eq("id", id).maybeSingle();
    const newVotes = (data ? data.votes : 1) + 1;
    await supabase.from("features").update({ votes: newVotes }).eq("id", id);
  } catch (err) {
    console.warn("upvoteFeature notice:", err.message);
  }
  return { success: true };
}
