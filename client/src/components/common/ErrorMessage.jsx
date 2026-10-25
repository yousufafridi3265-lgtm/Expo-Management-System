import { FiAlertCircle } from "react-icons/fi";
import Button from "./Button";

// API fail ho to page khali nahi chhodte, yeh dikhate hain. onRetry dein to "Try again" button aata hai
const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div role="alert" className="error-message">
      <FiAlertCircle className="error-message-icon" aria-hidden="true" />
      <p className="error-message-text">{message || "Something went wrong."}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;