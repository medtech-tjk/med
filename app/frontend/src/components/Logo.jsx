import React from 'react';


/**
 * Logo component that loads the user's own SVG logos from the backend.
 * 
 * @param {string} variant - "header" uses 1.svg (dark/blue logo), "footer" uses 2.svg (white logo)
 * @param {string} className - Tailwind CSS classes for sizing
 */
const Logo = ({ className = "w-9 h-9 md:w-11 md:h-11", variant = "header" }) => {
    const logoUrl = variant === "footer" ? '/logo-white.png' : '/logo.svg';

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


