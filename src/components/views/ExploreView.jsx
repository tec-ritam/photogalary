export default function ExploreView({
  allAvailableCategories,
  photos,
  user,
  onSelectCategory,
  handleDeleteCategory,
}) {
  return (
    <div className="gp-explore-view">
      <div className="gp-view-header">
        <h2>🧭 Explore</h2>
        <p>Browse and discover photos categorized by themes, albums, and uploads</p>
      </div>

      <div className="gp-explore-grid">
        {allAvailableCategories.map((catName) => {
          const matching = photos.filter(
            (p) =>
              !p.isTrashed &&
              (p.category === catName ||
                (catName === "My Uploads" && (p.uploaded || (user && p.userId === user.id))))
          );
          const cover =
            matching[0]?.url ||
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600";

          const iconName =
            catName === "My Uploads"
              ? "cloud_upload"
              : catName === "Nature"
              ? "forest"
              : catName === "Travel"
              ? "flight_takeoff"
              : catName === "Architecture"
              ? "location_city"
              : "collections_bookmark";

          return (
            <div
              key={catName}
              className="gp-explore-card"
              onClick={() => onSelectCategory(catName)}
            >
              <img src={cover} alt={catName} />
              {catName !== "My Uploads" && (
                <button
                  className="gp-card-delete-category-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(catName, e);
                  }}
                  title={`Delete category "${catName}"`}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              )}
              <div className="gp-explore-card-label">
                <span className="material-symbols-outlined">{iconName}</span>
                <div>
                  <h3>{catName}</h3>
                  <span style={{ fontSize: "0.78rem", opacity: 0.9 }}>
                    {matching.length} photo{matching.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
