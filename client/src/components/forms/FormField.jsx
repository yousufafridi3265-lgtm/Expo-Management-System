// Label + field + error message ka common dhancha. Input, Select aur Textarea teeno isi ko use karte hain
const FormField = ({ id, label, error, required, children }) => {
  return (
    <div className="form-field">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="form-required"> *</span>}
        </label>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="form-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;