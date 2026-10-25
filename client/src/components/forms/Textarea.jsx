import { useId } from "react";
import FormField from "./FormField";

const Textarea = ({ label, error, required, rows = 4, className = "", ...rest }) => {
  const id = useId();

  return (
    <FormField id={id} label={label} error={error} required={required}>
      <textarea
        id={id}
        rows={rows}
        required={required}
        className={`field ${error ? "field-error" : ""} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
    </FormField>
  );
};

export default Textarea;