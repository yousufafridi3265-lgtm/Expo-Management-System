import { useState } from "react";
import Input from "../forms/Input";
import Textarea from "../forms/Textarea";
import Button from "../common/Button";
import { notifyError } from "../../utils/notify";

const EMPTY_FORM = { companyName: "", category: "", phone: "", address: "", description: "" };

// Backend ke rules: companyName (150 harf tak), phone, address, category zaroori hain
const validate = (form) => {
  const errors = {};
  if (!form.companyName.trim()) errors.companyName = "Company name is required";
  else if (form.companyName.trim().length > 150) errors.companyName = "Company name must be at most 150 characters";
  if (!form.category.trim()) errors.category = "Category is required";
  if (!form.phone.trim()) errors.phone = "Phone is required";
  if (!form.address.trim()) errors.address = "Address is required";
  return errors;
};

// Profile mein se sirf form ke fields lete hain
const pickFields = (profile) => {
  if (!profile) return {};
  const { companyName, category, phone, address, description } = profile;
  return { companyName, category, phone, address, description: description || "" };
};

// Company profile ka form. Naya profile banane aur purana badalne, dono ke liye.
// initialValues: profile (edit ke waqt) ya khali (create ke waqt)
// onSubmit(data): API call karne wala function, jo promise wapas kare. Error aaye to toast yahin dikha dete hain
const CompanyProfileForm = ({ initialValues, submitLabel, onSubmit }) => {
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
        companyName: form.companyName.trim(),
        category: form.category.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
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
      <div className="form-grid">
        <Input label="Company name" name="companyName" required value={form.companyName} onChange={handleChange} error={errors.companyName} />
        <Input label="Category" name="category" required placeholder="e.g. Technology" value={form.category} onChange={handleChange} error={errors.category} />
        <Input label="Phone" type="tel" name="phone" required value={form.phone} onChange={handleChange} error={errors.phone} />
        <Input label="Address" name="address" required value={form.address} onChange={handleChange} error={errors.address} />
        <div className="form-grid-wide">
          <Textarea label="About your company" name="description" value={form.description} onChange={handleChange} />
        </div>
      </div>
      <div>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default CompanyProfileForm;