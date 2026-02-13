import React from 'react';
import { FaCoins, FaChartLine, FaShieldAlt, FaRocket } from 'react-icons/fa';

const FloatingStickers = () => {
    return (
        <div className="hero-stickers" style={{ position: 'fixed', zIndex: 0, top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none' }}>
            <FaCoins className="sticker s1" />
            <FaChartLine className="sticker s2" />
            <FaShieldAlt className="sticker s3" />
            <FaRocket className="sticker s4" />
        </div>
    );
};

export default FloatingStickers;
