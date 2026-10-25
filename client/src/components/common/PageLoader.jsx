import logo from "../../assets/logo.jpg";

// Jab tak backend se data na aaye, hamara logo ghoomta rehta hai.
// fullScreen=true: poori screen (jaise login check ke waqt), warna sirf page ke hisse mein
const PageLoader = ({ text = "Loading...", fullScreen = false }) => {
  return (
    <div className={`page-loader ${fullScreen ? "page-loader-full" : ""}`} role="status">
      <img src={logo} alt="" className="page-loader-logo" />
      <p className="page-loader-text">{text}</p>
    </div>
  );
};

export default PageLoader;