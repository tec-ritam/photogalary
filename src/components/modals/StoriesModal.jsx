export default function StoriesModal({
  activeMemory,
  memoryIndex,
  setMemoryIndex,
  onClose,
}) {
  if (!activeMemory) return null;

  return (
    <div className="gp-story-overlay">
      <div className="gp-story-progress-bar">
        {activeMemory.photos.map((_, i) => (
          <div key={i} className="gp-story-seg">
            <div
              className={`gp-story-seg-fill ${
                i < memoryIndex ? "filled" : i === memoryIndex ? "active" : ""
              }`}
            />
          </div>
        ))}
      </div>

      <div className="gp-story-top">
        <div className="gp-story-title">
          <strong>{activeMemory.title}</strong>
          <span>{activeMemory.photos[memoryIndex]?.dateAdded}</span>
        </div>
        <button className="gp-icon-btn" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="gp-story-img-container">
        <img
          src={activeMemory.photos[memoryIndex]?.url}
          alt="Memory"
        />
      </div>

      {/* Touch / Click navigation zones */}
      <div
        className="gp-story-tap-left"
        onClick={() => setMemoryIndex((i) => Math.max(0, i - 1))}
      />
      <div
        className="gp-story-tap-right"
        onClick={() => {
          if (memoryIndex < activeMemory.photos.length - 1) {
            setMemoryIndex((i) => i + 1);
          } else {
            onClose();
          }
        }}
      />
    </div>
  );
}
