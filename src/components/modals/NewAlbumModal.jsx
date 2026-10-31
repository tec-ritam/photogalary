export default function NewAlbumModal({
  isOpen,
  newAlbumName,
  setNewAlbumName,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="gp-modal-backdrop" onClick={onClose}>
      <div className="gp-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="gp-modal-header">
          <h3>Create new album</h3>
          <button className="gp-icon-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p>Add a new category or collection to organize your photos</p>
        <input
          type="text"
          className="gp-modal-input"
          placeholder="Album title (e.g., Summer Trip, Family, Pets)"
          value={newAlbumName}
          autoFocus
          onChange={(e) => setNewAlbumName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newAlbumName.trim()) {
              onConfirm();
            }
          }}
        />
        <div className="gp-modal-actions">
          <button className="gp-btn-text" onClick={onClose}>
            Cancel
          </button>
          <button className="gp-btn-primary" onClick={onConfirm}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
