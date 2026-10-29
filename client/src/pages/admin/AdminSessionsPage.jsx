import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiClock, FiEdit2, FiMapPin, FiPlus, FiTrash2 } from "react-icons/fi";
import PublicLayout from "../../components/layout/PublicLayout";
import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import SessionForm from "../../components/admin/SessionForm";
import useFetch from "../../hooks/useFetch";
import { getEventById } from "../../apis/eventApi";
import { createSession, deleteSession, getSessions, updateSession } from "../../apis/sessionApi";
import { formatDateRange, formatTimeRange } from "../../utils/formatDate";
import { notifyError, notifySuccess } from "../../utils/notify";
import { ROUTES } from "../../routePaths";

const AdminSessionsPage = () => {
  const { id: eventId } = useParams();

  const eventRequest = useFetch(() => getEventById(eventId), [eventId]);
  const sessionsRequest = useFetch(() => getSessions({ eventId }), [eventId]);

  // formSession: null = popup band, {} = nayi session, session object = edit
  const [formSession, setFormSession] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const closeForm = () => setFormSession(null);
  const isEditing = Boolean(formSession?._id);

  const handleSubmit = async (data) => {
    if (isEditing) {
      await updateSession(formSession._id, data);
      notifySuccess("Session saved");
    } else {
      await createSession({ ...data, eventId });
      notifySuccess("Session created");
    }
    closeForm();
    sessionsRequest.reload();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSession(deleteTarget._id);
      notifySuccess("Session deleted");
      setDeleteTarget(null);
      sessionsRequest.reload();
    } catch (error) {
      notifyError(error);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const renderSessions = () => {
    const { data: sessions, loading, error, reload } = sessionsRequest;
    if (loading) return <PageLoader text="Loading sessions..." />;
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

    if (sessions.length === 0) {
      return (
        <EmptyState title="No sessions yet" message="Add sessions and workshops to build the schedule.">
          <Button onClick={() => setFormSession({})}>
            <FiPlus aria-hidden="true" />
            Add session
          </Button>
        </EmptyState>
      );
    }

    return (
      <div className="admin-list">
        {sessions.map((session) => (
          <article key={session._id} className="card admin-row">
            <div>
              <div className="admin-row-title-line">
                <h2 className="admin-row-title">{session.title}</h2>
                <StatusBadge status={session.type} />
              </div>
              <p className="event-meta">
                <FiClock aria-hidden="true" />
                {formatTimeRange(session.startTime, session.endTime)}
              </p>
              {session.location && (
                <p className="event-meta">
                  <FiMapPin aria-hidden="true" />
                  {session.location}
                </p>
              )}
            </div>
            <div className="admin-row-actions">
              <Button variant="secondary" onClick={() => setFormSession(session)}>
                <FiEdit2 aria-hidden="true" />
                Edit
              </Button>
              <Button variant="danger" onClick={() => setDeleteTarget(session)} aria-label={`Delete ${session.title}`}>
                <FiTrash2 aria-hidden="true" />
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (eventRequest.loading) return <PageLoader text="Loading event..." />;
    if (eventRequest.error) return <ErrorMessage message={eventRequest.error} onRetry={eventRequest.reload} />;

    const event = eventRequest.data;
    return (
      <>
        <PageHeader
          title={`Sessions: ${event.name}`}
          subtitle={`Event dates: ${formatDateRange(event.startDate, event.endDate)}. Sessions must fall within these days.`}
        >
          <Button onClick={() => setFormSession({})}>
            <FiPlus aria-hidden="true" />
            Add session
          </Button>
        </PageHeader>
        {renderSessions()}
      </>
    );
  };

  return (
    <PublicLayout>
      <div className="page-container">
        <Link to={ROUTES.adminEvents} className="back-link">
          <FiArrowLeft aria-hidden="true" />
          Back to events
        </Link>
        {renderContent()}
      </div>

      <Modal open={formSession !== null} title={isEditing ? "Edit session" : "Add session"} onClose={closeForm}>
        <SessionForm
          key={formSession?._id || "new"}
          initialValues={isEditing ? formSession : undefined}
          submitLabel={isEditing ? "Save changes" : "Create session"}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmationDialog
        open={deleteTarget !== null}
        title="Delete this session?"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" will be deleted, along with its bookmarks and registrations. This cannot be undone.`
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

export default AdminSessionsPage;