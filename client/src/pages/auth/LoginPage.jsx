import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/forms/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { notifyError, notifySuccess } from "../../utils/notify";
import { ROUTES } from "../../routePaths";

// Frontend ki jaanch sirf madad ke liye hai. Asli jaanch backend karta hai
const validate = ({ email, password }) => {
  const errors = {};
  if (!email.trim()) errors.email = "Email is required";
  if (!password) errors.password = "Password is required";
  return errors;
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    // Jis field ko theek kar rahe hain us ka purana error hata do
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
      await login({ email: form.email.trim(), password: form.password });
      notifySuccess("Login successful");
      // ProtectedRoute ne jo page yaad rakha tha wahan wapas, warna dashboard
      navigate(location.state?.from || ROUTES.dashboard, { replace: true });
    } catch (error) {
      notifyError(error);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          New here?{" "}
          <Link to={ROUTES.register} className="link">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Button type="submit" loading={submitting}>
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;