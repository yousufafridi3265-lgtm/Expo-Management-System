import Modal from "./Modal";
import Button from "./Button";

// "Kya aap sach mein delete karna chahte hain?" wala popup. Modal ko hi reuse karta hai
const ConfirmationDialog = ({
  open,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  danger = false,
  loading = false,
  onConfirm,
  onCancel
}) => {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      {message && <p className="dialog-message">{message}</p>}
      <div className="dialog-actions">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;