import React from 'react';
import '../index.css'; // Ensure it uses global styles

const BackgroundBubbles = () => {
    return (
        <div className="bubbles-container">
            <div className="bubble bubble--1"></div>
            <div className="bubble bubble--2"></div>
            <div className="bubble bubble--3"></div>
            <div className="bubble bubble--4"></div>
            <div className="bubble bubble--5"></div>
            <img src="/logo512.png" alt="" className="background-watermark" />
        </div>
    );
};

export default BackgroundBubbles;
