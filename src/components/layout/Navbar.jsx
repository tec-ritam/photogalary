import PixVerseLogo from "../common/PixVerseLogo.jsx";

export default function Navbar({
  sidebarCollapsed,
  setSidebarCollapsed,
  setActiveTab,
  setSelectedCategory,
  search,
  setSearch,
  backendStatus,
  darkMode,
  setDarkMode,
  fileInputRef,
  handleFileSelect,
  user,
  userMenuOpen,
  setUserMenuOpen,
  userMenuRef,
  setProfileForm,
  setProfileModalOpen,
  setAuthMode,
  setAuthError,
  setIsAuthModalOpen,
  handleLogout,
}) {
  return (
    <header className="gp-appbar">
      <div className="gp-appbar-left">
        <button
          className="gp-icon-btn gp-menu-toggle"
          onClick={() => setSidebarCollapsed((c) => !c)}
          title="Main menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div
          className="gp-logo"
          onClick={() => {
            setActiveTab("photos");
            setSelectedCategory("All");
          }}
        >
          <PixVerseLogo size={36} />
          <span className="gp-logo-text">
            Pix<span className="gp-logo-subtext">Verse</span>
          </span>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="gp-search-wrapper">
        <div className="gp-search-box">
          <span className="material-symbols-outlined gp-search-icon">search</span>
          <input
            type="text"
            placeholder="Search your photos, people, places, documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="gp-search-clear"
              onClick={() => setSearch("")}
              title="Clear search"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Appbar Right Controls ── */}
      <div className="gp-appbar-right">
        {/* Cloud Sync Status */}
        <div
          className={`gp-sync-badge ${backendStatus}`}
          title={
            backendStatus === "online"
              ? "SQLite Cloud Sync: Online"
              : "Backend Offline (Local Cache)"
          }
        >
          <span className="material-symbols-outlined gp-sync-icon">
            {backendStatus === "online" ? "cloud_done" : "cloud_off"}
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          className="gp-icon-btn"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          <span className="material-symbols-outlined">
            {darkMode ? "light_mode" : "dark_mode"}
          </span>
        </button>

        {/* Upload Button */}
        <button
          className="gp-upload-btn"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          title="Upload photos to database"
        >
          <span className="material-symbols-outlined">cloud_upload</span>
          <span className="gp-upload-btn-text">Upload</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFileSelect}
        />

        {/* PixVerse Account Profile Button */}
        {user ? (
          <div className="gp-user-menu-wrapper" ref={userMenuRef}>
            <button
              className="gp-avatar-btn"
              onClick={() => setUserMenuOpen((o) => !o)}
              title={`PixVerse Account: ${user.name || user.username} (${user.email})`}
            >
              <div
                className="gp-avatar-ring"
                style={{ backgroundColor: user.avatarColor || "#4285f4" }}
              >
                <span className="gp-avatar-letter">
                  {(user.name || user.username || "P").charAt(0).toUpperCase()}
                </span>
              </div>
            </button>

            {userMenuOpen && (
              <div className="gp-account-popover">
                <div className="gp-account-header">
                  <div
                    className="gp-account-avatar-large"
                    style={{ backgroundColor: user.avatarColor || "#4285f4" }}
                  >
                    {(user.name || user.username || "P").charAt(0).toUpperCase()}
                  </div>
                  <h4>{user.name || user.username}</h4>
                  <span className="gp-account-email">{user.email}</span>
                  <span className="gp-account-pill">{user.role || "PixVerse Member"}</span>
                </div>

                <div className="gp-popover-divider" />

                <button
                  className="gp-popover-item"
                  onClick={() => {
                    setActiveTab("photos");
                    setSelectedCategory("My Uploads");
                    setUserMenuOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined">collections</span>
                  My Uploaded Photos
                </button>

                <button
                  className="gp-popover-item"
                  onClick={() => {
                    setProfileForm({
                      name: user.name || "",
                      email: user.email || "",
                      avatarColor: user.avatarColor || "#4285f4",
                      bio: user.bio || "",
                    });
                    setProfileModalOpen(true);
                    setUserMenuOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined">manage_accounts</span>
                  Manage Account & Profile
                </button>

                <button
                  className="gp-popover-item"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                    setIsAuthModalOpen(true);
                    setUserMenuOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined">switch_account</span>
                  Switch or Add Account
                </button>

                <button
                  className="gp-popover-item gp-logout-item"
                  onClick={handleLogout}
                >
                  <span className="material-symbols-outlined">logout</span>
                  Sign out of PixVerse Account
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="gp-signin-btn"
            onClick={() => {
              setAuthMode("login");
              setAuthError("");
              setIsAuthModalOpen(true);
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>
              account_circle
            </span>
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
