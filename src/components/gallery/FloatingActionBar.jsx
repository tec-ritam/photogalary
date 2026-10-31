export default function FloatingActionBar({
  selectedPhotoIds,
  activePhotos,
  onClearSelection,
  onBatchFavorite,
  onBatchTrash,
  addToast,
}) {
  if (!selectedPhotoIds || selectedPhotoIds.size === 0) return null;

  const handleDownloadSelected = () => {
    const selectedList = activePhotos.filter((p) => selectedPhotoIds.has(p.id));
    selectedList.forEach((p) => {
      const a = document.createElement("a");
      a.href = p.url;
      a.download = p.title || "photo";
      a.target = "_blank";
      a.click();
    });
    if (addToast) {
      addToast(`Downloading ${selectedList.length} photos...`, "info");
    }
  };

  return (
    <div className="gp-floating-action-bar">
      <div className="gp-selection-count">
        <button
          className="gp-icon-btn"
          onClick={onClearSelection}
          title="Close selection"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <strong>{selectedPhotoIds.size} selected</strong>
      </div>

      <div className="gp-floating-actions">
        <button
          className="gp-icon-btn"
          onClick={() => onBatchFavorite(true)}
          title="Add to Favorites"
        >
          <span className="material-symbols-outlined">star</span>
        </button>
        <button
          className="gp-icon-btn"
          onClick={onBatchTrash}
          title="Move selected to Trash"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
        <button
          className="gp-icon-btn"
          onClick={handleDownloadSelected}
          title="Download selected"
        >
          <span className="material-symbols-outlined">download</span>
        </button>
      </div>
    </div>
  );
}
