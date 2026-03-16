import PropTypes from "prop-types";

export default function Loader({ size = "md", text = "Loading...", className = "" }) {
  const sizeClasses = {
    sm: "spinner-border-sm",
    md: "",
    lg: "spinner-border-lg",
  };

  return (
    <div className={`d-flex flex-column align-items-center justify-content-center p-4 ${className}`}>
      <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <div className="mt-2 text-muted small">{text}</div>}
    </div>
  );
}

Loader.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  text: PropTypes.string,
  className: PropTypes.string,
};