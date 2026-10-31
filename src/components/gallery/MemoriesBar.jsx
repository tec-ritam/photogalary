export default function MemoriesBar({ memoriesList, onSelectMemory }) {
  if (!memoriesList || memoriesList.length === 0) return null;

  return (
    <section className="gp-memories-section">
      <div className="gp-memories-scroller">
        {memoriesList.map((memory) => (
          <div
            key={memory.id}
            className="gp-memory-card"
            onClick={() => onSelectMemory(memory)}
          >
            <img src={memory.photos[0]?.url} alt={memory.title} />
            <div className="gp-memory-overlay">
              <span className="gp-memory-title">{memory.title}</span>
              <span className="gp-memory-subtitle">{memory.subtitle}</span>
            </div>
            <div className="gp-memory-ring" />
          </div>
        ))}
      </div>
    </section>
  );
}
