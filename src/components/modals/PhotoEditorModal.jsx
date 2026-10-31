export default function PhotoEditorModal({
  editingPhoto,
  activeFilter,
  setActiveFilter,
  editorAdjustments,
  setEditorAdjustments,
  photoFilters,
  onClose,
  onSave,
}) {
  if (!editingPhoto) return null;

  return (
    <div className="gp-editor-overlay">
      <div className="gp-editor-topbar">
        <button className="gp-icon-btn" onClick={onClose} title="Cancel">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h3>Edit Photo</h3>
        <button className="gp-save-btn" onClick={onSave}>
          Save copy
        </button>
      </div>

      <div className="gp-editor-canvas">
        <img
          src={editingPhoto.url}
          alt="Editing"
          style={{
            filter: `${photoFilters[activeFilter]} brightness(${editorAdjustments.brightness}%) contrast(${editorAdjustments.contrast}%) saturate(${editorAdjustments.saturation}%)`,
          }}
        />
      </div>

      <div className="gp-editor-toolbox">
        <div className="gp-editor-tabs">
          <button className="gp-editor-tab active">
            Filters & Adjust
          </button>
        </div>

        {/* Filter Presets Scroller */}
        <div className="gp-filter-presets">
          {Object.entries(photoFilters).map(([name, cssFilter]) => (
            <button
              key={name}
              className={`gp-preset-thumb ${activeFilter === name ? "active" : ""}`}
              onClick={() => setActiveFilter(name)}
            >
              <img
                src={editingPhoto.url}
                alt={name}
                style={{ filter: cssFilter }}
              />
              <span>{name}</span>
            </button>
          ))}
        </div>

        {/* Adjustment Sliders */}
        <div className="gp-slider-row">
          <label>Brightness</label>
          <input
            type="range"
            min="50"
            max="150"
            value={editorAdjustments.brightness}
            onChange={(e) =>
              setEditorAdjustments({
                ...editorAdjustments,
                brightness: Number(e.target.value),
              })
            }
          />
          <label>Contrast</label>
          <input
            type="range"
            min="50"
            max="150"
            value={editorAdjustments.contrast}
            onChange={(e) =>
              setEditorAdjustments({
                ...editorAdjustments,
                contrast: Number(e.target.value),
              })
            }
          />
          <label>Saturation</label>
          <input
            type="range"
            min="0"
            max="200"
            value={editorAdjustments.saturation}
            onChange={(e) =>
              setEditorAdjustments({
                ...editorAdjustments,
                saturation: Number(e.target.value),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
