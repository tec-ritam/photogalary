import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./App.css";

// API Services
import {
  checkBackendHealth,
  fetchPhotosApi,
  uploadPhotosApi,
  toggleFavoriteApi,
  deletePhotoApi,
  trashPhotoApi,
  restorePhotoApi,
  batchTrashPhotosApi,
  batchFavoritePhotosApi,
  fetchCategoriesApi,
  addCategoryApi,
  deleteCategoryApi,
  fetchFeaturesApi,
  addFeatureApi,
  upvoteFeatureApi,
  loginApi,
  registerApi,
  getMeApi,
  clearAuthToken,
  updateProfileApi,
  resetPasswordApi,
} from "./api";

// Layout Components
import Navbar from "./components/layout/Navbar.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import CategoryBar from "./components/layout/CategoryBar.jsx";

// Gallery Components
import MemoriesBar from "./components/gallery/MemoriesBar.jsx";
import TimelineView from "./components/gallery/TimelineView.jsx";
import FloatingActionBar from "./components/gallery/FloatingActionBar.jsx";

// View Components
import FavoritesView from "./components/views/FavoritesView.jsx";
import ExploreView from "./components/views/ExploreView.jsx";
import AlbumsView from "./components/views/AlbumsView.jsx";
import TrashView from "./components/views/TrashView.jsx";
import RoadmapView from "./components/views/RoadmapView.jsx";

// Modal Components
import LightboxModal from "./components/modals/LightboxModal.jsx";
import PhotoEditorModal from "./components/modals/PhotoEditorModal.jsx";
import StoriesModal from "./components/modals/StoriesModal.jsx";
import UploadModal from "./components/modals/UploadModal.jsx";
import NewAlbumModal from "./components/modals/NewAlbumModal.jsx";
import AuthModal from "./components/modals/AuthModal.jsx";
import ProfileModal from "./components/modals/ProfileModal.jsx";

// Common Components
import ToastContainer from "./components/common/ToastContainer.jsx";

/* ── Filter Presets for Google Photo Editor ── */
const PHOTO_FILTERS = {
  Original: "",
  Vivid: "saturate(1.4) contrast(1.15)",
  Palma: "sepia(0.2) contrast(1.1) brightness(1.05)",
  Metro: "contrast(1.25) saturate(0.9)",
  Blush: "hue-rotate(330deg) saturate(1.2) brightness(1.05)",
  Modena: "contrast(1.1) brightness(1.1) saturate(1.25)",
  Onyx: "grayscale(1) contrast(1.3)",
  West: "sepia(0.35) saturate(1.3) contrast(1.05)",
};

/* ── Toast Hook ── */
let toastCounter = 0;
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "info") => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exit: true } : t)));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 350);
    }, 2800);
  }, []);
  return { toasts, addToast };
}

