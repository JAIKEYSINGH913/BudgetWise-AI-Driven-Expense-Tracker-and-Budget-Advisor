import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaChartLine, FaPiggyBank, FaShieldAlt } from 'react-icons/fa';
import DemoLock from '../components/DemoLock';
import FloatingStickers from '../components/FloatingStickers';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isLocked, setIsLocked] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600 seconds)

    // Timer Logic
    useEffect(() => {
        // Check if user is already logged in
        if (localStorage.getItem('loggedInUser')) {
            // Optional: Redirect to home or let them se landing?
            // User requested demo page. Let's redirect logged in users to Home for better UX.
            navigate('/home');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsLocked(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    // Format time for display (optional, if we want to show it)
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="landing-page">
            {isLocked && <DemoLock />}

            {/* Background Bubbles */}
            <div className="bubbles-container">
                <div className="bubble bubble--1"></div>
                <div className="bubble bubble--2"></div>
                <div className="bubble bubble--3"></div>
                <div className="bubble bubble--4"></div>
                <div className="bubble bubble--5"></div>
            </div>

            {/* Timed Demo Indicator (Bottom Left Floating) */}
            {!isLocked && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    top: 'auto',
                    transform: 'none',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '8px 16px',
                    borderRadius: '50px',
                    zIndex: 101,
                    fontSize: '0.9rem',
                    color: '#fff',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 500
                }}>
                    <span style={{ width: '8px', height: '8px', background: '#4caf50', borderRadius: '50%', display: 'inline-block' }}></span>
                    Demo Session: {formatTime(timeLeft)}
                </div>
            )}

            {/* Navbar */}
            <nav className="landing-navbar">
                <div className="landing-brand">BudgetWise</div>
                <div className="nav-links">
                    <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
                    <button className="btn-signup" onClick={() => navigate('/signup')}>Sign Up</button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="landing-hero">
                <FloatingStickers />

                <div className="hero-content">
                    <h1 className="hero-title">Master Your Money. <br /> Build Your Future.</h1>
                    <p className="hero-subtitle">
                        Experience the most intuitive, beautiful, and powerful personal finance tracker.
                        Join thousands of users who have taken control of their financial destiny.
                    </p>
                    <div className="hero-cta">
                        <button className="btn-primary-large" onClick={() => navigate('/signup')}>Start Your Journey</button>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="features-section">
                <div className="features-glass-panel">
                    <div className="section-title">Why BudgetWise?</div>
                    <div className="features-grid">
                        <div className="feature-card glass-sheen">
                            <FaWallet className="feature-icon" style={{ color: '#4CAF50' }} />
                            <h3 className="feature-title">Smart Expense Tracking</h3>
                            <p className="feature-desc">
                                Effortlessly record daily transactions. Categorize spending and see exactly where your money goes with intuitive charts.
                            </p>
                        </div>
                        <div className="feature-card glass-sheen">
                            <FaPiggyBank className="feature-icon" style={{ color: '#FFD700' }} />
                            <h3 className="feature-title">Goal Management</h3>
                            <p className="feature-desc">
                                Dreaming of a new car or vacation? Set financial targets, track your progress, and celebrate milestones.
                            </p>
                        </div>
                        <div className="feature-card glass-sheen">
                            <FaChartLine className="feature-icon" style={{ color: '#2196F3' }} />
                            <h3 className="feature-title">Detailed Analytics</h3>
                            <p className="feature-desc">
                                Visualize your financial health with interactive reports. Analyze trends, income vs. expenses, and more.
                            </p>
                        </div>
                        <div className="feature-card glass-sheen">
                            <FaShieldAlt className="feature-icon" style={{ color: '#FF5722' }} />
                            <h3 className="feature-title">Secure & Private</h3>
                            <p className="feature-desc">
                                Your data is yours alone. We use industry-standard security practices to ensure your financial information stays safe.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
