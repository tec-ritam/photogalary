export default function UploadModal({
  isOpen,
  pendingFiles,
  setPendingFiles,
  uploadCustomTitle,
  setUploadCustomTitle,
  allAvailableCategories,
  selectedUploadCategory,
  setSelectedUploadCategory,
  customUploadCategory,
  setCustomUploadCategory,
  isUploading,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="gp-modal-backdrop"
      onClick={() => !isUploading && onClose()}
    >
      <div
        className="gp-modal-card gp-upload-dialog-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gp-modal-header">
          <div className="gp-upload-modal-title">
            <span className="material-symbols-outlined gp-upload-icon-pulse">
              cloud_upload
            </span>
            <div>
              <h3>Upload to PixVerse</h3>
              <p>
                {pendingFiles.length} photo
                {pendingFiles.length > 1 ? "s" : ""} selected
              </p>
            </div>
          </div>
          <button
            className="gp-icon-btn"
            onClick={onClose}
            disabled={isUploading}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Thumbnail previews */}
        <div className="gp-upload-preview-strip">
          {pendingFiles.map((p, idx) => (
            <div key={idx} className="gp-upload-thumb-item">
              <img src={p.url} alt={p.name} />
              <span className="gp-upload-thumb-name" title={p.name}>
                {p.name}
              </span>
            </div>
          ))}
        </div>

        {/* Custom Title (Optional) */}
        <div className="gp-input-field" style={{ marginTop: "14px" }}>
          <label>Photo Title (Optional)</label>
          <input
            type="text"
            placeholder={
              pendingFiles[0]?.name.replace(/\.[^/.]+$/, "") || "Custom title"
            }
            value={uploadCustomTitle}
            onChange={(e) => setUploadCustomTitle(e.target.value)}
          />
        </div>

        {/* Category Selector with Default = "My Uploads" */}
        <div className="gp-upload-category-section">
          <label className="gp-upload-category-label">
            Choose Category / Album:
            <span className="gp-default-badge">(Default: My Uploads)</span>
          </label>

          <div className="gp-category-chips-selector">
            {allAvailableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`gp-category-select-pill ${
                  selectedUploadCategory === cat && !customUploadCategory
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setSelectedUploadCategory(cat);
                  setCustomUploadCategory("");
                }}
              >
                {cat === "My Uploads"
                  ? "📁 My Uploads"
                  : cat === "Nature"
                  ? "🌿 Nature"
                  : cat === "Travel"
                  ? "✈️ Travel"
                  : cat === "Architecture"
                  ? "🏛️ Architecture"
                  : `📁 ${cat}`}
              </button>
            ))}
          </div>

          {/* Or Create / Enter Custom Category */}
          <div className="gp-custom-cat-input-group">
            <span className="material-symbols-outlined">add_circle_outline</span>
            <input
              type="text"
              placeholder="Or type a new album / category name..."
              value={customUploadCategory}
              onChange={(e) => setCustomUploadCategory(e.target.value)}
            />
          </div>
        </div>

        <div className="gp-modal-actions" style={{ marginTop: "20px" }}>
          <button
            type="button"
            className="gp-btn-text"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="gp-btn-primary gp-upload-confirm-btn"
            onClick={onConfirm}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <span className="material-symbols-outlined gp-spin">
                  progress_activity
                </span>
                Uploading...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">cloud_upload</span>
                Upload Photos
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
