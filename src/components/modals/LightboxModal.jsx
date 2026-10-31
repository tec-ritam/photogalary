export default function LightboxModal({
  currentPhoto,
  zoomLevel,
  setZoomLevel,
  showInfoPanel,
  setShowInfoPanel,
  onClose,
  onPrev,
  onNext,
  onToggleFavorite,
  onEdit,
  onTrash,
}) {
  if (!currentPhoto) return null;

  return (
    <div className="gp-lightbox-overlay">
      {/* Top Control Bar */}
      <div className="gp-lightbox-topbar">
        <button
          className="gp-icon-btn"
          onClick={onClose}
          title="Back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <div className="gp-lightbox-title-group">
          <h3>{currentPhoto.title}</h3>
          <span>{currentPhoto.dateAdded}</span>
        </div>

        <div className="gp-lightbox-actions">
          <button
            className="gp-icon-btn"
            onClick={() => setZoomLevel((z) => Math.min(3, z + 0.3))}
            title="Zoom In"
          >
            <span className="material-symbols-outlined">zoom_in</span>
          </button>
          <button
            className="gp-icon-btn"
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.3))}
            title="Zoom Out"
          >
            <span className="material-symbols-outlined">zoom_out</span>
          </button>
          <button
            className="gp-icon-btn"
            onClick={() => setZoomLevel(1)}
            title="Reset Zoom"
          >
            <span className="material-symbols-outlined">restart_alt</span>
          </button>

          <button
            className={`gp-icon-btn ${currentPhoto.isFavorite ? "active" : ""}`}
            onClick={() => onToggleFavorite(currentPhoto.id)}
            title="Favorite"
          >
            <span className="material-symbols-outlined">
              {currentPhoto.isFavorite ? "star" : "star_border"}
            </span>
          </button>

          <button
            className="gp-icon-btn"
            onClick={() => onEdit(currentPhoto)}
            title="Edit Photo (Filters & Adjustments)"
          >
            <span className="material-symbols-outlined">tune</span>
          </button>

          <button
            className="gp-icon-btn"
            onClick={() => setShowInfoPanel((p) => !p)}
            title="Info / EXIF Details"
          >
            <span className="material-symbols-outlined">info</span>
          </button>

          <button
            className="gp-icon-btn"
            onClick={() => onTrash(currentPhoto.id)}
            title="Move to Trash"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>

          <a
            className="gp-icon-btn"
            href={currentPhoto.url}
            download={currentPhoto.title}
            target="_blank"
            rel="noreferrer"
            title="Download"
          >
            <span className="material-symbols-outlined">download</span>
          </a>
        </div>
      </div>

      {/* Main Photo Center */}
      <div className="gp-lightbox-canvas">
        <button
          className="gp-nav-arrow gp-arrow-left"
          onClick={onPrev}
          title="Previous photo"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>

        <div className="gp-lightbox-img-wrapper">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.title}
            style={{ transform: `scale(${zoomLevel})` }}
          />
        </div>

        <button
          className="gp-nav-arrow gp-arrow-right"
          onClick={onNext}
          title="Next photo"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      {/* Right Info Panel Drawer */}
      {showInfoPanel && (
        <aside className="gp-info-drawer">
          <div className="gp-info-header">
            <h3>Info</h3>
            <button
              className="gp-icon-btn"
              onClick={() => setShowInfoPanel(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="gp-info-body">
            <div className="gp-info-item">
              <span className="material-symbols-outlined">calendar_today</span>
              <div>
                <strong>Date & Time</strong>
                <p>{currentPhoto.dateAdded || "Today"}</p>
              </div>
            </div>

            <div className="gp-info-item">
              <span className="material-symbols-outlined">image</span>
              <div>
                <strong>File Name</strong>
                <p>{currentPhoto.title}.jpg</p>
              </div>
            </div>

            <div className="gp-info-item">
              <span className="material-symbols-outlined">category</span>
              <div>
                <strong>Category / Album</strong>
                <p>{currentPhoto.category || "General"}</p>
              </div>
            </div>

            <div className="gp-info-item">
              <span className="material-symbols-outlined">person</span>
              <div>
                <strong>Uploaded By</strong>
                <p>{currentPhoto.uploaderName || "Community"}</p>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
