// Page ka title. children mein action buttons (jaise "Add event") aate hain
const PageHeader = ({ title, subtitle, children }) => {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-header-title" title={title}>{title}</h1>
        {subtitle && <p className="page-header-subtitle" title={subtitle}>{subtitle}</p>}
      </div>
      {children && <div className="page-header-actions" title={children}>{children}</div>}
    </div>
  );
};

export default PageHeader;