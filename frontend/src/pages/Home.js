import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import DataManager from '../utils/DataManager';
import Footer from '../components/Footer';
import { FaMicrophone, FaMicrophoneSlash, FaArrowRight } from 'react-icons/fa';
import './Home.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function Home() {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [balance, setBalance] = useState(0);

    // Voice shortcut state
    const [isListening, setIsListening] = useState(false);
    const [voiceHint, setVoiceHint] = useState('');
    const [voicePulse, setVoicePulse] = useState(false);
    const recognitionRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('loggedInUser');
        setLoggedInUser(user || 'User');
        fetchStats();
        window.addEventListener('budgetwise_data_change', fetchStats);
        return () => window.removeEventListener('budgetwise_data_change', fetchStats);
    }, [])

    const fetchStats = async () => {
        const inc = await DataManager.getTotalIncome();
        const exp = await DataManager.getTotalExpenses();
        setTotalIncome(inc);
        setTotalExpense(exp);
        setBalance(inc - exp);
    }

    /* ---- Voice shortcut logic ---- */
    const handleVoiceShortcut = () => {
        if (!SpeechRecognition) {
            setVoiceHint('❌ Voice not supported in this browser.');
            return;
        }
        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognitionRef.current = recognition;

        recognition.onstart = () => {
            setIsListening(true);
            setVoicePulse(true);
            setVoiceHint('🎙️ Listening... say "add expense", "view dashboard", "reports" etc.');
        };
        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript.toLowerCase();
            setIsListening(false);
            setVoicePulse(false);

            if (text.includes('expense') || text.includes('add')) {
                setVoiceHint(`✅ "${text}" → Going to Add Expense...`);
                setTimeout(() => navigate('/expenses'), 800);
            } else if (text.includes('dashboard') || text.includes('chart') || text.includes('analytic')) {
                setVoiceHint(`✅ "${text}" → Opening Dashboard...`);
                setTimeout(() => navigate('/dashboard'), 800);
            } else if (text.includes('report') || text.includes('export')) {
                setVoiceHint(`✅ "${text}" → Opening Reports...`);
                setTimeout(() => navigate('/reports'), 800);
            } else if (text.includes('categor')) {
                setVoiceHint(`✅ "${text}" → Opening Categories...`);
                setTimeout(() => navigate('/categories'), 800);
            } else if (text.includes('income')) {
                setVoiceHint(`✅ "${text}" → Opening Income...`);
                setTimeout(() => navigate('/income'), 800);
            } else if (text.includes('goal') || text.includes('saving')) {
                setVoiceHint(`✅ "${text}" → Opening Goals...`);
                setTimeout(() => navigate('/goals'), 800);
            } else if (text.includes('profile')) {
                setVoiceHint(`✅ "${text}" → Opening Profile...`);
                setTimeout(() => navigate('/profile'), 800);
            } else if (text.includes('help')) {
                setVoiceHint(`✅ "${text}" → Opening Help Desk...`);
                setTimeout(() => navigate('/helpdesk'), 800);
            } else {
                setVoiceHint(`❓ Didn't understand "${text}". Try: "add expense", "dashboard", "reports".`);
            }
        };
        recognition.onerror = (e) => {
            setIsListening(false); setVoicePulse(false);
            setVoiceHint(`❌ Error: ${e.error}`);
        };
        recognition.onend = () => { setIsListening(false); setVoicePulse(false); };
        recognition.start();
    };

    return (
        <div className="home-content-wrapper">
            <main className="home-main">
                <div className="home-glass-panel">
                    <section className="welcome-hero animate-slide-up">
                        <div className="welcome-content">
                            <div className="greeting-section">
                                <span className="greeting-text">Hello,</span>
                                <h1 className="welcome-title">
                                    Welcome back, <span className="user-name">{loggedInUser}</span>
                                </h1>
                                <p className="welcome-subtitle">
                                    Track your expenses, manage your budget, and achieve your financial goals with AI-driven insights.
                                </p>

                                {/* ---- AI Voice Shortcut Bar ---- */}
                                <div style={{
                                    margin: '20px 0',
                                    padding: '16px 20px',
                                    borderRadius: '14px',
                                    background: isListening
                                        ? 'rgba(239,83,80,0.12)'
                                        : 'rgba(100,181,246,0.08)',
                                    border: `1.5px solid ${isListening ? 'rgba(239,83,80,0.5)' : 'rgba(100,181,246,0.35)'}`,
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    flexWrap: 'wrap'
                                }}>
                                    <button
                                        onClick={handleVoiceShortcut}
                                        title="AI Voice Navigation"
                                        style={{
                                            width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer',
                                            border: `2px solid ${isListening ? '#ef5350' : '#64b5f6'}`,
                                            background: isListening ? 'rgba(239,83,80,0.2)' : 'rgba(100,181,246,0.15)',
                                            color: isListening ? '#ef5350' : '#64b5f6',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0, transition: 'all 0.3s ease',
                                            boxShadow: voicePulse ? '0 0 0 8px rgba(100,181,246,0.12)' : 'none',
                                            animation: voicePulse ? 'voicePulse 1.2s ease-in-out infinite' : 'none'
                                        }}
                                    >
                                        {isListening ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
                                    </button>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.95rem', marginBottom: '3px' }}>
                                            AI Voice Assistant
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            {voiceHint || 'Click the mic and say "add expense", "dashboard", "reports" and more...'}
                                        </div>
                                    </div>
                                    <Link to="/expenses" style={{
                                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                                        borderRadius: '8px', background: 'rgba(100,181,246,0.15)',
                                        border: '1px solid rgba(100,181,246,0.3)', color: '#90caf9',
                                        textDecoration: 'none', fontSize: '0.82rem', fontWeight: '600', flexShrink: 0
                                    }}>
                                        Add Expense <FaArrowRight size={11} />
                                    </Link>
                                </div>

                                {/* Stats */}
                                <div className="stats-box-container animate-slide-up delay-100">
                                    <div className="stat-card">
                                        <h3 style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '8px' }}>Total Balance</h3>
                                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: balance >= 0 ? '#4caf50' : '#ef5350' }}>${balance.toFixed(2)}</p>
                                    </div>
                                    <div className="stat-card">
                                        <h3 style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '8px' }}>Income</h3>
                                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#64b5f6' }}>${totalIncome.toFixed(2)}</p>
                                    </div>
                                    <div className="stat-card">
                                        <h3 style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '8px' }}>Bi-Weekly Spend</h3>
                                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ef5350' }}>${totalExpense.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="hero-visual animate-scale-in delay-200">
                                <div className="floating-shape shape-1"></div>
                                <div className="floating-shape shape-2"></div>
                                <div className="floating-shape shape-3"></div>
                            </div>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="products-section animate-slide-up delay-300">
                        <div className="products-container">
                            <h2 className="products-title">Quick Actions</h2>
                            <div className="products-grid">
                                <Link to="/expenses" className="product-card quick-action-card animate-scale-in delay-400" style={{ textDecoration: 'none' }}>
                                    <div className="product-info">
                                        <h3 className="product-name">Add Expense</h3>
                                        <p className="product-price">Voice, receipt, or manual</p>
                                    </div>
                                </Link>
                                <Link to="/dashboard" className="product-card quick-action-card animate-scale-in delay-500" style={{ textDecoration: 'none' }}>
                                    <div className="product-info">
                                        <h3 className="product-name">View Dashboard</h3>
                                        <p className="product-price">Detailed analytics</p>
                                    </div>
                                </Link>
                                <Link to="/reports" className="product-card quick-action-card animate-scale-in delay-600" style={{ textDecoration: 'none' }}>
                                    <div className="product-info">
                                        <h3 className="product-name">Export Reports</h3>
                                        <p className="product-price">Download CSV Data</p>
                                    </div>
                                </Link>
                                <Link to="/categories" className="product-card quick-action-card animate-scale-in delay-700" style={{ textDecoration: 'none' }}>
                                    <div className="product-info">
                                        <h3 className="product-name">Categories</h3>
                                        <p className="product-price">Manage Expense Types</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
            <style>{`
                @keyframes voicePulse {
                  0%,100% { box-shadow: 0 0 0 0 rgba(100,181,246,0.4); }
                  50% { box-shadow: 0 0 0 12px rgba(100,181,246,0); }
                }
            `}</style>
        </div>
    )
}

export default Home
