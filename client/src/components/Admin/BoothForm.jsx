import { useState } from "react";
import Input from "../forms/Input";
import Select from "../forms/Select";
import Button from "../common/Button";
import { notifyError } from "../../utils/notify";

// Admin sirf yeh do status laga sakta hai. "booked" booking karne par khud lagta hai
const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" }
];

const EMPTY_FORM = { boothNumber: "", size: "", price: "", location: "", status: "available" };

const pickFields = (booth) => {
  if (!booth) return {};
  return {
    boothNumber: booth.boothNumber,
    size: booth.size,
    price: String(booth.price),
    location: booth.location || "",
    status: booth.status
  };
};

// Backend ke rules: boothNumber (20 harf tak), size, price (0 ya zyada) zaroori
const validate = (form) => {
  const errors = {};
  if (!form.boothNumber.trim()) errors.boothNumber = "Booth number is required";
  else if (form.boothNumber.trim().length > 20) errors.boothNumber = "Booth number must be at most 20 characters";
  if (!form.size.trim()) errors.size = "Size is required";
  if (form.price === "") errors.price = "Price is required";
  else if (Number.isNaN(Number(form.price)) || Number(form.price) < 0) errors.price = "Price cannot be negative";
  return errors;
};

// Booth banane aur badalne, dono ka form. initialValues: booth (edit) ya khali (naya)
// onSubmit(data): API call, promise wapas kare. Kamyab hone par parent popup band karta hai
const BoothForm = ({ initialValues, submitLabel, onSubmit, onCancel }) => {
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
        boothNumber: form.boothNumber.trim(),
        size: form.size.trim(),
        price: Number(form.price),
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
      <div className="form-grid">
        <Input label="Booth number" name="boothNumber" required placeholder="e.g. A12" value={form.boothNumber} onChange={handleChange} error={errors.boothNumber} />
        <Input label="Size" name="size" required placeholder="e.g. 3x3 m" value={form.size} onChange={handleChange} error={errors.size} />
        <Input label="Price" type="number" name="price" required min="0" step="any" value={form.price} onChange={handleChange} error={errors.price} />
        <Select label="Status" name="status" options={STATUS_OPTIONS} value={form.status} onChange={handleChange} />
        <div className="form-grid-wide">
          <Input label="Location in the hall (optional)" name="location" placeholder="e.g. Hall 2, near entrance" value={form.location} onChange={handleChange} />
        </div>
      </div>
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

export default BoothForm;

