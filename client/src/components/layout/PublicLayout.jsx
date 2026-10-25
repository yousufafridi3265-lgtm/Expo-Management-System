import Navbar from "./Navbar";
import Footer from "./Footer";

// Public pages ka dhancha: upar Navbar, neeche Footer, beech mein page ka content
const PublicLayout = ({ children }) => {
  return (
    <div className="site-shell">
      <Navbar />
      <main className="site-main">{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;