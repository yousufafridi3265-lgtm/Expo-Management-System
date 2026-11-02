import { useState } from "react";
import { FiFileText, FiGrid } from "react-icons/fi";
import Button from "../common/Button";
import { notifyError, notifySuccess } from "../../utils/notify";

// "Excel" aur "PDF" download buttons. onExcel / onPdf: promise wapas karne wale functions
// disabled: dikhane ko kuch na ho to dono band
const ExportButtons = ({ onExcel, onPdf, disabled = false }) => {
  // Kaun sa export chal raha hai: "excel", "pdf" ya null
  const [busy, setBusy] = useState(null);

  const run = async (kind, action, doneMessage) => {
    setBusy(kind);
    try {
      await action();
      notifySuccess(doneMessage);
    } catch (error) {
      notifyError(error);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="export-actions">
      <Button
        variant="secondary"
        onClick={() => run("excel", onExcel, "Excel file downloaded")}
        loading={busy === "excel"}
        disabled={disabled || busy !== null}
      >
        <FiGrid aria-hidden="true" />
        Excel
      </Button>
      <Button
        variant="secondary"
        onClick={() => run("pdf", onPdf, "PDF file downloaded")}
        loading={busy === "pdf"}
        disabled={disabled || busy !== null}
      >
        <FiFileText aria-hidden="true" />
        PDF
      </Button>
    </div>
  );
};

export default ExportButtons;