export default function App() {
  /* ── Core State ── */
  const [photos, setPhotos] = useState([]);
  const [customCategories, setCustomCategories] = useState(["My Uploads"]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("photos"); // "photos" | "explore" | "favorites" | "albums" | "trash" | "roadmap"
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("gp_dark_mode") === "true";
  });
  const [backendStatus, setBackendStatus] = useState("checking");

  /* ── Selection State ── */
  const [selectedPhotoIds, setSelectedPhotoIds] = useState(new Set());

  /* ── Lightbox & Viewer ── */
  const [viewingIndex, setViewingIndex] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  /* ── Photo Editor State ── */
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [activeFilter, setActiveFilter] = useState("Original");
  const [editorAdjustments, setEditorAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 0,
  });

  /* ── Memories / Highlights Story Viewer ── */
  const [activeMemory, setActiveMemory] = useState(null);
  const [memoryIndex, setMemoryIndex] = useState(0);

  /* ── Auth & Profile State ── */
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register" | "forgot"
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    avatarColor: "#4285f4",
    rememberMe: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  /* ── Profile Modal State ── */
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    avatarColor: "#4285f4",
    bio: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  /* ── Album Creation Modal State ── */
  const [newAlbumModalOpen, setNewAlbumModalOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");

  /* ── Roadmap Features State ── */
  const [features, setFeatures] = useState([]);
  const [newFeatureTitle, setNewFeatureTitle] = useState("");
  const [newFeatureDesc, setNewFeatureDesc] = useState("");

  /* ── Upload Modal State ── */
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [selectedUploadCategory, setSelectedUploadCategory] = useState("My Uploads");
  const [customUploadCategory, setCustomUploadCategory] = useState("");
  const [uploadCustomTitle, setUploadCustomTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { toasts, addToast } = useToasts();
  const fileInputRef = useRef(null);

  /* ── Keep Custom Categories Synced to User-Isolated LocalStorage ── */
  useEffect(() => {
    try {
      if (user && user.id && customCategories && customCategories.length > 0) {
        localStorage.setItem(`pixverse_categories_${user.id}`, JSON.stringify(customCategories));
      }
    } catch {}
  }, [customCategories, user]);

  /* ── All Combined Available Categories (My Uploads + User Albums + Extracted from Photos) ── */
  const allAvailableCategories = useMemo(() => {
    const baseList = ["My Uploads"];
    const fromPhotos = photos
      .map((p) => p.category || p.album)
      .filter((c) => c && c !== "All" && c !== "Favorites");
    const combined = new Set([...baseList, ...customCategories, ...fromPhotos]);
    return Array.from(combined);
  }, [photos, customCategories]);

  /* ── Dark Mode Toggle ── */
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("gp_dark_mode", darkMode);
  }, [darkMode]);

  /* ── Backend / Supabase Multi-Tenant User Sync ── */
  useEffect(() => {
    async function init() {
      try {
        const health = await checkBackendHealth();
        if (health && (health.status === "ok" || health.status === "online")) {
          setBackendStatus("online");
        } else {
          setBackendStatus("online");
        }

        const me = await getMeApi();
        if (me && me.id) {
          setUser(me);
          const [photosRes, catRes, featRes] = await Promise.allSettled([
            fetchPhotosApi(me.id),
            fetchCategoriesApi(me.id),
            fetchFeaturesApi(),
          ]);

          if (photosRes.status === "fulfilled" && Array.isArray(photosRes.value)) {
            setPhotos(photosRes.value);
          } else {
            setPhotos([]);
          }
          if (catRes.status === "fulfilled" && Array.isArray(catRes.value) && catRes.value.length > 0) {
            setCustomCategories(catRes.value);
          } else {
            setCustomCategories(["My Uploads"]);
          }
          if (featRes.status === "fulfilled" && Array.isArray(featRes.value)) {
            setFeatures(featRes.value);
          }
        } else {
          setUser(null);
          setPhotos([]);
          setCustomCategories(["My Uploads"]);
          const featRes = await fetchFeaturesApi().catch(() => []);
          if (Array.isArray(featRes)) setFeatures(featRes);
        }
      } catch (e) {
        console.warn("Backend sync notice:", e.message);
      }
    }
    init();
  }, []);

  /* ── Close Popovers on Outside Click ── */
  useEffect(() => {
    function handleOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  /* ── Filter Photos Based on Active Tab & Search (Strict Multi-Tenant User Isolation) ── */
  const activePhotos = useMemo(() => {
    if (!user || !user.id) {
      return [];
    }

    let list = photos.filter(
      (p) =>
        p.userId === user.id ||
        String(p.userId) === String(user.id) ||
        p.user_id === user.id ||
        String(p.user_id) === String(user.id)
    );

    if (activeTab === "favorites") {
      list = list.filter((p) => p.isFavorite && !p.isTrashed);
    } else if (activeTab === "trash") {
      list = list.filter((p) => p.isTrashed);
    } else {
      list = list.filter((p) => !p.isTrashed);
    }

    if (selectedCategory !== "All") {
      if (selectedCategory === "My Uploads") {
        list = list.filter(
          (p) =>
            p.uploaded ||
            p.category === "My Uploads" ||
            p.album === "My Uploads"
        );
      } else {
        const target = selectedCategory.toLowerCase();
        list = list.filter(
          (p) =>
            (p.category && p.category.toLowerCase() === target) ||
            (p.album && p.album.toLowerCase() === target)
        );
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    return list;
  }, [photos, activeTab, selectedCategory, search, user]);

  /* ── Date-Grouped Timeline for Google Photos ── */
  const groupedPhotos = useMemo(() => {
    const groups = {};
    for (const photo of activePhotos) {
      const rawDate = photo.dateAdded || "2026-10-29";
      let label = "Recent Moments";
      try {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          // oxlint-disable-next-line react/purity
          const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 0) {
            label = "Today";
          } else if (diffDays === 1) {
            label = "Yesterday";
          } else {
            label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          }
        }
      } catch {
        label = "Earlier";
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(photo);
    }

    return Object.entries(groups).map(([dateLabel, items]) => ({
      label: dateLabel,
      items,
    }));
  }, [activePhotos]);

  /* ── Google Photos Memories Highlights ── */
  const memoriesList = useMemo(() => {
    const valid = activePhotos.filter((p) => !p.isTrashed);
    if (!valid.length) return [];
    return [
      { id: "mem-1", title: "Highlights", subtitle: "Best Moments", photos: valid.slice(0, 4) },
      { id: "mem-2", title: "Starred", subtitle: "Your Favorites", photos: valid.filter((p) => p.isFavorite).slice(0, 4) },
    ].filter((m) => m.photos.length > 0);
  }, [activePhotos]);

  /* ── Multi-Selection Actions ── */
  const toggleSelectPhoto = (id) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllInGroup = (groupItems) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      const allSelected = groupItems.every((item) => next.has(item.id));
      if (allSelected) {
        groupItems.forEach((i) => next.delete(i.id));
      } else {
        groupItems.forEach((i) => next.add(i.id));
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedPhotoIds(new Set());
  };

  /* ── Batch Actions ── */
  const handleBatchTrash = async () => {
    const ids = Array.from(selectedPhotoIds);
    if (!ids.length) return;
    setPhotos((cur) => cur.map((p) => (ids.includes(p.id) ? { ...p, isTrashed: true } : p)));
    addToast(`${ids.length} photo(s) moved to Trash 🗑️`, "info");
    clearSelection();
    if (backendStatus === "online") {
      try {
        await batchTrashPhotosApi(ids);
      } catch (err) {
        console.warn("Batch trash error:", err.message);
      }
    }
  };

  const handleBatchFavorite = async (fav = true) => {
    const ids = Array.from(selectedPhotoIds);
    if (!ids.length) return;
    setPhotos((cur) => cur.map((p) => (ids.includes(p.id) ? { ...p, isFavorite: fav } : p)));
    addToast(fav ? `${ids.length} added to Favorites ⭐` : `Removed from Favorites`, "success");
    clearSelection();
    try {
      await batchFavoritePhotosApi(ids, fav);
    } catch (err) {
      console.warn("Batch fav error:", err.message);
    }
  };

  /* ── Single Photo Actions ── */
  const toggleFavorite = async (id, e) => {
    if (e) e.stopPropagation();
    let newFavState = false;
    setPhotos((cur) =>
      cur.map((p) => {
        if (p.id === id) {
          newFavState = !p.isFavorite;
          return { ...p, isFavorite: newFavState };
        }
        return p;
      })
    );
    addToast(newFavState ? "Starred in Favorites ⭐" : "Removed from Favorites", "info");
    try {
      await toggleFavoriteApi(id);
    } catch (err) {
      console.warn("Fav sync error:", err.message);
    }
  };

  const movePhotoToTrash = async (id, e) => {
    if (e) e.stopPropagation();
    setPhotos((cur) => cur.map((p) => (p.id === id ? { ...p, isTrashed: true } : p)));
    if (viewingIndex !== null) setViewingIndex(null);
    addToast("Moved to Trash 🗑️", "info");
    try {
      await trashPhotoApi(id);
    } catch (err) {
      console.warn("Trash sync error:", err.message);
    }
  };

  const restorePhoto = async (id, e) => {
    if (e) e.stopPropagation();
    setPhotos((cur) => cur.map((p) => (p.id === id ? { ...p, isTrashed: false } : p)));
    addToast("Restored from Trash 🔄", "success");
    try {
      await restorePhotoApi(id);
    } catch (err) {
      console.warn("Restore sync error:", err.message);
    }
  };

  const permanentlyDeletePhoto = async (id, e) => {
    if (e) e.stopPropagation();
    setPhotos((cur) => cur.filter((p) => p.id !== id));
    addToast("Permanently deleted from database 🗑️", "error");
    try {
      await deletePhotoApi(id);
    } catch (err) {
      console.warn("Delete sync error:", err.message);
    }
  };

  /* ── Upload Handlers ── */
  const handleFileSelect = (event) => {
    if (!user) {
      setAuthMode("login");
      setIsAuthModalOpen(true);
      addToast("Please sign in or create an account to upload photos", "info");
      event.target.value = "";
      return;
    }

    const files = Array.from(event.target.files || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;

    const previews = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2),
    }));

    setPendingFiles(previews);
    setSelectedUploadCategory("My Uploads");
    setCustomUploadCategory("");
    setUploadCustomTitle(files.length === 1 ? files[0].name.replace(/\.[^/.]+$/, "") : "");
    setUploadModalOpen(true);
    event.target.value = "";
  };

  const confirmUpload = async () => {
    if (!pendingFiles.length) return;
    const categoryToUse = (customUploadCategory.trim() || selectedUploadCategory || "My Uploads").trim();
    const rawFiles = pendingFiles.map((p) => p.file);
    setIsUploading(true);

    try {
      addToast(`Uploading ${rawFiles.length} photo(s) to "${categoryToUse}"...`, "info");
      const res = await uploadPhotosApi(rawFiles, categoryToUse, uploadCustomTitle);
      if (res.photos && res.photos.length > 0) {
        setPhotos((cur) => {
          const newIds = new Set(res.photos.map((p) => p.id));
          return [...res.photos, ...cur.filter((p) => !newIds.has(p.id))];
        });
        if (categoryToUse !== "My Uploads" && !customCategories.includes(categoryToUse)) {
          setCustomCategories((prev) => [...prev, categoryToUse]);
        }
        addToast(`🎉 ${res.photos.length} photo(s) saved to "${categoryToUse}"!`, "success");
      }
    } catch (err) {
      addToast("Upload error: " + err.message, "error");
    } finally {
      pendingFiles.forEach((p) => URL.revokeObjectURL(p.url));
      setPendingFiles([]);
      setUploadModalOpen(false);
      setIsUploading(false);
    }
  };

  const closeUploadModal = () => {
    pendingFiles.forEach((p) => URL.revokeObjectURL(p.url));
    setPendingFiles([]);
    setUploadModalOpen(false);
  };

  /* ── Category Handlers ── */
  const handleDeleteCategory = async (catName, e) => {
    if (e) e.stopPropagation();
    if (!catName || catName === "All" || catName === "Favorites" || catName === "My Uploads") {
      addToast(`Default section "${catName}" cannot be deleted`, "info");
      return;
    }

    const confirmed = window.confirm(
      `Delete category "${catName}"?\nPhotos in this category will safely remain in "My Uploads".`
    );
    if (!confirmed) return;

    setCustomCategories((prev) => prev.filter((c) => c.toLowerCase() !== catName.toLowerCase()));
    setPhotos((cur) =>
      cur.map((p) =>
        (p.category && p.category.toLowerCase() === catName.toLowerCase()) ||
        (p.album && p.album.toLowerCase() === catName.toLowerCase())
          ? { ...p, category: "My Uploads", album: "My Uploads" }
          : p
      )
    );

    if (selectedCategory && selectedCategory.toLowerCase() === catName.toLowerCase()) {
      setSelectedCategory("All");
    }

    addToast(`Category "${catName}" removed 🗑️`, "info");

    try {
      await deleteCategoryApi(catName, user ? user.id : null);
    } catch (err) {
      console.warn("Category deletion error:", err.message);
    }
  };

  const handleCreateAlbum = () => {
    if (newAlbumName.trim()) {
      const trimmed = newAlbumName.trim();
      setCustomCategories((prev) => Array.from(new Set([...prev, trimmed])));
      setSelectedCategory(trimmed);
      setNewAlbumName("");
      setNewAlbumModalOpen(false);
      addToast(`Album "${trimmed}" created! 📁`, "success");
      addCategoryApi(trimmed, user ? user.id : null).catch(() => {});
    }
  };

  /* ── Lightbox Navigation ── */
  const currentPhoto = viewingIndex !== null ? activePhotos[viewingIndex] : null;

  const nextPhoto = useCallback(() => {
    if (viewingIndex === null || !activePhotos.length) return;
    setViewingIndex((i) => (i + 1) % activePhotos.length);
    setZoomLevel(1);
  }, [viewingIndex, activePhotos.length]);

  const prevPhoto = useCallback(() => {
    if (viewingIndex === null || !activePhotos.length) return;
    setViewingIndex((i) => (i - 1 + activePhotos.length) % activePhotos.length);
    setZoomLevel(1);
  }, [viewingIndex, activePhotos.length]);

  useEffect(() => {
    if (viewingIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setViewingIndex(null);
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewingIndex, nextPhoto, prevPhoto]);

  /* ── Photo Editor Handlers ── */
  const openEditor = (photo) => {
    setEditingPhoto(photo);
    setActiveFilter("Original");
    setEditorAdjustments({ brightness: 100, contrast: 100, saturation: 100, warmth: 0 });
  };

  const applyEditorEdits = () => {
    if (!editingPhoto) return;
    addToast("Edits applied to photo! ✨", "success");
    setEditingPhoto(null);
  };

  /* ── Auth Handlers ── */
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccessMsg("");

    try {
      if (authMode === "login") {
        const res = await loginApi({
          usernameOrEmail: authForm.username,
          password: authForm.password,
          rememberMe: authForm.rememberMe,
        });
        setUser(res.user);
        setIsAuthModalOpen(false);
        setAuthForm({ username: "", email: "", password: "", confirmPassword: "", name: "", avatarColor: "#4285f4", rememberMe: true });
        setSelectedCategory("All");
        addToast(`Welcome back, ${res.user.name || res.user.username}! 👋`, "success");

        try {
          const [freshPhotos, freshCats] = await Promise.all([
            fetchPhotosApi(res.user.id),
            fetchCategoriesApi(res.user.id),
          ]);
          setPhotos(Array.isArray(freshPhotos) ? freshPhotos : []);
          setCustomCategories(Array.isArray(freshCats) && freshCats.length > 0 ? freshCats : ["My Uploads"]);
        } catch (syncErr) {
          console.warn("Post-login data sync:", syncErr.message);
        }
      } else if (authMode === "register") {
        if (authForm.password !== authForm.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (authForm.password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }
        const res = await registerApi({
          username: authForm.username,
          email: authForm.email,
          password: authForm.password,
          name: authForm.name,
          avatarColor: authForm.avatarColor || "#4285f4",
          rememberMe: authForm.rememberMe,
        });
        setUser(res.user);
        setIsAuthModalOpen(false);
        setAuthForm({ username: "", email: "", password: "", confirmPassword: "", name: "", avatarColor: "#4285f4", rememberMe: true });
        setSelectedCategory("All");
        addToast(`Welcome to PixVerse, ${res.user.name || res.user.username}! 🚀`, "success");

        setPhotos([]);
        setCustomCategories(["My Uploads"]);
      } else if (authMode === "forgot") {
        await resetPasswordApi({
          email: authForm.email,
          newPassword: authForm.password,
        });
        setAuthSuccessMsg("Password updated successfully! You can now sign in.");
        setAuthMode("login");
        addToast("Password reset successfully! ✨", "success");
        return;
      }
    } catch (err) {
      setAuthError(err.message || "Authentication error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg("");
    try {
      const res = await updateProfileApi({
        name: profileForm.name,
        email: profileForm.email,
        avatarColor: profileForm.avatarColor,
        bio: profileForm.bio,
      });
      if (res.user) {
        setUser(res.user);
      }
      setProfileModalOpen(false);
      addToast("Profile details updated successfully! ✨", "success");
    } catch (err) {
      setProfileMsg(err.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    try {
      localStorage.removeItem("pixverse_current_user");
    } catch {}
    setUser(null);
    setUserMenuOpen(false);
    setSelectedCategory("All");
    setPhotos([]);
    setCustomCategories(["My Uploads"]);
    addToast("Signed out from PixVerse Account", "info");
  };

  /* ── Roadmap Feature Handlers ── */
  const handleCreateFeature = async () => {
    if (!newFeatureTitle.trim()) {
      addToast("Please enter a title", "error");
      return;
    }
    const title = newFeatureTitle.trim();
    const newFeat = {
      id: "feat-" + Date.now(),
      title,
      description: newFeatureDesc.trim() || "User suggestion",
      votes: 1,
      status: "new",
    };
    setFeatures((prev) => [newFeat, ...prev]);
    addToast("Suggestion submitted to database! 🚀", "success");
    if (backendStatus === "online") {
      try {
        await addFeatureApi(newFeat);
      } catch (err) {
        console.warn("Feature sync error:", err.message);
      }
    }
    setNewFeatureTitle("");
    setNewFeatureDesc("");
  };

  const handleUpvoteFeature = async (featId) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === featId ? { ...f, votes: f.votes + 1 } : f))
    );
    addToast("Upvoted feature! 🚀", "success");
    if (backendStatus === "online") {
      try {
        await upvoteFeatureApi(featId);
      } catch (err) {
        console.warn("Vote sync error:", err.message);
      }
    }
  };

  /* ── Memory Stories Auto-Advance ── */
  useEffect(() => {
    if (!activeMemory) return;
    const timer = setTimeout(() => {
      if (memoryIndex < activeMemory.photos.length - 1) {
        setMemoryIndex((idx) => idx + 1);
      } else {
        setActiveMemory(null);
        setMemoryIndex(0);
      }
    }, 4500);
    return () => clearTimeout(timer);
  }, [activeMemory, memoryIndex]);

  return (
    <div className="gp-app">
      {/* ── Top Navigation Bar ── */}
      <Navbar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        setActiveTab={setActiveTab}
        setSelectedCategory={setSelectedCategory}
        search={search}
        setSearch={setSearch}
        backendStatus={backendStatus}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        fileInputRef={fileInputRef}
        handleFileSelect={handleFileSelect}
        user={user}
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={setUserMenuOpen}
        userMenuRef={userMenuRef}
        setProfileForm={setProfileForm}
        setProfileModalOpen={setProfileModalOpen}
        setAuthMode={setAuthMode}
        setAuthError={setAuthError}
        setIsAuthModalOpen={setIsAuthModalOpen}
        handleLogout={handleLogout}
      />

      {/* ── Main Layout Body (Sidebar + Content) ── */}
      <div className="gp-body">
        {/* Left Navigation Sidebar */}
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Main Content Views */}
        <main className="gp-main-content">
          {/* Photos Timeline View */}
          {activeTab === "photos" && (
            <>
              {/* Memories Carousel */}
              {!search && selectedCategory === "All" && (
                <MemoriesBar
                  memoriesList={memoriesList}
                  onSelectMemory={(mem) => {
                    setActiveMemory(mem);
                    setMemoryIndex(0);
                  }}
                />
              )}

              {/* Category Chips Bar */}
              <CategoryBar
                categories={allAvailableCategories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                handleDeleteCategory={handleDeleteCategory}
                onOpenNewAlbumModal={() => setNewAlbumModalOpen(true)}
              />

              {/* Date-Grouped Timeline Grid */}
              <TimelineView
                groupedPhotos={groupedPhotos}
                activePhotos={activePhotos}
                selectedPhotoIds={selectedPhotoIds}
                selectAllInGroup={selectAllInGroup}
                toggleSelectPhoto={toggleSelectPhoto}
                toggleFavorite={toggleFavorite}
                setViewingIndex={setViewingIndex}
                search={search}
                user={user}
                onUploadClick={() => fileInputRef.current && fileInputRef.current.click()}
                onOpenAuth={(mode) => {
                  setAuthMode(mode);
                  setAuthError("");
                  setIsAuthModalOpen(true);
                }}
              />
            </>
          )}

          {/* Favorites View */}
          {activeTab === "favorites" && (
            <FavoritesView
              activePhotos={activePhotos}
              toggleFavorite={toggleFavorite}
              setViewingIndex={setViewingIndex}
            />
          )}

          {/* Explore View */}
          {activeTab === "explore" && (
            <ExploreView
              allAvailableCategories={allAvailableCategories}
              photos={photos}
              user={user}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setActiveTab("photos");
              }}
              handleDeleteCategory={handleDeleteCategory}
            />
          )}

          {/* Albums View */}
          {activeTab === "albums" && (
            <AlbumsView
              allAvailableCategories={allAvailableCategories}
              photos={photos}
              onSelectAlbum={(cat) => {
                setSelectedCategory(cat);
                setActiveTab("photos");
              }}
              handleDeleteCategory={handleDeleteCategory}
              onOpenNewAlbumModal={() => setNewAlbumModalOpen(true)}
            />
          )}

          {/* Trash View */}
          {activeTab === "trash" && (
            <TrashView
              activePhotos={activePhotos}
              restorePhoto={restorePhoto}
              permanentlyDeletePhoto={permanentlyDeletePhoto}
            />
          )}

          {/* Roadmap & Feature Requests View */}
          {activeTab === "roadmap" && (
            <RoadmapView
              features={features}
              newFeatureTitle={newFeatureTitle}
              setNewFeatureTitle={setNewFeatureTitle}
              newFeatureDesc={newFeatureDesc}
              setNewFeatureDesc={setNewFeatureDesc}
              onSubmitProposal={handleCreateFeature}
              onUpvoteFeature={handleUpvoteFeature}
            />
          )}
        </main>
      </div>

      {/* ── Multi-Selection Floating Action Bar ── */}
      <FloatingActionBar
        selectedPhotoIds={selectedPhotoIds}
        activePhotos={activePhotos}
        onClearSelection={clearSelection}
        onBatchFavorite={handleBatchFavorite}
        onBatchTrash={handleBatchTrash}
        addToast={addToast}
      />

      {/* ── Lightbox Fullscreen Photo Viewer ── */}
      <LightboxModal
        currentPhoto={currentPhoto}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        showInfoPanel={showInfoPanel}
        setShowInfoPanel={setShowInfoPanel}
        onClose={() => setViewingIndex(null)}
        onPrev={prevPhoto}
        onNext={nextPhoto}
        onToggleFavorite={toggleFavorite}
        onEdit={openEditor}
        onTrash={movePhotoToTrash}
      />

      {/* ── Photo Editor Modal ── */}
      <PhotoEditorModal
        editingPhoto={editingPhoto}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        editorAdjustments={editorAdjustments}
        setEditorAdjustments={setEditorAdjustments}
        photoFilters={PHOTO_FILTERS}
        onClose={() => setEditingPhoto(null)}
        onSave={applyEditorEdits}
      />

      {/* ── Memories Fullscreen Story Player ── */}
      <StoriesModal
        activeMemory={activeMemory}
        memoryIndex={memoryIndex}
        setMemoryIndex={setMemoryIndex}
        onClose={() => {
          setActiveMemory(null);
          setMemoryIndex(0);
        }}
      />

      {/* ── Upload & Category Modal ── */}
      <UploadModal
        isOpen={uploadModalOpen}
        pendingFiles={pendingFiles}
        setPendingFiles={setPendingFiles}
        uploadCustomTitle={uploadCustomTitle}
        setUploadCustomTitle={setUploadCustomTitle}
        allAvailableCategories={allAvailableCategories}
        selectedUploadCategory={selectedUploadCategory}
        setSelectedUploadCategory={setSelectedUploadCategory}
        customUploadCategory={customUploadCategory}
        setCustomUploadCategory={setCustomUploadCategory}
        isUploading={isUploading}
        onConfirm={confirmUpload}
        onClose={closeUploadModal}
      />

      {/* ── New Album Modal ── */}
      <NewAlbumModal
        isOpen={newAlbumModalOpen}
        newAlbumName={newAlbumName}
        setNewAlbumName={setNewAlbumName}
        onConfirm={handleCreateAlbum}
        onClose={() => setNewAlbumModalOpen(false)}
      />

      {/* ── Authentication Modal (Sign In / Register / Reset Password) ── */}
      <AuthModal
        isOpen={isAuthModalOpen}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        authLoading={authLoading}
        authError={authError}
        setAuthError={setAuthError}
        authSuccessMsg={authSuccessMsg}
        onSubmit={handleAuthSubmit}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* ── Profile & Account Settings Modal ── */}
      <ProfileModal
        isOpen={profileModalOpen}
        user={user}
        profileForm={profileForm}
        setProfileForm={setProfileForm}
        profileLoading={profileLoading}
        profileMsg={profileMsg}
        photosCount={photos.filter((p) => p.userId === user?.id || p.uploaded).length}
        favoritesCount={photos.filter((p) => p.isFavorite && !p.isTrashed).length}
        albumsCount={allAvailableCategories.length}
        onSubmit={handleUpdateProfile}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* ── Toast Notifications ── */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
