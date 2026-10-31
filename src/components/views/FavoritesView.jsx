import EmptyState from "../common/EmptyState.jsx";

export default function FavoritesView({
  activePhotos,
  toggleFavorite,
  setViewingIndex,
}) {
  return (
    <div className="gp-favorites-view">
      <div className="gp-view-header">
        <h2>⭐ Favorites</h2>
        <p>Photos you have starred for quick access</p>
      </div>

      {activePhotos.length > 0 ? (
        <div className="gp-photo-grid">
          {activePhotos.map((photo, idx) => (
            <div
              key={photo.id}
              className="gp-photo-card"
              onClick={() => setViewingIndex(idx)}
            >
              <img src={photo.url} alt={photo.title} />
              <button
                className="gp-photo-fav-btn active"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(photo.id, e);
                }}
                title="Remove from favorites"
              >
                <span className="material-symbols-outlined">star</span>
              </button>
              <div className="gp-photo-bottom-info">
                <span>{photo.title}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="star_border"
          title="No favorites yet"
          description="Star photos that you love to see them grouped here."
        />
      )}
    </div>
  );
}
