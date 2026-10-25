import { useEffect, useId } from "react";
import { FiX } from "react-icons/fi";

// Popup. open=false ho to kuch nahi dikhta. Esc dabane, X dabane ya bahar click karne par onClose chalta hai
const Modal = ({ open, title, onClose, children }) => {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    // Popup khula ho to peeche ka page scroll na ho
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="card modal-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id={titleId} className="modal-title">
            {title}
          </h2>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <FiX size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;