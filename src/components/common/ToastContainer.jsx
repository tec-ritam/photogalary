export default function ToastContainer({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="gp-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`gp-toast ${t.type} ${t.exit ? "exit" : ""}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
