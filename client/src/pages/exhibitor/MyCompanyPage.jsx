import { useEffect, useState } from "react";
import PublicLayout from "../../components/layout/PublicLayout";
import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import ErrorMessage from "../../components/common/ErrorMessage";
import ApprovalNotice from "../../components/exhibitor/ApprovalNotice";
import CompanyProfileForm from "../../components/exhibitor/CompanyProfileForm";
import LogoUploader from "../../components/exhibitor/LogoUploader";
import ProductsManager from "../../components/exhibitor/ProductsManager";
import useFetch from "../../hooks/useFetch";
import {
  createExhibitorProfile,
  getMyExhibitorProfile,
  updateMyExhibitorProfile
} from "../../apis/exhibitorApi";
import { notifySuccess } from "../../utils/notify";

// Backend profile na ho to 404 deta hai. Yeh error nahi, "abhi profile nahi bana" ki nishani hai
const loadMyProfile = () =>
  getMyExhibitorProfile()
    .then((response) => ({ data: { profile: response.data } }))
    .catch((error) => {
      if (error.response?.status === 404) return { data: { profile: null } };
      throw error;
    });

const MyCompanyPage = () => {
  const { data, loading, error, reload } = useFetch(loadMyProfile, []);

  // Save ke baad backend ka naya profile seedha yahan rakhte hain, taake poora page dobara load na ho
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (data) setProfile(data.profile);
  }, [data]);

  const handleCreate = async (formData) => {
    const response = await createExhibitorProfile(formData);
    setProfile(response.data);
    notifySuccess("Company profile created");
  };

  const handleUpdate = async (formData) => {
    const response = await updateMyExhibitorProfile(formData);
    setProfile(response.data);
    notifySuccess("Company profile saved");
  };

  const renderContent = () => {
    if (loading || !data) {
      return error ? <ErrorMessage message={error} onRetry={reload} /> : <PageLoader text="Loading your company..." />;
    }

    if (!profile) {
      return (
        <section className="card portal-section">
          <h2 className="portal-section-title">Create your company profile</h2>
          <p className="registration-note">
            Tell visitors about your company. The organizers will review it before it appears publicly.
          </p>
          <CompanyProfileForm submitLabel="Create profile" onSubmit={handleCreate} />
        </section>
      );
    }

    return (
      <>
        <section className="card portal-section">
          <LogoUploader profile={profile} onUploaded={setProfile} />
          <ApprovalNotice profile={profile} />
        </section>

        <section className="card portal-section">
          <h2 className="portal-section-title">Company details</h2>
          <CompanyProfileForm initialValues={profile} submitLabel="Save changes" onSubmit={handleUpdate} />
        </section>

        <section className="card portal-section">
          <h2 className="portal-section-title">Products</h2>
          <ProductsManager products={profile.products} onChanged={setProfile} />
        </section>
      </>
    );
  };

  return (
    <PublicLayout>
      <div className="page-container">
        <PageHeader title="My company" subtitle="Manage how your company appears to visitors" />
        <div className="portal-stack">{renderContent()}</div>
      </div>
    </PublicLayout>
  );
};

export default MyCompanyPage;
