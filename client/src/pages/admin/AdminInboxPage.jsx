import { useState } from "react";
import PublicLayout from "../../components/layout/PublicLayout";
import PageHeader from "../../components/common/PageHeader";
import FilterChips from "../../components/common/FilterChips";
import AdminMessagesTab from "../../components/admin/AdminMessagesTab";
import AdminFeedbackTab from "../../components/admin/AdminFeedbackTab";

const TABS = [
  { value: "messages", label: "Messages" },
  { value: "feedback", label: "Feedback" }
];

const AdminInboxPage = () => {
  const [tab, setTab] = useState("messages");

  return (
    <PublicLayout>
      <div className="page-container">
        <PageHeader title="Inbox" subtitle="Questions and feedback from attendees and exhibitors" />
        <FilterChips options={TABS} value={tab} onChange={setTab} label="Show messages or feedback" />
        {/* Sirf khula hua tab data mangta hai */}
        {tab === "messages" ? <AdminMessagesTab /> : <AdminFeedbackTab />}
      </div>
    </PublicLayout>
  );
};

export default AdminInboxPage;
