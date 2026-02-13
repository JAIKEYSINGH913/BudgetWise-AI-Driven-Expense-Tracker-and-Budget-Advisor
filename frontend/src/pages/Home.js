import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
// import { handleSuccess } from '../utils'; // Removed unused import
import DataManager from '../utils/DataManager'; // Import DataManager
import './Home.css';

function Home() {
    const [loggedInUser, setLoggedInUser] = useState('');

    // Dynamic Stats State
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const user = localStorage.getItem('loggedInUser');
        setLoggedInUser(user || 'User');
        fetchStats(); // Fetch stats on load

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

    return (
        <div className="home-content-wrapper">
            {/* Main Content - Full Page Welcome Section */}
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
                                    Your personal finance command center.
                                </p>

                                {/* Dynamic Stats Cards */}
                                <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                                    <div className="stat-card animate-slide-up delay-100" style={{ background: 'rgba(255,255,255,0.1)', padding: '15px 25px', borderRadius: '15px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <h3 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>Total Balance</h3>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: balance >= 0 ? '#4caf50' : '#ef5350' }}>${balance.toFixed(2)}</p>
                                    </div>
                                    <div className="stat-card animate-slide-up delay-200" style={{ background: 'rgba(255,255,255,0.1)', padding: '15px 25px', borderRadius: '15px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <h3 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>Income</h3>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#64b5f6' }}>${totalIncome.toFixed(2)}</p>
                                    </div>
                                    <div className="stat-card animate-slide-up delay-300" style={{ background: 'rgba(255,255,255,0.1)', padding: '15px 25px', borderRadius: '15px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <h3 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>Bi-Weekly Spend</h3>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef5350' }}>${totalExpense.toFixed(2)}</p>
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

                    {/* Quick Actions / Home Options */}
                    <section className="products-section animate-slide-up delay-300">
                        <div className="products-container">
                            <h2 className="products-title">Quick Actions</h2>
                            <div className="products-grid">
                                <Link to="/expenses" className="product-card quick-action-card animate-scale-in delay-400" style={{ textDecoration: 'none' }}>
                                    <div className="product-info">
                                        <h3 className="product-name">Add Expense</h3>
                                        <p className="product-price">Record a new transaction</p>
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
        </div>
    )
}

export default Home
