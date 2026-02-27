import React from 'react';

const API_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '');

/**
 * Logo component that loads the user's own SVG logos from the backend.
 * 
 * @param {string} variant - "header" uses 1.svg (dark/blue logo), "footer" uses 2.svg (white logo)
 * @param {string} className - Tailwind CSS classes for sizing
 */
const Logo = ({ className = "w-9 h-9 md:w-11 md:h-11", variant = "header" }) => {
    const logoFile = variant === "footer" ? "2.svg" : "1.svg";
    const logoUrl = `${API_URL}/uploads/logos/${logoFile}`;

    return (
        <img
            className={`flex-shrink-0 ${className}`}
            src={logoUrl}
            alt="Tib Technology"
            style={{ objectFit: 'contain' }}
        />
    );
};

export default Logo;


