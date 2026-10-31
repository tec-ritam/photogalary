export default function EmptyState({ icon = "photo_library", title, description, children }) {
  return (
    <div className="gp-empty-state">
      <span className="material-symbols-outlined gp-empty-icon">{icon}</span>
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
