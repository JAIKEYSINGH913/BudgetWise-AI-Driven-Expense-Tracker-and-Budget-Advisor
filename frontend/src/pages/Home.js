import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import DataManager from '../utils/DataManager';
import Footer from '../components/Footer';
import VoiceAssistantOverlay from '../components/VoiceAssistantOverlay';
import './Home.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function Home() {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [balance, setBalance] = useState(0);

    const [isListening, setIsListening] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [voiceStatus, setVoiceStatus] = useState('');
    const recRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser') || 'User');
        fetchStats();
        window.addEventListener('budgetwise_data_change', fetchStats);
        return () => window.removeEventListener('budgetwise_data_change', fetchStats);
    }, []);

    const fetchStats = async () => {
        const inc = await DataManager.getTotalIncome();
        const exp = await DataManager.getTotalExpenses();
        setTotalIncome(inc); setTotalExpense(exp); setBalance(inc - exp);
    };

    /* ---- Voice Navigation ---- */
    const navigateByText = (text) => {
        const map = [
            { kw: ['expense', 'add expense', 'add spending'], path: '/expenses' },
            { kw: ['dashboard', 'chart', 'analytic'], path: '/dashboard' },
            { kw: ['report', 'export'], path: '/reports' },
            { kw: ['categor'], path: '/categories' },
            { kw: ['income'], path: '/income' },
            { kw: ['goal', 'saving'], path: '/goals' },
            { kw: ['profile'], path: '/profile' },
            { kw: ['help'], path: '/helpdesk' },
        ];
        const t = text.toLowerCase();
        for (const { kw, path } of map) {
            if (kw.some(k => t.includes(k))) {
                setVoiceStatus(`✅ Navigating to ${path.slice(1)}...`);
                setTimeout(() => navigate(path), 700);
                return true;
            }
        }
        return false;
    };

    const startListening = () => {
        if (!SpeechRecognition) { setVoiceStatus('❌ Voice not supported. Use Chrome/Edge.'); return; }
        const r = new SpeechRecognition();
        r.lang = 'en-US'; r.interimResults = true; r.continuous = false;
        recRef.current = r;
        r.onstart = () => { setIsListening(true); setVoiceTranscript(''); setVoiceStatus('Listening for a command...'); };
        r.onresult = (ev) => {
            const t = Array.from(ev.results).map(x => x[0].transcript).join('');
            setVoiceTranscript(t);
        };
        r.onend = () => {
            setIsListening(false);
            setVoiceStatus('Say a command: "add expense", "dashboard", "reports" etc. Click → to navigate.');
        };
        r.onerror = (ev) => { setIsListening(false); setVoiceStatus(`❌ Error: ${ev.error}`); };
        r.start();
    };

    const cancelVoice = () => {
        recRef.current?.stop();
        setIsListening(false); setVoiceTranscript(''); setVoiceStatus('');
    };

    const submitVoice = () => {
        if (!voiceTranscript) return;
        const found = navigateByText(voiceTranscript);
        if (!found) setVoiceStatus(`❓ Didn't understand "${voiceTranscript}". Try: "add expense", "dashboard".`);
        setVoiceTranscript('');
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

                                {/* ---- AI Voice Shortcut using overlay ---- */}
                                <VoiceAssistantOverlay
                                    isActive={isListening}
                                    transcript={voiceTranscript}
                                    statusHint={voiceStatus || 'Say "add expense", "dashboard", "reports" and more to navigate instantly'}
                                    onStart={startListening}
                                    onCancel={cancelVoice}
                                    onSubmit={submitVoice}
                                />

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
        </div>
    );
}

export default Home
