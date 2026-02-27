const Logo = ({ className = "w-9 h-9 md:w-11 md:h-11", color = "currentColor" }) => {
    return (
        <svg
            className={`flex-shrink-0 ${className}`}
            viewBox="0 0 384 339"
            xmlns="http://www.w3.org/2000/svg"
            fill={color}
        >
            {/* Left Shape (T-like without vertical on top) */}
            <rect x="0" y="20" width="180" height="52" /> {/* Top horizontal */}
            <rect x="80" y="72" width="52" height="230" /> {/* Main vertical stem */}
            <rect x="132" y="250" width="48" height="52" /> {/* Bottom right nub */}

            {/* Right Shape (Γ) */}
            <rect x="230" y="20" width="120" height="52" /> {/* Top horizontal */}
            <rect x="230" y="20" width="52" height="200" /> {/* Shortened vertical stem */}
        </svg>
    );
};

export default Logo;


