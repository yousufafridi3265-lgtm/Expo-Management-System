import { Link } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState";
import { ROUTES } from "../../routePaths";

const NotFoundPage = () => {
  return (
    <main className="page-container">
      <EmptyState title="Page not found" message="The page you are looking for does not exist.">
        <Link to={ROUTES.home} className="btn btn-primary">
          Go home
        </Link>
      </EmptyState>
    </main>
  );
};

export default NotFoundPage;