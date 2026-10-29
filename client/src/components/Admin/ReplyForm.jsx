import { useState } from "react";
import Textarea from "../forms/Textarea";
import Button from "../common/Button";
import { notifyError } from "../../utils/notify";

const ReplyForm = ({ onSubmit, onCancel }) => {
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = reply.trim();
    if (!trimmed) return setError("Reply is required");
    if (trimmed.length > 2000) return setError("Reply must be at most 2000 characters");

    setSubmitting(true);
    try {
      await onSubmit(trimmed);
    } catch (requestError) {
      notifyError(requestError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      <Textarea
        label="Your reply"
        required
        rows={5}
        value={reply}
        onChange={(event) => {
          setReply(event.target.value);
          setError("");
        }}
        error={error}
      />
      <div className="dialog-actions">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Send reply
        </Button>
      </div>
    </form>
  );
};

export default ReplyForm;
