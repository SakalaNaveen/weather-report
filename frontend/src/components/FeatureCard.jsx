import React from "react";

function FeatureCard({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <div className="feature-card" onClick={onClick}>
      <div className="feature-icon">
        {icon}
      </div>

      <div className="feature-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <div className="feature-arrow">
        →
      </div>
    </div>
  );
}

export default FeatureCard;