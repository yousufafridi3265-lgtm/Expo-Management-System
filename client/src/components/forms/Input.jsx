import { useId } from "react";
import FormField from "./FormField";

// Controlled input: value aur onChange bahar se aate hain. type, name, placeholder waghaira seedha pass hote hain
const Input = ({ label, error, required, className = "", ...rest }) => {
  const id = useId();

  return (
    <FormField id={id} label={label} error={error} required={required}>
      <input
        id={id}
        required={required}
        className={`field ${error ? "field-error" : ""} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
    </FormField>
  );
};

export default Input;