import { useState } from "react";
import { FiBookmark } from "react-icons/fi";
import Button from "./Button";
import StatusBadge from "./StatusBadge";
import {
  addBookmark,
  cancelSessionRegistration,
  registerForSession,
  removeBookmark
} from "../../apis/sessionApi";
import { notifyError, notifySuccess } from "../../utils/notify";

// Attendee ke buttons ek session par: bookmark lagana/hatana aur register/cancel karna
// isBookmarked, isRegistered: abhi ka haal. onChanged(): kuch badle to parent list dobara laye
const SessionActions = ({ session, isBookmarked, isRegistered, onChanged }) => {
  const [busy, setBusy] = useState("");

  // Shuru ho chuke session mein register nahi hota (backend bhi 409 deta hai)
  const hasStarted = new Date(session.startTime) <= new Date();

  // action: API call wala function. Kamyab ho ya na, parent ko bata dete hain taake sahi haal dikhe
  const run = async (name, action, successMessage) => {
    setBusy(name);
    try {
      await action(session._id);
      notifySuccess(successMessage);
    } catch (error) {
      notifyError(error);
    } finally {
      setBusy("");
      onChanged();
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        aria-pressed={isBookmarked}
        loading={busy === "bookmark"}
        onClick={() =>
          isBookmarked
            ? run("bookmark", removeBookmark, "Bookmark removed")
            : run("bookmark", addBookmark, "Session bookmarked")
        }
      >
        <FiBookmark aria-hidden="true" />
        {isBookmarked ? "Bookmarked" : "Bookmark"}
      </Button>

      {isRegistered ? (
        <>
          <StatusBadge status="registered" />
          <Button variant="secondary" loading={busy === "register"} onClick={() => run("register", cancelSessionRegistration, "Registration cancelled")}>
            Cancel registration
          </Button>
        </>
      ) : hasStarted ? (
        <span className="registration-note">This session has already started.</span>
      ) : (
        <Button loading={busy === "register"} onClick={() => run("register", registerForSession, "Registered for this session")}>
          Register
        </Button>
      )}
    </>
  );
};

export default SessionActions;