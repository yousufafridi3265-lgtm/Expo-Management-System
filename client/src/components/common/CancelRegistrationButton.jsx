import { useState } from "react";
import Button from "./Button";
import ConfirmationDialog from "./ConfirmationDialog";
import { cancelRegistration } from "../../apis/registrationApi";
import { notifyError, notifySuccess } from "../../utils/notify";

// "Cancel registration" button + confirm popup. Event detail aur My registrations dono isi ko use karte hain
const CancelRegistrationButton = ({ registrationId, onCancelled }) => {
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleConfirm = async () => {
    setCancelling(true);
    try {
      await cancelRegistration(registrationId);
      notifySuccess("Registration cancelled");
      setOpen(false);
      onCancelled();
    } catch (error) {
      notifyError(error);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Cancel registration
      </Button>
      <ConfirmationDialog
        open={open}
        title="Cancel registration?"
        message="Your registrations for this event's sessions will be cancelled too."
        confirmText="Yes, cancel it"
        danger
        loading={cancelling}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
};

export default CancelRegistrationButton;