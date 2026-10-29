import { useState } from "react";
import PublicLayout from "../../components/layout/PublicLayout";
import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import FilterChips from "../../components/common/FilterChips";
import AdminExhibitorCard from "../../components/admin/AdminExhibitorCard";
import useFetch from "../../hooks/useFetch";
import { getAdminExhibitors, updateExhibitorStatus } from "../../apis/adminApi";
import { notifyError, notifySuccess } from "../../utils/notify";

const FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" }
];

const AdminExhibitorsPage = () => {
  // Admin ka asli kaam pending companies dekhna hai, isliye shuru mein wahi dikhti hain
  const [status, setStatus] = useState("pending");
  const [busyId, setBusyId] = useState(null);

  const { data: exhibitors, loading, error, reload } = useFetch(
    () => getAdminExhibitors(status ? { approvalStatus: status } : undefined),
    [status]
  );

  const handleChangeStatus = async (exhibitor, approvalStatus) => {
    setBusyId(exhibitor._id);
    try {
      await updateExhibitorStatus(exhibitor._id, approvalStatus);
      notifySuccess(`${exhibitor.companyName} is now ${approvalStatus}`);
      reload();
    } catch (requestError) {
      notifyError(requestError);
    } finally {
      setBusyId(null);
    }
  };

  const renderContent = () => {
    if (loading) return <PageLoader text="Loading exhibitors..." />;
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

    if (exhibitors.length === 0) {
      return (
        <EmptyState
          title="No exhibitors here"
          message={status ? `There are no ${status} exhibitors right now.` : "No exhibitor has created a company profile yet."}
        />
      );
    }

    return (
      <div className="admin-list">
        {exhibitors.map((exhibitor) => (
          <AdminExhibitorCard
            key={exhibitor._id}
            exhibitor={exhibitor}
            busy={busyId === exhibitor._id}
            onChangeStatus={handleChangeStatus}
          />
        ))}
      </div>
    );
  };

  return (
    <PublicLayout>
      <div className="page-container">
        <PageHeader title="Manage exhibitors" subtitle="Approve companies so visitors can see them" />
        <FilterChips options={FILTERS} value={status} onChange={setStatus} label="Filter exhibitors by status" />
        {renderContent()}
      </div>
    </PublicLayout>
  );
};

export default AdminExhibitorsPage;

