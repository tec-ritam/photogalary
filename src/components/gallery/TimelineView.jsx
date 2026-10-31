import PhotoCard from "./PhotoCard.jsx";
import EmptyState from "../common/EmptyState.jsx";

export default function TimelineView({
  groupedPhotos,
  activePhotos,
  selectedPhotoIds,
  selectAllInGroup,
  toggleSelectPhoto,
  toggleFavorite,
  setViewingIndex,
  search,
  user,
  onUploadClick,
  onOpenAuth,
}) {
  if (!groupedPhotos || groupedPhotos.length === 0) {
    return (
      <EmptyState
        icon={search ? "search_off" : user ? "photo_library" : "lock_open"}
        title={
          search
            ? "No photos found"
            : user
            ? `Welcome, ${user.name || user.username}!`
            : "Sign in to your private photo library"
        }
        description={
          search
            ? `No photos matching "${search}". Try different search terms.`
            : user
            ? "Your photo gallery is fresh and completely isolated. Upload your photos to start building your personal albums!"
            : "Sign in or create a personal account to view, organize, and upload your private photos securely."
        }
      >
        {user ? (
          !search && (
            <button
              type="button"
              className="gp-btn-primary"
              style={{
                marginTop: "1.25rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 22px",
                fontSize: "14px",
                borderRadius: "24px",
              }}
              onClick={onUploadClick}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                upload
              </span>
              Upload Your First Photo
            </button>
          )
        ) : (
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              marginTop: "1.25rem",
            }}
          >
            <button
              type="button"
              className="gp-btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 18px",
                borderRadius: "20px",
              }}
              onClick={() => onOpenAuth("login")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                login
              </span>
              Sign In
            </button>
            <button
              type="button"
              className="gp-btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 18px",
                borderRadius: "20px",
              }}
              onClick={() => onOpenAuth("register")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                person_add
              </span>
              Create Account
            </button>
          </div>
        )}
      </EmptyState>
    );
  }

  return (
    <div className="gp-timeline">
      {groupedPhotos.map((group) => (
        <div key={group.label} className="gp-timeline-group">
          <div className="gp-group-header">
            <div className="gp-group-title-row">
              <button
                className="gp-group-select-btn"
                onClick={() => selectAllInGroup(group.items)}
                title="Select all photos in this group"
              >
                <span className="material-symbols-outlined">
                  {group.items.every((i) => selectedPhotoIds.has(i.id))
                    ? "check_circle"
                    : "radio_button_unchecked"}
                </span>
              </button>
              <h3 className="gp-group-date">{group.label}</h3>
              <span className="gp-group-count">{group.items.length} photos</span>
            </div>
          </div>

          <div className="gp-photo-grid">
            {group.items.map((photo) => {
              const isSelected = selectedPhotoIds.has(photo.id);
              const globalIdx = activePhotos.findIndex((p) => p.id === photo.id);
              return (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  isSelected={isSelected}
                  onSelect={toggleSelectPhoto}
                  onToggleFavorite={toggleFavorite}
                  onClick={() => setViewingIndex(globalIdx)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
