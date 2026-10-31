export default function CategoryBar({
  categories,
  selectedCategory,
  setSelectedCategory,
  handleDeleteCategory,
  onOpenNewAlbumModal,
}) {
  const allChips = Array.from(new Set(["All", "Favorites", ...(categories || [])]));

  return (
    <div className="gp-filter-chips">
      {allChips.map((cat) => {
        const isDeletable = cat !== "All" && cat !== "Favorites" && cat !== "My Uploads";
        return (
          <div key={cat} className="gp-filter-chip-wrapper">
            <button
              className={`gp-filter-chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "Favorites" ? "⭐ Favorites" : cat === "My Uploads" ? "📁 My Uploads" : cat}
            </button>
            {isDeletable && (
              <button
                className="gp-delete-chip-btn"
                onClick={(e) => handleDeleteCategory(cat, e)}
                title={`Delete category "${cat}"`}
              >
                ×
              </button>
            )}
          </div>
        );
      })}
      <button
        className="gp-filter-chip gp-add-album-chip"
        onClick={onOpenNewAlbumModal}
        title="Create new category or album"
      >
        + New Album
      </button>
    </div>
  );
}
