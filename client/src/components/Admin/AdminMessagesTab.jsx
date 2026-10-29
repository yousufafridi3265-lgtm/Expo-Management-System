import { useState } from "react";
import { FiCornerUpLeft } from "react-icons/fi";
import PageLoader from "../common/PageLoader";
import ErrorMessage from "../common/ErrorMessage";
import EmptyState from "../common/EmptyState";
import StatusBadge from "../common/StatusBadge";
import FilterChips from "../common/FilterChips";
import Button from "../common/Button";
import Modal from "../common/Modal";
import ReplyForm from "./ReplyForm";
import useFetch from "../../hooks/useFetch";
import { getAllMessages, replyToMessage } from "../../apis/messageApi";
import { formatDateTime } from "../../utils/formatDate";
import { notifyError, notifySuccess } from "../../utils/notify";

const FILTERS = [
  { value: "open", label: "Open" },
  { value: "replied", label: "Replied" },
  { value: "", label: "All" }
];

const AdminMessagesTab = () => {
  const [status, setStatus] = useState("open");
  const [replyTarget, setReplyTarget] = useState(null);

  const { data: messages, loading, error, reload } = useFetch(
    () => getAllMessages(status ? { status } : undefined),
    [status]
  );

  const closeReply = () => setReplyTarget(null);

  const handleReply = async (reply) => {
    try {
      await replyToMessage(replyTarget._id, reply);
      notifySuccess("Reply sent");
    } catch (requestError) {
      // Kisi aur admin ne pehle jawab de diya ho to 409: popup band, list dobara
      if (requestError.response?.status === 409) {
        notifyError(requestError);
        closeReply();
        reload();
        return;
      }
      throw requestError;
    }
    closeReply();
    reload();
  };

  const renderContent = () => {
    if (loading) return <PageLoader text="Loading messages..." />;
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

    if (messages.length === 0) {
      return (
        <EmptyState
          title="No messages"
          message={status ? `There are no ${status} messages right now.` : "Nobody has sent a message yet."}
        />
      );
    }

    return (
      <div className="admin-list">
        {messages.map((item) => {
          const sender = item.senderId;
          return (
            <article key={item._id} className="card message-item">
              <div className="registration-item-top">
                <h2 className="admin-row-title">{item.subject}</h2>
                <StatusBadge status={item.status} />
              </div>
              <p className="feature-text">
                {sender ? `${sender.name} (${sender.email}, ${sender.role})` : "Sender account not found"} ·{" "}
                {formatDateTime(item.createdAt)}
                {item.eventId && ` · About: ${item.eventId.name}`}
              </p>
              <p className="message-body">{item.message}</p>
              {item.reply && (
                <div className="reply-box">
                  <p className="reply-box-label">
                    Your reply{item.repliedAt && ` · ${formatDateTime(item.repliedAt)}`}
                  </p>
                  <p className="message-body">{item.reply}</p>
                </div>
              )}
              {item.status === "open" && (
                <div className="registration-item-actions">
                  <Button onClick={() => setReplyTarget(item)}>
                    <FiCornerUpLeft aria-hidden="true" />
                    Reply
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
      <FilterChips options={FILTERS} value={status} onChange={setStatus} label="Filter messages by status" />
      {renderContent()}

      <Modal open={replyTarget !== null} title={replyTarget ? `Reply: ${replyTarget.subject}` : "Reply"} onClose={closeReply}>
        {replyTarget && <ReplyForm key={replyTarget._id} onSubmit={handleReply} onCancel={closeReply} />}
      </Modal>
    </>
  );
};

export default AdminMessagesTab;