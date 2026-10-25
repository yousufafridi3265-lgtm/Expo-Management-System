import Spinner from "./Spinner";

// variant: "primary" | "secondary" | "danger" | "ghost"
// loading=true: button disable ho jata hai aur spinner dikhta hai (double submit nahi hota)
const Button = ({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  ...rest
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
      title={children}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
};

export default Button;