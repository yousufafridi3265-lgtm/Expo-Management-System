import { useState } from "react";
import Input from "../forms/Input";
import Select from "../forms/Select";
import Textarea from "../forms/Textarea";
import Button from "../common/Button";
import { notifyError } from "../../utils/notify";

const TYPE_OPTIONS = [
  { value: "session", label: "Session" },
  { value: "workshop", label: "Workshop" }
];

const EMPTY_FORM = { title: "", type: "session", startTime: "", endTime: "", location: "", description: "" };

// Backend waqt UTC mein deta hai. <input type="datetime-local"> ko aap ke time zone ka "2026-11-01T10:00" chahiye
const toDateTimeInput = (value) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const pickFields = (session) => {
  if (!session) return {};
  return {
    title: session.title,
    type: session.type,
    startTime: toDateTimeInput(session.startTime),
    endTime: toDateTimeInput(session.endTime),
    location: session.location || "",
    description: session.description || ""
  };
};

// Backend ke rules: title (150 tak), start aur end time zaroori, end start ke baad hona chahiye
// (session event ki dates ke andar hone ka check backend karta hai)
const validate = (form) => {
  const errors = {};
  if (!form.title.trim()) errors.title = "Title is required";
  else if (form.title.trim().length > 150) errors.title = "Title must be at most 150 characters";
  if (!form.startTime) errors.startTime = "Start time is required";
  if (!form.endTime) errors.endTime = "End time is required";
  else if (form.startTime && form.endTime <= form.startTime) errors.endTime = "End time must be after start time";
  return errors;
};

// Session banane aur badalne, dono ka form. initialValues: session (edit) ya khali (naya)
const SessionForm = ({ initialValues, submitLabel, onSubmit, onCancel }) => {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...pickFields(initialValues) });
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
      // new Date("2026-11-01T10:00") aap ke time zone ka waqt hota hai, toISOString() usay UTC bana deta hai
      await onSubmit({
        title: form.title.trim(),
        type: form.type,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        location: form.location.trim(),
        description: form.description.trim()
      });
    } catch (error) {
      notifyError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      <Input label="Title" name="title" required value={form.title} onChange={handleChange} error={errors.title} />
      <div className="form-grid">
        <Input label="Starts" type="datetime-local" name="startTime" required value={form.startTime} onChange={handleChange} error={errors.startTime} />
        <Input label="Ends" type="datetime-local" name="endTime" required value={form.endTime} onChange={handleChange} error={errors.endTime} />
        <Select label="Type" name="type" options={TYPE_OPTIONS} value={form.type} onChange={handleChange} />
        <Input label="Location (optional)" name="location" placeholder="e.g. Hall 2" value={form.location} onChange={handleChange} />
      </div>
      <Textarea label="Description (optional)" name="description" value={form.description} onChange={handleChange} />
      <div className="dialog-actions">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default SessionForm;