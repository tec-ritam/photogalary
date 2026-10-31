export default function RoadmapView({
  features,
  newFeatureTitle,
  setNewFeatureTitle,
  newFeatureDesc,
  setNewFeatureDesc,
  onSubmitProposal,
  onUpvoteFeature,
}) {
  return (
    <div className="gp-roadmap-view">
      <div className="gp-view-header">
        <h2>💡 Feature Suggestions & Roadmap</h2>
        <p>Suggest new capabilities for your PixVerse gallery or vote on community ideas</p>
      </div>

      <div className="gp-feature-input-box">
        <h3>Propose a Feature or Album Type</h3>
        <input
          type="text"
          placeholder="e.g. AI Magic Eraser, Smart Tagging, 3D Canvas, AI Filters..."
          value={newFeatureTitle}
          onChange={(e) => setNewFeatureTitle(e.target.value)}
        />
        <textarea
          placeholder="Describe your idea in detail..."
          rows={2}
          value={newFeatureDesc}
          onChange={(e) => setNewFeatureDesc(e.target.value)}
        />
        <button className="gp-upload-btn" onClick={onSubmitProposal}>
          Submit Proposal
        </button>
      </div>

      <div className="gp-features-list">
        {features.map((feat) => (
          <div key={feat.id} className="gp-feature-card">
            <button
              className="gp-vote-btn"
              onClick={() => onUpvoteFeature(feat.id)}
            >
              <span className="material-symbols-outlined">arrow_upward</span>
              <strong>{feat.votes}</strong>
            </button>
            <div className="gp-feature-info">
              <h4>{feat.title}</h4>
              <p>{feat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
