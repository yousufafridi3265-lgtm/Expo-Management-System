import { useState } from "react";
import Input from "../forms/Input";
import Select from "../forms/Select";
import Textarea from "../forms/Textarea";
import Button from "../common/Button";
import useFetch from "../../hooks/useFetch";
import { getEvents } from "../../apis/eventApi";
import { notifyError } from "../../utils/notify";

const validate = (form) => {
  const errors = {};
  if (!form.subject.trim()) errors.subject = "Subject is required";
  else if (form.subject.trim().length > 150) errors.subject = "Subject must be at most 150 characters";
  if (!form.message.trim()) errors.message = "Message is required";
  else if (form.message.trim().length > 2000) errors.message = "Message must be at most 2000 characters";
  return errors;
};

const MessageForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({ subject: "", eventId: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Events sirf optional dropdown ke liye hain
  const { data: events } = useFetch(() => getEvents(), []);
  const eventOptions = (events || []).map((event) => ({ value: event._id, label: event.name }));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const foundErrors = validate(form);
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        subject: form.subject.trim(),
        message: form.message.trim(),
        ...(form.eventId ? { eventId: form.eventId } : {})
      });
    } catch (error) {
      notifyError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      <Input label="Subject" name="subject" required value={form.subject} onChange={handleChange} error={errors.subject} />
      <Select
        label="About an event (optional)"
        name="eventId"
        placeholder="No specific event"
        options={eventOptions}
        value={form.eventId}
        onChange={handleChange}
      />
      <Textarea label="Message" name="message" required rows={5} value={form.message} onChange={handleChange} error={errors.message} />
      <div className="dialog-actions">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Send message
        </Button>
      </div>
    </form>
  );
};

export default MessageForm;