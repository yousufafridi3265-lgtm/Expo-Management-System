import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "./Button";
import PageLoader from "./PageLoader";
import ErrorMessage from "./ErrorMessage";
import StatusBadge from "./StatusBadge";
import CancelRegistrationButton from "./CancelRegistrationButton";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../context/AuthContext";
import { createRegistration, getMyRegistrations } from "../../apis/registrationApi";
import { notifyError, notifySuccess } from "../../utils/notify";
import { ROUTES } from "../../routePaths";

// Sirf attendee ke liye: register karna ya registration cancel karna
const AttendeeActions = ({ event }) => {
  const [registering, setRegistering] = useState(false);
  const { data: registrations, loading, error, reload } = useFetch(getMyRegistrations);

  if (loading) return <PageLoader text="Checking your registration..." />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  // Is event ki woh registration jo abhi "registered" hai (cancelled wali nahi)
  const activeRegistration = registrations.find(
    (registration) => registration.eventId?._id === event._id && registration.status === "registered"
  );

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await createRegistration(event._id);
      notifySuccess("Registered for this event");
      reload();
    } catch (error) {
      notifyError(error);
    } finally {
      setRegistering(false);
    }
  };

  if (activeRegistration) {
    return (
      <>
        <p className="registration-status">
          You are <StatusBadge status="registered" /> for this event.
        </p>
        <CancelRegistrationButton registrationId={activeRegistration._id} onCancelled={reload} />
      </>
    );
  }

  if (event.status !== "upcoming") {
    return <p className="registration-note">Registration is closed for this event.</p>;
  }

  return (
    <Button onClick={handleRegister} loading={registering}>
      Register for this event
    </Button>
  );
};

// Event detail ke neeche ka hissa. Dikhta kya hai, woh user ke role par depend karta hai
const EventRegistrationPanel = ({ event }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const renderContent = () => {
    if (loading) return null;

    if (!user) {
      return (
        <p className="registration-note">
          <Link to={ROUTES.login} state={{ from: location.pathname }} className="link">
            Log in
          </Link>{" "}
          as an attendee to register for this event.
        </p>
      );
    }

    if (user.role !== "attendee") {
      return <p className="registration-note">Only attendees can register for events.</p>;
    }

    return <AttendeeActions event={event} />;
  };

  return (
    <section className="registration-panel">
      <h2 className="event-detail-heading">Registration</h2>
      {renderContent()}
    </section>
  );
};

export default EventRegistrationPanel;