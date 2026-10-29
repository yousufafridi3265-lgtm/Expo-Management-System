import { useState } from "react";
import Input from "../forms/Input";
import Textarea from "../forms/Textarea";
import Button from "../common/Button";
import { notifyError } from "../../utils/notify";

const validate = (form) => {
  const errors = {};
  if (!form.subject.trim()) errors.subject = "Subject is required";
  else if (form.subject.trim().length > 150) errors.subject = "Subject must be at most 150 characters";
  if (!form.description.trim()) errors.description = "Description is required";
  else if (form.description.trim().length > 2000) errors.description = "Description must be at most 2000 characters";
  return errors;
};

const FeedbackForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({ subject: "", description: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
      await onSubmit({ subject: form.subject.trim(), description: form.description.trim() });
    } catch (error) {
      notifyError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      <Input label="Subject" name="subject" required value={form.subject} onChange={handleChange} error={errors.subject} />
      <Textarea
        label="Your feedback"
        name="description"
        required
        rows={5}
        value={form.description}
        onChange={handleChange}
        error={errors.description}
      />
      <div className="dialog-actions">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Send feedback
        </Button>
      </div>
    </form>
  );
};

export default FeedbackForm;