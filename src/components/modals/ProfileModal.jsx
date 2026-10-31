export default function ProfileModal({
  isOpen,
  user,
  profileForm,
  setProfileForm,
  profileLoading,
  profileMsg,
  photosCount = 0,
  favoritesCount = 0,
  albumsCount = 0,
  onSubmit,
  onClose,
}) {
  if (!isOpen || !user) return null;

  return (
    <div className="gp-modal-backdrop" onClick={onClose}>
      <div
        className="gp-modal-card gp-profile-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gp-modal-header">
          <h3>Manage PixVerse Account</h3>
          <button className="gp-icon-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Profile Overview Banner */}
        <div className="gp-profile-banner">
          <div
            className="gp-profile-avatar-large"
            style={{
              backgroundColor:
                profileForm.avatarColor || user.avatarColor || "#4285f4",
            }}
          >
            {(profileForm.name || user.name || user.username || "P")
              .charAt(0)
              .toUpperCase()}
          </div>
          <div className="gp-profile-banner-info">
            <h4>{user.name || user.username}</h4>
            <span className="gp-profile-banner-email">{user.email}</span>
            <span className="gp-profile-banner-badge">
              {user.role || "PixVerse Member"}
            </span>
          </div>
        </div>

        {/* Account Quick Stats */}
        <div className="gp-profile-stats-grid">
          <div className="gp-profile-stat-box">
            <span className="material-symbols-outlined">cloud_done</span>
            <div>
              <strong>{photosCount}</strong>
              <span>Your Photos</span>
            </div>
          </div>
          <div className="gp-profile-stat-box">
            <span className="material-symbols-outlined">star</span>
            <div>
              <strong>{favoritesCount}</strong>
              <span>Favorites</span>
            </div>
          </div>
          <div className="gp-profile-stat-box">
            <span className="material-symbols-outlined">folder</span>
            <div>
              <strong>{albumsCount}</strong>
              <span>Albums</span>
            </div>
          </div>
        </div>

        {profileMsg && <div className="gp-auth-error">⚠️ {profileMsg}</div>}

        {/* Profile Edit Form */}
        <form onSubmit={onSubmit} className="gp-profile-edit-form">
          <div className="gp-input-field">
            <label>Display Name</label>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm({ ...profileForm, name: e.target.value })
              }
            />
          </div>

          <div className="gp-input-field">
            <label>Email Address</label>
            <input
              type="email"
              required
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm({ ...profileForm, email: e.target.value })
              }
            />
          </div>

          <div className="gp-input-field">
            <label>Avatar Color Theme</label>
            <div className="gp-color-swatches">
              {[
                "#4285f4",
                "#ea4335",
                "#fbbc04",
                "#34a853",
                "#7928ca",
                "#00acc1",
                "#e91e63",
                "#ff6d00",
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`gp-color-circle ${
                    profileForm.avatarColor === c ? "active" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() =>
                    setProfileForm({ ...profileForm, avatarColor: c })
                  }
                >
                  {profileForm.avatarColor === c && (
                    <span className="material-symbols-outlined">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="gp-modal-actions" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="gp-btn-text"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gp-btn-primary"
              disabled={profileLoading}
            >
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
