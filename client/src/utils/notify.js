import toast from "react-hot-toast";
import { getErrorMessage } from "./getErrorMessage";

// Poori app mein toast yahin se dikhayein. Message hi id hai, isliye ek jaisa message do baar nahi aata
export const notifySuccess = (message) => toast.success(message, { id: message });

// API error aaye to seedha error do, yeh backend ka message nikal kar dikha de ga
export const notifyError = (error) => {
  const message = typeof error === "string" ? error : getErrorMessage(error);
  toast.error(message, { id: message });
};

