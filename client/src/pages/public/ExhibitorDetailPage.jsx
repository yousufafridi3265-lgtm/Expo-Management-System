import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiMapPin, FiPhone } from "react-icons/fi";
import PublicLayout from "../../components/layout/PublicLayout";
import PageLoader from "../../components/common/PageLoader";
import ErrorMessage from "../../components/common/ErrorMessage";
import ExhibitorLogo from "../../components/common/ExhibitorLogo";
import useFetch from "../../hooks/useFetch";
import { getExhibitorById } from "../../apis/exhibitorApi";
import { ROUTES } from "../../routePaths";

const ExhibitorDetailPage = () => {
  const { id } = useParams();
  const { data: exhibitor, loading, error, reload } = useFetch(() => getExhibitorById(id), [id]);

  const renderContent = () => {
    if (loading) return <PageLoader text="Loading exhibitor..." />;
    // Galat id (400) ya approved nahi / nahi mila (404): backend ka message dikha dete hain
    if (error) return <ErrorMessage message={error} onRetry={reload} />;

    return (
      <article className="card event-detail">
        <div className="exhibitor-detail-top">
          <ExhibitorLogo logo={exhibitor.logo} companyName={exhibitor.companyName} size="lg" />
          <div>
            <h1 className="event-detail-title">{exhibitor.companyName}</h1>
            <span className="badge badge-info">{exhibitor.category}</span>
          </div>
        </div>

        <p className="event-meta">
          <FiMapPin aria-hidden="true" />
          {exhibitor.address}
        </p>
        <p className="event-meta">
          <FiPhone aria-hidden="true" />
          {exhibitor.phone}
        </p>

        <h2 className="event-detail-heading">About</h2>
        <p className="event-detail-text">{exhibitor.description || "No description has been added yet."}</p>

        <h2 className="event-detail-heading">Products</h2>
        {exhibitor.products.length === 0 ? (
          <p className="registration-note">No products have been listed yet.</p>
        ) : (
          <ul className="product-list">
            {exhibitor.products.map((product, index) => (
              <li key={`${product.name}-${index}`} className="product-item">
                <p className="product-name">{product.name}</p>
                {product.description && <p className="feature-text">{product.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </article>
    );
  };

  return (
    <PublicLayout>
      <div className="page-container">
        <Link to={ROUTES.exhibitors} className="back-link">
          <FiArrowLeft aria-hidden="true" />
          Back to exhibitors
        </Link>
        {renderContent()}
      </div>
    </PublicLayout>
  );
};

export default ExhibitorDetailPage;
