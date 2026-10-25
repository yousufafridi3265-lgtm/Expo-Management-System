import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";

// TEMPORARY: login ka nateeja dekhne ke liye. Agle steps mein har role ka asli dashboard aaye ga
const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <main className="page-container">
      <PageHeader title={`Welcome, ${user.name}`} subtitle={`Logged in as ${user.role}`}>
        <Button variant="secondary" onClick={logout}>
          Log out
        </Button>
      </PageHeader>

      <section className="card">
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
      </section>
    </main>
  );
};

export default DashboardPage;