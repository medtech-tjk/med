import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

const FloatingCart = () => {
    const [cartCount, setCartCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Load cart count on mount and when cart updates
    const loadCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(totalCount);
    };

    useEffect(() => {
        loadCartCount();
        window.addEventListener('cartUpdated', loadCartCount);
        return () => window.removeEventListener('cartUpdated', loadCartCount);
    }, []);

    // Trigger animation when cart count changes
    useEffect(() => {
        if (cartCount > 0) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 600);
            return () => clearTimeout(timer);
        }
    }, [cartCount]);

    // Hide on mobile as we have bottom navigation
    return (
        <Link
            to="/cart"
            className={`hidden md:flex fixed bottom-6 right-6 z-50 bg-[#074089] hover:bg-[#2C5BB4] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${isAnimating ? 'animate-bounce' : ''
                }`}
            title="Корзина"
        >
            <ShoppingCart size={28} />
            {cartCount > 0 && (
                <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg ${isAnimating ? 'animate-pulse scale-110' : ''
                    }`}>
                    {cartCount}
                </span>
            )}
        </Link>
    );
};

export default FloatingCart;
