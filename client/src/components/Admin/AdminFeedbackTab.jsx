import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import PageLoader from "../common/PageLoader";
import ErrorMessage from "../common/ErrorMessage";
import EmptyState from "../common/EmptyState";
import StatusBadge from "../common/StatusBadge";
import FilterChips from "../common/FilterChips";
import Button from "../common/Button";
import useFetch from "../../hooks/useFetch";
import { getAllFeedback, markFeedbackReviewed } from "../../apis/feedbackApi";
import { formatDateTime } from "../../utils/formatDate";
import { notifyError, notifySuccess } from "../../utils/notify";

const FILTERS = [
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "", label: "All" }
];

const AdminFeedbackTab = () => {
  const [status, setStatus] = useState("new");
  const [busyId, setBusyId] = useState(null);

  const { data: feedback, loading, error, reload } = useFetch(
    () => getAllFeedback(status ? { status } : undefined),
    [status]
  );

  const handleReview = async (item) => {
    setBusyId(item._id);
    try {
      await markFeedbackReviewed(item._id);
      notifySuccess("Marked as reviewed");
    } catch (requestError) {
      notifyError(requestError);
    } finally {
      setBusyId(null);
      reload();
    }
  };

  const renderContent = () => {
    if (loading) return <PageLoader text="Loading feedback..." />;
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

    if (feedback.length === 0) {
      return (
        <EmptyState
          title="No feedback"
          message={status ? `There is no ${status} feedback right now.` : "Nobody has sent feedback yet."}
        />
      );
    }

    return (
      <div className="admin-list">
        {feedback.map((item) => {
          const sender = item.userId;
          return (
            <article key={item._id} className="card message-item">
              <div className="registration-item-top">
                <h2 className="admin-row-title">{item.subject}</h2>
                <StatusBadge status={item.status} />
              </div>
              <p className="feature-text">
                {sender ? `${sender.name} (${sender.email}, ${sender.role})` : "Sender account not found"} ·{" "}
                {formatDateTime(item.createdAt)}
              </p>
              <p className="message-body">{item.description}</p>
              {item.status === "new" && (
                <div className="registration-item-actions">
                  <Button variant="secondary" loading={busyId === item._id} onClick={() => handleReview(item)}>
                    <FiCheck aria-hidden="true" />
                    Mark as reviewed
                  </Button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <FilterChips options={FILTERS} value={status} onChange={setStatus} label="Filter feedback by status" />
      {renderContent()}
    </>
  );
};

export default AdminFeedbackTab;