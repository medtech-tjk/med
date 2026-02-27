import React from 'react';

const Logo = ({ className = "w-9 h-9 md:w-11 md:h-11", color = "currentColor" }) => {
    return (
        <svg
            className={`flex-shrink-0 ${className}`}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            fill={color}
        >
            {/* Left Shape (Γ) */}
            <rect x="10" y="15" width="18" height="70" /> {/* Vertical stem */}
            <rect x="28" y="15" width="24" height="18" /> {/* Horizontal top arm extending right */}

            {/* Right Shape (Γ) */}
            <rect x="62" y="15" width="18" height="70" /> {/* Vertical stem */}
            <rect x="80" y="15" width="10" height="18" /> {/* Horizontal top arm extending right */}
        </svg>
    );
};

export default Logo;
