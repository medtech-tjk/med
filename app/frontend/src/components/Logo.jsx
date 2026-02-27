import React from 'react';

const Logo = ({ className = "w-9 h-9 md:w-11 md:h-11", color = "currentColor" }) => {
    return (
        <svg
            className={`flex-shrink-0 ${className}`}
            viewBox="0 0 400 350"
            xmlns="http://www.w3.org/2000/svg"
            fill={color}
        >
            {/* Left Top Bar (The "Gamma" part without its vertical, as requested) */}
            <rect x="20" y="40" width="170" height="55" />

            {/* Right/Bottom Shape (The "Z" part) */}
            {/* Top horizontal of Z */}
            <rect x="210" y="40" width="170" height="55" />

            {/* Vertical of Z - moved to the right edge and shortened at the bottom */}
            <rect x="325" y="40" width="55" height="180" />

            {/* Bottom horizontal of Z - connecting back to the left from the right vertical */}
            <rect x="100" y="165" width="280" height="55" />
        </svg>
    );
};

export default Logo;
