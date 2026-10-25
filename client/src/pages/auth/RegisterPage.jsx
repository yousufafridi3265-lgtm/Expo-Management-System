import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/forms/Input";
import Select from "../../components/forms/Select";
import Textarea from "../../components/forms/Textarea";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { createExhibitorProfile } from "../../apis/exhibitorApi";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { notifyError, notifySuccess } from "../../utils/notify";
import { ROUTES } from "../../routePaths";

// Public registration mein sirf yeh do role allowed hain (admin backend seed script se banta hai)
const ROLE_OPTIONS = [
  { value: "attendee", label: "Attendee (visit expos)" },
  { value: "exhibitor", label: "Exhibitor (show my company)" }
];

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "attendee",
  // Sirf exhibitor ke liye
  companyName: "",
  phone: "",
  address: "",
  category: "",
  description: ""
};

// Backend ke rules: name kam az kam 2 harf, password kam az kam 6.
// Exhibitor profile mein companyName, phone, address, category zaroori hain
const validate = (form) => {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Please enter a valid email";
  if (form.password.length < 6) errors.password = "Password must be at least 6 characters";

  if (form.role === "exhibitor") {
    if (!form.companyName.trim()) errors.companyName = "Company name is required";
    if (!form.phone.trim()) errors.phone = "Phone is required";
    if (!form.address.trim()) errors.address = "Address is required";
    if (!form.category.trim()) errors.category = "Category is required";
  }
  return errors;
};

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isExhibitor = form.role === "exhibitor";

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

    // Exhibitor ke liye account ke baad company profile bhi banta hai
    const createProfile = isExhibitor ? () =>
          createExhibitorProfile({
            companyName: form.companyName.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            category: form.category.trim(),
            description: form.description.trim()
          })
      : undefined;

    setSubmitting(true);
    try {
      const { profileError } = await register(
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role
        },
        createProfile
      );

      if (profileError) {
        // Account ban gaya, sirf profile nahi bana. User ko saaf batate hain
        notifyError(
          `Account created, but the company profile was not saved: ${getErrorMessage(profileError)}`
        );
      } else {
        notifySuccess("Registration successful");
      }
      navigate(ROUTES.dashboard, { replace: true });
    } catch (error) {
      notifyError(error);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the expo in a minute"
      wide={isExhibitor}
      footer={
        <>
          Already have an account?{" "}
          <Link to={ROUTES.login} className="link">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <Select label="I am an" name="role" options={ROLE_OPTIONS} value={form.role} onChange={handleChange} />

        <div className="form-grid">
          <Input label="Full name" name="name" autoComplete="name" value={form.name} onChange={handleChange} error={errors.name} />
          <Input label="Email" type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />
        </div>

        {isExhibitor && (
          <>
            <h2 className="form-section-title">Company details</h2>
            <div className="form-grid">
              <Input label="Company name" name="companyName" value={form.companyName} onChange={handleChange} error={errors.companyName} />
              <Input label="Category" name="category" placeholder="e.g. Technology" value={form.category} onChange={handleChange} error={errors.category} />
              <Input label="Phone" type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={handleChange} error={errors.phone} />
              <Input label="Address" name="address" autoComplete="street-address" value={form.address} onChange={handleChange} error={errors.address} />
              <div className="form-grid-wide">
                <Textarea label="About your company (optional)" name="description" value={form.description} onChange={handleChange} />
              </div>
            </div>
            <p className="form-note">
              Your company profile will be reviewed by the organizers before it appears publicly.
            </p>
          </>
        )}

        <Button type="submit" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;