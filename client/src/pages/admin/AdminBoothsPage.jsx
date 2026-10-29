import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiMapPin, FiPlus, FiTrash2 } from "react-icons/fi";
import PublicLayout from "../../components/layout/PublicLayout";
import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import BoothForm from "../../components/admin/BoothForm";
import useFetch from "../../hooks/useFetch";
import { getEventById } from "../../apis/eventApi";
import { createBooth, deleteBooth, getBooths, updateBooth } from "../../apis/boothApi";
import formatPrice from "../../utils/formatPrice";
import { notifyError, notifySuccess } from "../../utils/notify";
import { ROUTES } from "../../routePaths";

const AdminBoothsPage = () => {
  const { id: eventId } = useParams();

  // Event aur uske booths do alag requests hain. Event na mile (404/400) to booths ka koi matlab nahi
  const eventRequest = useFetch(() => getEventById(eventId), [eventId]);
  const boothsRequest = useFetch(() => getBooths({ eventId }), [eventId]);

  // formBooth: null = popup band, {} = naya booth, booth object = edit
  const [formBooth, setFormBooth] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const closeForm = () => setFormBooth(null);
  const isEditing = Boolean(formBooth?._id);

  const handleSubmit = async (data) => {
    if (isEditing) {
      await updateBooth(formBooth._id, data);
      notifySuccess("Booth saved");
    } else {
      await createBooth({ ...data, eventId });
      notifySuccess("Booth created");
    }
    closeForm();
    boothsRequest.reload();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBooth(deleteTarget._id);
      notifySuccess("Booth deleted");
      setDeleteTarget(null);
      boothsRequest.reload();
    } catch (error) {
      notifyError(error);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const renderBooths = () => {
    const { data: booths, loading, error, reload } = boothsRequest;
    if (loading) return <PageLoader text="Loading booths..." />;
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

    if (booths.length === 0) {
      return (
        <EmptyState title="No booths yet" message="Add booths so exhibitors can book them.">
          <Button onClick={() => setFormBooth({})}>
            <FiPlus aria-hidden="true" />
            Add booth
          </Button>
        </EmptyState>
      );
    }

    return (
      <div className="admin-list">
        {booths.map((booth) => {
          // Booked booth backend mein badla ya hataya nahi ja sakta (409), isliye buttons band rakhte hain
          const locked = booth.status === "booked";
          return (
            <article key={booth._id} className="card admin-row">
              <div>
                <div className="admin-row-title-line">
                  <h2 className="admin-row-title">Booth {booth.boothNumber}</h2>
                  <StatusBadge status={booth.status} />
                </div>
                <p className="feature-text">
                  Size: {booth.size} · Price: {formatPrice(booth.price)}
                </p>
                {booth.location && (
                  <p className="event-meta">
                    <FiMapPin aria-hidden="true" />
                    {booth.location}
                  </p>
                )}
                {locked && <p className="registration-note">Booked booths cannot be changed or deleted.</p>}
              </div>
              <div className="admin-row-actions">
                <Button variant="secondary" disabled={locked} onClick={() => setFormBooth(booth)}>
                  <FiEdit2 aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  disabled={locked}
                  onClick={() => setDeleteTarget(booth)}
                  aria-label={`Delete booth ${booth.boothNumber}`}
                >
                  <FiTrash2 aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    if (eventRequest.loading) return <PageLoader text="Loading event..." />;
    if (eventRequest.error) return <ErrorMessage message={eventRequest.error} onRetry={eventRequest.reload} />;

    return (
      <>
        <PageHeader title={`Booths: ${eventRequest.data.name}`} subtitle="Add, edit and remove booths for this event">
          <Button onClick={() => setFormBooth({})}>
            <FiPlus aria-hidden="true" />
            Add booth
          </Button>
        </PageHeader>
        {renderBooths()}
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

      <Modal open={formBooth !== null} title={isEditing ? "Edit booth" : "Add booth"} onClose={closeForm}>
        <BoothForm
          key={formBooth?._id || "new"}
          initialValues={isEditing ? formBooth : undefined}
          submitLabel={isEditing ? "Save changes" : "Create booth"}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmationDialog
        open={deleteTarget !== null}
        title="Delete this booth?"
        message={deleteTarget ? `Booth ${deleteTarget.boothNumber} will be deleted. This cannot be undone.` : ""}
        confirmText="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PublicLayout>
  );
};

export default AdminBoothsPage;

