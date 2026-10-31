export default function PhotoCard({
  photo,
  isSelected,
  onSelect,
  onToggleFavorite,
  onClick,
}) {
  return (
    <div
      className={`gp-photo-card ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      <img src={photo.url} alt={photo.title} loading="lazy" />

      {/* Selection Check Circle */}
      {onSelect && (
        <button
          className={`gp-photo-select-btn ${isSelected ? "selected" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(photo.id, e);
          }}
          title="Select photo"
        >
          <span className="material-symbols-outlined">
            {isSelected ? "check_circle" : "check"}
          </span>
        </button>
      )}

      {/* Quick Favorite Star */}
      {onToggleFavorite && (
        <button
          className={`gp-photo-fav-btn ${photo.isFavorite ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(photo.id, e);
          }}
          title={photo.isFavorite ? "Unstar" : "Star"}
        >
          <span className="material-symbols-outlined">
            {photo.isFavorite ? "star" : "star_border"}
          </span>
        </button>
      )}

      {/* Hover Bottom Title */}
      <div className="gp-photo-bottom-info">
        <span>{photo.title}</span>
        {photo.uploaderName && (
          <span className="gp-uploader-tag">👤 {photo.uploaderName}</span>
        )}
      </div>
    </div>
  );
}
