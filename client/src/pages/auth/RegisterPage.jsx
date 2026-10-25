import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/forms/Input";
import Select from "../../components/forms/Select";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { notifyError, notifySuccess } from "../../utils/notify";
import { ROUTES } from "../../routePaths";

// Public registration mein sirf yeh do role allowed hain (admin backend seed script se banta hai)
const ROLE_OPTIONS = [
  { value: "attendee", label: "Attendee (visit expos)" },
  { value: "exhibitor", label: "Exhibitor (show my company)" }
];

// Backend ke rules: name kam az kam 2 harf, password kam az kam 6
const validate = ({ name, email, password }) => {
  const errors = {};
  if (name.trim().length < 2) errors.name = "Name must be at least 2 characters";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Please enter a valid email";
  if (password.length < 6) errors.password = "Password must be at least 6 characters";
  return errors;
};

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "attendee" });
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
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role
      });
      notifySuccess("Registration successful");
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
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Select
          label="I am an"
          name="role"
          options={ROLE_OPTIONS}
          value={form.role}
          onChange={handleChange}
        />
        <Button type="submit" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;