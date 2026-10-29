import { useState } from "react";
import { FiMapPin } from "react-icons/fi";
import PageLoader from "./PageLoader";
import ErrorMessage from "./ErrorMessage";
import StatusBadge from "./StatusBadge";
import Button from "./Button";
import ConfirmationDialog from "./ConfirmationDialog";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../context/AuthContext";
import { getBooths } from "../../apis/boothApi";
import { createBooking } from "../../apis/bookingApi";
import formatPrice from "../../utils/formatPrice";
import { notifyError, notifySuccess } from "../../utils/notify";

// Event ke page par us event ke booths ki list. Exhibitor ko khali booth par "Book" button milta hai
const EventBooths = ({ event }) => {
  const { user } = useAuth();
  const { data: booths, loading, error, reload } = useFetch(() => getBooths({ eventId: event._id }), [event._id]);
  const [bookTarget, setBookTarget] = useState(null);
  const [booking, setBooking] = useState(false);

  // Backend sirf upcoming event ke booth book karne deta hai
  const canBook = user?.role === "exhibitor" && event.status === "upcoming";

  const handleBook = async () => {
    setBooking(true);
    try {
      await createBooking(bookTarget._id);
      notifySuccess(`Booth ${bookTarget.boothNumber} booked`);
    } catch (requestError) {
      // Company approve na ho, profile na ho, ya booth kisi ne abhi le liya ho: backend ka message dikhta hai
      notifyError(requestError);
    } finally {
      setBooking(false);
      setBookTarget(null);
      // Chahe kamyab ho ya na, booths dobara la lete hain taake sahi status dikhe
      reload();
    }
  };

  if (loading) return <PageLoader text="Loading booths..." />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  if (booths.length === 0) {
    return <p className="registration-note">No booths have been added for this event yet.</p>;
  }

  return (
    <>
      <ul className="booth-grid">
        {booths.map((booth) => (
          <li key={booth._id} className="booth-item">
            <div className="booth-item-top">
              <span className="booth-number">{booth.boothNumber}</span>
              <StatusBadge status={booth.status} />
            </div>
            <p className="feature-text">Size: {booth.size}</p>
            <p className="feature-text">Price: {formatPrice(booth.price)}</p>
            {booth.location && (
              <p className="event-meta">
                <FiMapPin aria-hidden="true" />
                {booth.location}
              </p>
            )}
            {canBook && booth.status === "available" && (
              <Button className="booth-item-action" onClick={() => setBookTarget(booth)}>
                Book this booth
              </Button>
            )}
          </li>
        ))}
      </ul>

      <ConfirmationDialog
        open={bookTarget !== null}
        title="Book this booth?"
        message={
          bookTarget
            ? `Booth ${bookTarget.boothNumber} (${bookTarget.size}), price ${formatPrice(bookTarget.price)}. Your company will be booked for this event.`
            : ""
        }
        confirmText="Book booth"
        loading={booking}
        onConfirm={handleBook}
        onCancel={() => setBookTarget(null)}
      />
    </>
  );
};

export default EventBooths;