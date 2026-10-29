import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiEdit2,
  FiGrid,
  FiMapPin,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import PublicLayout from "../../components/layout/PublicLayout";
import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import EventForm from "../../components/admin/EventForm";
import useFetch from "../../hooks/useFetch";
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from "../../apis/eventApi";
import { formatDateRange } from "../../utils/formatDate";
import { notifyError, notifySuccess } from "../../utils/notify";
import { adminBoothsPath } from "../../routePaths";

const AdminEventsPage = () => {
  const {
    data: events,
    loading,
    error,
    reload,
  } = useFetch(() => getEvents(), []);

  // formEvent: null = popup band, {} = naya event, event object = edit
  const [formEvent, setFormEvent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const closeForm = () => setFormEvent(null);
  const isEditing = Boolean(formEvent?._id);

  const handleSubmit = async (data) => {
    if (isEditing) {
      await updateEvent(formEvent._id, data);
      notifySuccess("Event saved");
    } else {
      await createEvent(data);
      notifySuccess("Event created");
    }
    closeForm();
    reload();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEvent(deleteTarget._id);
      notifySuccess("Event deleted");
      setDeleteTarget(null);
      reload();
    } catch (requestError) {
      // Booths, sessions ya registrations hon to backend wajah batata hai
      notifyError(requestError);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) return <PageLoader text="Loading events..." />;
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

    if (events.length === 0) {
      return (
        <EmptyState
          title="No events yet"
          message="Create the first event so visitors can register."
        >
          <Button onClick={() => setFormEvent({})}>
            <FiPlus aria-hidden="true" />
            Add event
          </Button>
        </EmptyState>
      );
    }

    return (
      <div className="admin-list">
        {events.map((event) => (
          <article key={event._id} className="card admin-row">
            <div>
              <div className="admin-row-title-line">
                <h2 className="admin-row-title">{event.name}</h2>
                <StatusBadge status={event.status} />
              </div>
              <p className="event-meta">
                <FiCalendar aria-hidden="true" />
                {formatDateRange(event.startDate, event.endDate)}
              </p>
              <p className="event-meta">
                <FiMapPin aria-hidden="true" />
                {event.location}
              </p>
            </div>
            <div className="admin-row-actions">
              <Link to={adminBoothsPath(event._id)} className="btn btn-secondary">
                <FiGrid aria-hidden="true" />
                Booths
              </Link>
              <Button variant="secondary" onClick={() => setFormEvent(event)}>
                <FiEdit2 aria-hidden="true" />
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => setDeleteTarget(event)}
                aria-label={`Delete ${event.name}`}
              >
                <FiTrash2 aria-hidden="true" />
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <PublicLayout>
      <div className="page-container">
        <PageHeader
          title="Manage events"
          subtitle="Create, edit and remove expos"
        >
          <Button onClick={() => setFormEvent({})}>
            <FiPlus aria-hidden="true" />
            Add event
          </Button>
        </PageHeader>

        {renderContent()}
      </div>

      {/* key badalne se har bar form naye sire se shuru hota hai (purani values nahi rehti) */}
      <Modal
        open={formEvent !== null}
        title={isEditing ? "Edit event" : "Add event"}
        onClose={closeForm}
      >
        <EventForm
          key={formEvent?._id || "new"}
          initialValues={isEditing ? formEvent : undefined}
          submitLabel={isEditing ? "Save changes" : "Create event"}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmationDialog
        open={deleteTarget !== null}
        title="Delete this event?"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be deleted. This cannot be undone.`
            : ""
        }
        confirmText="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PublicLayout>
  );
};

export default AdminEventsPage;
