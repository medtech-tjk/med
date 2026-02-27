import React from 'react';

const Logo = ({ className = "w-9 h-9 md:w-11 md:h-11", color = "currentColor" }) => {
    return (
        <svg
            className={`flex-shrink-0 ${className}`}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            fill={color}
        >
            {/* Left T - top horizontal bar */}
            <rect x="5" y="12" width="45" height="13" />

            {/* Left T - vertical stem */}
            <rect x="20" y="25" width="14" height="63" />

            {/* Right T (mirrored/reversed) - top horizontal bar */}
            <rect x="50" y="12" width="45" height="13" />

            {/* Right T - vertical stem going down partway */}
            <rect x="50" y="12" width="14" height="50" />

            {/* Right T - bottom horizontal connecting to left */}
            <rect x="34" y="50" width="30" height="12" />
        </svg>
    );
};

export default Logo;
