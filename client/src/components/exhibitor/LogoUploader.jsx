import { useRef, useState } from "react";
import { FiUpload } from "react-icons/fi";
import ExhibitorLogo from "../common/ExhibitorLogo";
import Button from "../common/Button";
import { uploadMyLogo } from "../../apis/exhibitorApi";
import { notifyError, notifySuccess } from "../../utils/notify";

// Backend ke rules: sirf JPG, PNG ya WEBP, aur 2 MB tak
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

// Logo dikhata hai aur naya logo chunte hi upload kar deta hai.
// onUploaded(profile): upload ke baad backend ka naya profile wapas deta hai
const LogoUploader = ({ profile, onUploaded }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

    const handleFileChange = async (event) => {
    const input = event.target;
    const file = input.files[0];
    if (!file) return;

    // Backend bhi check karta hai, magar yahan pehle check karne se bekar upload nahi hota
    if (!ALLOWED_TYPES.includes(file.type)) {
      notifyError("Logo must be a JPG, PNG or WEBP image");
      input.value = "";
      return;
    }
    if (file.size > MAX_SIZE) {
      notifyError("Logo must be 2 MB or smaller");
      input.value = "";
      return;
    }

    setUploading(true);
    try {
      const response = await uploadMyLogo(file);
      onUploaded(response.data);
      notifySuccess("Logo updated");
    } catch (error) {
      notifyError(error);
    } finally {
      setUploading(false);
      // Upload ke baad khali karte hain, taake wohi file dobara chunni ho to bhi change event chale
      input.value = "";
    }
  };

  return (
    <div className="logo-uploader">
      <ExhibitorLogo logo={profile.logo} companyName={profile.companyName} size="lg" />
      <div>
        <Button variant="secondary" onClick={() => inputRef.current.click()} loading={uploading}>
          <FiUpload aria-hidden="true" />
          {profile.logo ? "Change logo" : "Upload logo"}
        </Button>
        <p className="form-note">JPG, PNG or WEBP, up to 2 MB.</p>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          className="visually-hidden"
          onChange={handleFileChange}
          aria-label="Logo file"
        />
      </div>
    </div>
  );
};

export default LogoUploader;
