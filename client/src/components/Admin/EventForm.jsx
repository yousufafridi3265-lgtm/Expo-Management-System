import { useState } from "react";
import Input from "../forms/Input";
import Select from "../forms/Select";
import Textarea from "../forms/Textarea";
import Button from "../common/Button";
import { notifyError } from "../../utils/notify";

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

const EMPTY_FORM = { name: "", description: "", startDate: "", endDate: "", location: "", status: "upcoming" };

// Backend dates "2026-11-01T00:00:00.000Z" deta hai, <input type="date"> ko sirf "2026-11-01" chahiye
const toDateInput = (value) => (value ? value.slice(0, 10) : "");

const pickFields = (event) => {
  if (!event) return {};
  return {
    name: event.name,
    description: event.description || "",
    startDate: toDateInput(event.startDate),
    endDate: toDateInput(event.endDate),
    location: event.location,
    status: event.status
  };
};

// Backend ke rules: name (150 tak), start/end date, location zaroori. End date start se pehle nahi ho sakti
const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Event name is required";
  else if (form.name.trim().length > 150) errors.name = "Event name must be at most 150 characters";
  if (!form.startDate) errors.startDate = "Start date is required";
  if (!form.endDate) errors.endDate = "End date is required";
  else if (form.startDate && form.endDate < form.startDate) errors.endDate = "End date cannot be before start date";
  if (!form.location.trim()) errors.location = "Location is required";
  return errors;
};

// Event banane aur badalne, dono ka form. initialValues: event (edit) ya khali (naya)
// onSubmit(data): API call, promise wapas kare. Kamyab hone par parent popup band karta hai
const EventForm = ({ initialValues, submitLabel, onSubmit, onCancel }) => {
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
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        location: form.location.trim(),
        status: form.status
      });
    } catch (error) {
      notifyError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      <Input label="Event name" name="name" required value={form.name} onChange={handleChange} error={errors.name} />
      <div className="form-grid">
        <Input label="Start date" type="date" name="startDate" required value={form.startDate} onChange={handleChange} error={errors.startDate} />
        <Input label="End date" type="date" name="endDate" required value={form.endDate} onChange={handleChange} error={errors.endDate} />
        <Input label="Location" name="location" required value={form.location} onChange={handleChange} error={errors.location} />
        <Select label="Status" name="status" options={STATUS_OPTIONS} value={form.status} onChange={handleChange} />
      </div>
      <Textarea label="Description" name="description" value={form.description} onChange={handleChange} />
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

export default EventForm;