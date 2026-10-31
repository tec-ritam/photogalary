export default function AlbumsView({
  allAvailableCategories,
  photos,
  onSelectAlbum,
  handleDeleteCategory,
  onOpenNewAlbumModal,
}) {
  return (
    <div className="gp-albums-view">
      <div
        className="gp-view-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2>📁 Albums</h2>
          <p>Your curated photo collections stored in SQLite</p>
        </div>
        <button className="gp-upload-btn" onClick={onOpenNewAlbumModal}>
          <span className="material-symbols-outlined">add</span>
          New Album
        </button>
      </div>

      <div className="gp-albums-grid">
        {allAvailableCategories.map((catName) => {
          const albumPhotos = photos.filter(
            (p) =>
              !p.isTrashed &&
              (p.category === catName || p.album === catName)
          );
          const cover =
            albumPhotos[0]?.url ||
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600";

          return (
            <div
              key={catName}
              className="gp-album-item"
              onClick={() => onSelectAlbum(catName)}
            >
              <div className="gp-album-cover">
                <img src={cover} alt={catName} />
                {catName !== "My Uploads" && (
                  <button
                    className="gp-card-delete-category-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(catName, e);
                    }}
                    title={`Delete album "${catName}"`}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                )}
              </div>
              <div className="gp-album-meta">
                <h4>{catName}</h4>
                <span>{albumPhotos.length} items</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
