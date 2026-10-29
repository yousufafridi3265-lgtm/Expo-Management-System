import { useState } from "react";
import { FiEdit, FiMessageSquare } from "react-icons/fi";
import PublicLayout from "../../components/layout/PublicLayout";
import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import MessageForm from "../../components/messages/MessageForm";
import FeedbackForm from "../../components/messages/FeedbackForm";
import useFetch from "../../hooks/useFetch";
import { createMessage, getMyMessages } from "../../apis/messageApi";
import { createFeedback } from "../../apis/feedbackApi";
import { formatDateTime } from "../../utils/formatDate";
import { notifySuccess } from "../../utils/notify";

const MessagesPage = () => {
  const { data: messages, loading, error, reload } = useFetch(getMyMessages);
  // Kaun sa popup khula hai: "message", "feedback" ya null
  const [dialog, setDialog] = useState(null);

  const closeDialog = () => setDialog(null);

  const handleSendMessage = async (data) => {
    await createMessage(data);
    notifySuccess("Message sent to the organizers");
    closeDialog();
    reload();
  };

  const handleSendFeedback = async (data) => {
    await createFeedback(data);
    notifySuccess("Thank you for your feedback");
    closeDialog();
  };

  const renderContent = () => {
    if (loading) return <PageLoader text="Loading your messages..." />;
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

    if (messages.length === 0) {
      return (
        <EmptyState title="No messages yet" message="Have a question? Send a message and the organizers will reply here.">
          <Button onClick={() => setDialog("message")}>
            <FiEdit aria-hidden="true" />
            New message
          </Button>
        </EmptyState>
      );
    }

    return (
      <ul className="registration-list">
        {messages.map((item) => (
          <li key={item._id} className="card message-item">
            <div className="registration-item-top">
              <span className="registration-item-title">{item.subject}</span>
              <StatusBadge status={item.status} />
            </div>
            <p className="feature-text">
              {formatDateTime(item.createdAt)}
              {item.eventId && ` · About: ${item.eventId.name}`}
            </p>
            <p className="message-body">{item.message}</p>
            {item.reply && (
              <div className="reply-box">
                <p className="reply-box-label">
                  Reply from the organizers{item.repliedAt && ` · ${formatDateTime(item.repliedAt)}`}
                </p>
                <p className="message-body">{item.reply}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <PublicLayout>
      <div className="page-container">
        <PageHeader title="Messages" subtitle="Ask the organizers a question or share your feedback">
          <Button onClick={() => setDialog("message")}>
            <FiEdit aria-hidden="true" />
            New message
          </Button>
          <Button variant="secondary" onClick={() => setDialog("feedback")}>
            <FiMessageSquare aria-hidden="true" />
            Send feedback
          </Button>
        </PageHeader>
        {renderContent()}
      </div>

      <Modal open={dialog === "message"} title="New message" onClose={closeDialog}>
        <MessageForm onSubmit={handleSendMessage} onCancel={closeDialog} />
      </Modal>
      <Modal open={dialog === "feedback"} title="Send feedback" onClose={closeDialog}>
        <FeedbackForm onSubmit={handleSendFeedback} onCancel={closeDialog} />
      </Modal>
    </PublicLayout>
  );
};

export default MessagesPage;