import EmptyState from "../common/EmptyState.jsx";

export default function TrashView({
  activePhotos,
  restorePhoto,
  permanentlyDeletePhoto,
}) {
  return (
    <div className="gp-trash-view">
      <div className="gp-view-header">
        <h2>🗑️ Trash</h2>
        <p>Items in trash can be restored or permanently removed from SQLite database</p>
      </div>

      {activePhotos.length > 0 ? (
        <div className="gp-photo-grid">
          {activePhotos.map((photo) => (
            <div key={photo.id} className="gp-photo-card gp-trashed-card">
              <img src={photo.url} alt={photo.title} />
              <div className="gp-trash-actions">
                <button
                  className="gp-btn-restore"
                  onClick={(e) => {
                    e.stopPropagation();
                    restorePhoto(photo.id, e);
                  }}
                  title="Restore photo"
                >
                  <span className="material-symbols-outlined">restore</span>
                  Restore
                </button>
                <button
                  className="gp-btn-delete-perm"
                  onClick={(e) => {
                    e.stopPropagation();
                    permanentlyDeletePhoto(photo.id, e);
                  }}
                  title="Delete permanently"
                >
                  <span className="material-symbols-outlined">delete_forever</span>
                  Delete
                </button>
              </div>
              <div className="gp-photo-bottom-info">
                <span>{photo.title}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="delete_outline"
          title="Trash is empty"
          description="Photos you delete will appear here before being permanently erased."
        />
      )}
    </div>
  );
}
