import React from 'react';

const Logo = ({ className = "w-9 h-9 md:w-11 md:h-11", color = "currentColor" }) => {
    return (
        <svg
            className={`flex-shrink-0 ${className}`}
            viewBox="0 0 384 339"
            xmlns="http://www.w3.org/2000/svg"
            fill={color}
        >
            {/* Left shape - top horizontal bar */}
            <rect x="0" y="0" width="210" height="52" />
            {/* Left shape - left vertical stem going down from top-left */}
            <rect x="0" y="0" width="52" height="150" />
            {/* Left shape - center vertical connection */}
            <rect x="80" y="100" width="52" height="239" />
            {/* Left shape - bottom horizontal bar */}
            <rect x="80" y="287" width="130" height="52" />

            {/* Right shape - vertical stem */}
            <rect x="252" y="0" width="52" height="339" />
            {/* Right shape - top horizontal extension right */}
            <rect x="252" y="0" width="132" height="52" />
        </svg>
    );
};

export default Logo;
