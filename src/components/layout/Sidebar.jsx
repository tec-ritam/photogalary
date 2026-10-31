export default function Sidebar({
  sidebarCollapsed,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
}) {
  return (
    <nav className={`gp-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
      <div className="gp-nav-list">
        <button
          className={`gp-nav-item ${
            activeTab === "photos" && selectedCategory === "All" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("photos");
            setSelectedCategory("All");
          }}
        >
          <span className="material-symbols-outlined">photo_library</span>
          <span className="gp-nav-text">Photos</span>
        </button>

        <button
          className={`gp-nav-item ${activeTab === "explore" ? "active" : ""}`}
          onClick={() => setActiveTab("explore")}
        >
          <span className="material-symbols-outlined">explore</span>
          <span className="gp-nav-text">Explore</span>
        </button>

        <button
          className={`gp-nav-item ${activeTab === "favorites" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("favorites");
            setSelectedCategory("All");
          }}
        >
          <span className="material-symbols-outlined">star</span>
          <span className="gp-nav-text">Favorites</span>
        </button>

        <button
          className={`gp-nav-item ${activeTab === "albums" ? "active" : ""}`}
          onClick={() => setActiveTab("albums")}
        >
          <span className="material-symbols-outlined">photo_album</span>
          <span className="gp-nav-text">Albums</span>
        </button>

        <button
          className={`gp-nav-item ${activeTab === "trash" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("trash");
            setSelectedCategory("All");
          }}
        >
          <span className="material-symbols-outlined">delete</span>
          <span className="gp-nav-text">Trash</span>
        </button>

        <div className="gp-sidebar-divider" />

        <button
          className={`gp-nav-item ${activeTab === "roadmap" ? "active" : ""}`}
          onClick={() => setActiveTab("roadmap")}
        >
          <span className="material-symbols-outlined">lightbulb</span>
          <span className="gp-nav-text">Suggestions & Roadmap</span>
        </button>
      </div>
    </nav>
  );
}
