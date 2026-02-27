import React from 'react';

const Logo = ({ className = "w-9 h-9 md:w-11 md:h-11", color = "currentColor" }) => {
    return (
        <svg
            className={`flex-shrink-0 ${className}`}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            fill={color}
        >
            {/* Top-left horizontal bar of the T */}
            <rect x="10" y="15" width="38" height="12" />

            {/* Left vertical stem of the T */}
            <rect x="22" y="27" width="14" height="55" />

            {/* Top-right horizontal bar (top of the reversed L / Г) */}
            <rect x="52" y="15" width="38" height="12" />

            {/* Right vertical stem (going down from that bar) */}
            <rect x="52" y="15" width="14" height="42" />

            {/* Bottom horizontal bar connecting right stem back to center */}
            <rect x="36" y="57" width="30" height="12" />
        </svg>
    );
};

export default Logo;
