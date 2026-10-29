import { useState } from "react";
import Button from "./Button";
import ConfirmationDialog from "./ConfirmationDialog";
import { cancelBooking } from "../../apis/bookingApi";
import { notifyError, notifySuccess } from "../../utils/notify";

// "Cancel booking" button + confirm popup. Exhibitor ka My bookings aur admin ka Bookings page dono isi ko use karte hain
const CancelBookingButton = ({ bookingId, boothNumber, onCancelled }) => {
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleConfirm = async () => {
    setCancelling(true);
    try {
      await cancelBooking(bookingId);
      notifySuccess("Booking cancelled");
      setOpen(false);
      onCancelled();
    } catch (error) {
      notifyError(error);
      // Aksar booking pehle hi cancel ho chuki hoti hai, list dobara la lete hain taake sahi haal dikhe
      setOpen(false);
      onCancelled();
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Cancel booking
      </Button>
      <ConfirmationDialog
        open={open}
        title="Cancel this booking?"
        message={`Booth ${boothNumber} will become available for other exhibitors.`}
        confirmText="Yes, cancel it"
        danger
        loading={cancelling}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
};

export default CancelBookingButton;