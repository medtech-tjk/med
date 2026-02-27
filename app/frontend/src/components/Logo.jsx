import React from 'react';

const Logo = ({ className = "w-9 h-9 md:w-11 md:h-11", color = "currentColor" }) => {
    return (
        <svg
            className={`flex-shrink-0 ${className}`}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            fill={color}
        >
            {/* Top horizontal bar (spans across both stems with overhang) */}
            <rect x="15" y="25" width="70" height="12" />

            {/* Left vertical stem (forms the T) */}
            <rect x="30" y="37" width="12" height="48" />

            {/* Right vertical stem (forms the top of the L) */}
            <rect x="58" y="37" width="12" height="28" />

            {/* Bottom horizontal bar (forms the bottom of the L, connecting to the T) */}
            <rect x="30" y="73" width="40" height="12" />
        </svg>
    );
};

export default Logo;
