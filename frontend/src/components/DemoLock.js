import React from 'react';
import { FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../pages/LandingPage.css';

const DemoLock = () => {
    const navigate = useNavigate();

    return (
        <div className="demo-lock-overlay">
            <div className="lock-card">
                <FaLock className="lock-icon animate-pulse-soft" />
                <h2 className="lock-title">Demo Session Expired</h2>
                <p className="lock-desc">
                    Your 10-minute demo session has ended. <br />
                    Please sign up or login to continue managing your finances.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button className="btn-signup" onClick={() => navigate('/signup')}>Sign Up</button>
                    <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
                </div>
            </div>
        </div>
    );
};

export default DemoLock;
