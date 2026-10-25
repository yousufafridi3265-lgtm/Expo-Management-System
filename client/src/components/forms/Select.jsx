import { useId } from "react";
import FormField from "./FormField";

// options: [{ value: "approved", label: "Approved" }, ...]
// placeholder dein to pehli khali choice aati hai (value "")
const Select = ({ label, error, required, options = [], placeholder, className = "", ...rest }) => {
  const id = useId();

  return (
    <FormField id={id} label={label} error={error} required={required}>
      <select
        id={id}
        required={required}
        className={`field ${error ? "field-error" : ""} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
};

export default Select;