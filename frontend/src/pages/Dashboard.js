import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import DataManager from '../utils/DataManager';
import { handleSuccess, handleError } from '../utils';
import { API_BASE_URL } from '../utils/apiConfig';
import './Home.css';
import {
    FaWallet, FaChartLine, FaMoneyBillWave, FaExchangeAlt,
    FaUserCircle, FaCloudDownloadAlt, FaFileImport, FaDownload,
    FaPlus, FaTrash, FaFileExport, FaPalette, FaImage
} from 'react-icons/fa';
import FloatingStickers from '../components/FloatingStickers';

// --- Sub-components ---

const DashboardOverview = () => {
    // ... existing code ...
    // Copy existing DashboardOverview code exactly as is
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [monthlyRemaining, setMonthlyRemaining] = useState(0);
    const [goals, setGoals] = useState([]);

    useEffect(() => {
        const load = async () => {
            const incomeList = await DataManager.getIncome();
            const expenseList = await DataManager.getExpenses();
            setGoals(await DataManager.getGoals());

            // 1. Calculate Lifetime Totals
            const tIncome = incomeList.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);
            const tExpenses = expenseList.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);
            setTotalIncome(tIncome);
            setTotalExpenses(tExpenses);

            // 2. Calculate Monthly Remaining (Current Month)
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const mIncome = incomeList
                .filter(i => {
                    const d = new Date(i.date);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                })
                .reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);

            const mExpenses = expenseList
                .filter(e => {
                    const d = new Date(e.date);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                })
                .reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);

            setMonthlyRemaining(mIncome - mExpenses);
        };
        load();
        window.addEventListener('budgetwise_data_change', load);
        return () => window.removeEventListener('budgetwise_data_change', load);
    }, []);

    const totalSavings = totalIncome - totalExpenses;
    const goalsAchieved = goals.filter(g => {
        const current = g.type === 'yearly' ? totalSavings : (parseFloat(g.currentAmount) || 0);
        return current >= parseFloat(g.targetAmount || 0);
    }).length;

    return (
        <div className="products-grid">
            {/* 1. Remaining Budget (Monthly) */}
            <Link to="/expenses" className="product-card" style={{ textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
                <div className="product-info">
                    <h3 className="product-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaWallet style={{ color: '#6C63FF' }} /> Monthly Remaining
                    </h3>
                    <p className="product-price" style={{ color: monthlyRemaining >= 0 ? '#4caf50' : '#ef5350', fontSize: '1.8rem' }}>
                        ${monthlyRemaining.toFixed(2)}
                    </p>
                    <p style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '5px', color: 'var(--text-secondary)' }}>
                        Budget left for this month (Income - Expenses).
                    </p>
                </div>
            </Link>

            {/* 2. Total Savings (Lifetime) */}
            <Link to="/reports" className="product-card" style={{ textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
                <div className="product-info">
                    <h3 className="product-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaWallet style={{ color: '#4caf50' }} /> Total Savings (Life)
                    </h3>
                    <p className="product-price" style={{ color: totalSavings >= 0 ? '#4caf50' : '#ef5350', fontSize: '1.8rem' }}>
                        ${totalSavings.toFixed(2)}
                    </p>
                    <p style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '5px', color: 'var(--text-secondary)' }}>
                        Total accumulated wealth (Lifetime Rollovers).
                    </p>
                </div>
            </Link>

            {/* Total Income */}
            <Link to="/dashboard/income" className="product-card" style={{ textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
                <div className="product-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="product-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaMoneyBillWave style={{ color: '#64b5f6' }} /> Total Income
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#64b5f6', border: '1px solid #64b5f6', padding: '2px 8px', borderRadius: '5px' }}>+ Add</span>
                    </div>
                    <p className="product-price" style={{ color: '#64b5f6' }}>${totalIncome.toFixed(2)}</p>
                    <p style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '5px', color: 'var(--text-secondary)' }}>
                        Total accumulated earnings from all sources.
                    </p>
                </div>
            </Link>

            {/* Total Expenses */}
            <Link to="/expenses" className="product-card" style={{ textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
                <div className="product-info">
                    <h3 className="product-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaExchangeAlt style={{ color: '#ef5350' }} /> Total Expenses
                    </h3>
                    <p className="product-price" style={{ color: '#ef5350' }}>${totalExpenses.toFixed(2)}</p>
                    <p style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '5px', color: 'var(--text-secondary)' }}>
                        Cumulative spending across all categories.
                    </p>
                </div>
            </Link>

            {/* Financial Goals -> Link to Goals Manager */}
            <Link to="/dashboard/goals" className="product-card" style={{ textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
                <div className="product-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="product-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaChartLine style={{ color: '#ff9800' }} /> Financial Goals
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '5px' }}>Manage</span>
                    </div>
                    <p className="product-price">{goalsAchieved} / {goals.length} On Track</p>
                    <p style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '5px', color: 'var(--text-secondary)' }}>
                        Track progress towards your savings targets.
                    </p>
                </div>
            </Link>

            {/* Profile Shortcut */}
            <Link to="/dashboard/profile" className="product-card" style={{ textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
                <div className="product-info">
                    <h3 className="product-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaUserCircle style={{ color: '#9c27b0' }} /> Profile Overview
                    </h3>
                    <p className="product-price" style={{ fontSize: '1.2rem', marginTop: '10px' }}>Settings & Customization</p>
                    <p style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '5px', color: 'var(--text-secondary)' }}>
                        Manage appearance, export data, and verification.
                    </p>
                </div>
            </Link>
        </div>
    );
};

// ... IncomeManager and GoalsManager exist and are unchanged ...
const IncomeManager = () => {
    const [incomeList, setIncomeList] = useState([]);
    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('');

    useEffect(() => {
        const load = async () => setIncomeList(await DataManager.getIncome());
        load();
        window.addEventListener('budgetwise_data_change', load);
        return () => window.removeEventListener('budgetwise_data_change', load);
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!amount || !source) return handleError("Please fill all fields");
        const newItem = { source, amount: parseFloat(amount), date: new Date().toISOString().split('T')[0] };

        const result = await DataManager.addIncome(newItem);
        if (result) {
            setAmount('');
            setSource('');
            handleSuccess('Income Added');
        }
    };

    const handleDelete = async (id) => {
        await DataManager.deleteIncome(id);
        handleSuccess('Income Removed');
    }

    return (
        <div className="dashboard-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div className="auth-form-container" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
                <h2 style={{ marginBottom: '20px' }}>Add Income Source</h2>
                <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        placeholder="Source (e.g. Salary, Freelance)"
                        value={source}
                        onChange={e => setSource(e.target.value)}
                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                    />
                    <input
                        type="number"
                        placeholder="Amount ($)"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                    />
                    <button type="submit" className="btn-primary-action" style={{ marginTop: '0' }}>
                        <FaPlus style={{ marginRight: '5px' }} /> Add Income
                    </button>
                </form>
            </div>
            <div>
                <h2 style={{ marginBottom: '20px' }}>Income Sources</h2>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {incomeList.length === 0 ? <p style={{ opacity: 0.5 }}>No income sources added yet.</p> : incomeList.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', marginBottom: '10px', borderRadius: '10px' }}>
                            <div>
                                <span style={{ display: 'block', fontWeight: 'bold' }}>{item.source}</span>
                                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{item.date}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>${item.amount.toFixed(2)}</span>
                                <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: '#ef5350', cursor: 'pointer' }}><FaTrash /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const GoalsManager = () => {
    const [goals, setGoals] = useState([]);
    const [title, setTitle] = useState('');
    const [target, setTarget] = useState('');
    const [current, setCurrent] = useState('');
    const [goalType, setGoalType] = useState('monthly'); // 'monthly' or 'yearly'
    const [totalSavings, setTotalSavings] = useState(0);

    useEffect(() => {
        const load = async () => {
            setGoals(await DataManager.getGoals());
            const inc = await DataManager.getTotalIncome();
            const exp = await DataManager.getTotalExpenses();
            setTotalSavings(inc - exp);
        };
        load();
        window.addEventListener('budgetwise_data_change', load);
        return () => window.removeEventListener('budgetwise_data_change', load);
    }, []);

    const handleAddGoal = async (e) => {
        e.preventDefault();
        if (!title || !target) return handleError("Please fill Title and Target Amount");

        const newGoal = {
            title,
            targetAmount: parseFloat(target),
            currentAmount: parseFloat(current || 0),
            deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            type: goalType // Store type to distinguish
        };

        const result = await DataManager.addGoal(newGoal);
        if (result) {
            setTitle('');
            setTarget('');
            setCurrent('');
            handleSuccess('Goal Set Successfully');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this goal?')) {
            await DataManager.deleteGoal(id);
        }
    }

    const handleUpdateProgress = async (id, newCurrent) => {
        const goalToUpdate = goals.find(g => g.id === id);
        if (!goalToUpdate) return;

        const updatedGoal = {
            ...goalToUpdate,
            currentAmount: parseFloat(newCurrent),
            targetAmount: goalToUpdate.targetAmount || goalToUpdate.target
        };

        await DataManager.updateGoal(id, updatedGoal);
    }

    // Filter goals based on active tab
    const displayedGoals = goals.filter(g => (g.type || 'monthly') === goalType);

    return (
        <div className="dashboard-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            {/* Same content... */}
            <div className="auth-form-container" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
                <h2 style={{ marginBottom: '20px' }}>Set Financial Goal</h2>

                {/* Toggle Type */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button
                        className={`toggle-btn ${goalType === 'monthly' ? 'active' : ''}`}
                        onClick={() => setGoalType('monthly')}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: goalType === 'monthly' ? 'var(--primary-color)' : 'transparent', color: 'white', cursor: 'pointer' }}
                    >
                        Monthly Goal
                    </button>
                    <button
                        className={`toggle-btn ${goalType === 'yearly' ? 'active' : ''}`}
                        onClick={() => setGoalType('yearly')}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: goalType === 'yearly' ? 'var(--primary-color)' : 'transparent', color: 'white', cursor: 'pointer' }}
                    >
                        Yearly Goal
                    </button>
                </div>

                <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        placeholder="Goal Title (e.g. Vacation, New Car)"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                    />
                    <input
                        type="number"
                        placeholder="Target Amount ($)"
                        value={target}
                        onChange={e => setTarget(e.target.value)}
                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                    />

                    {/* Hide current amount input for Yearly goals as it's auto-calculated */}
                    {goalType === 'monthly' && (
                        <input
                            type="number"
                            placeholder="Current Savings ($) [Optional]"
                            value={current}
                            onChange={e => setCurrent(e.target.value)}
                            style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                        />
                    )}

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {goalType === 'yearly' ?
                            "Yearly goals will automatically track progress using your Total Savings (Income - Expenses). No manual update needed." :
                            "Monthly goals track specific short-term targets. You can update progress manually."
                        }
                    </div>

                    <button type="submit" style={{ padding: '12px', borderRadius: '10px', background: 'var(--accent-color, #6C63FF)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                        Set {goalType === 'monthly' ? 'Monthly' : 'Yearly'} Goal
                    </button>
                </form>
            </div>

            <div>
                <h2 style={{ marginBottom: '20px' }}>Your {goalType === 'monthly' ? 'Monthly' : 'Yearly'} Goals</h2>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {displayedGoals.length === 0 ? <p style={{ opacity: 0.5 }}>No {goalType} goals set yet.</p> : displayedGoals.map(goal => {
                        // Logic: If yearly, use totalSavings. If monthly, use goal.currentAmount
                        const isYearly = (goal.type || 'monthly') === 'yearly';
                        const currentVal = isYearly ? totalSavings : (goal.currentAmount || 0);
                        const targetVal = goal.targetAmount || 1;
                        const progress = Math.min(100, Math.max(0, (currentVal / targetVal) * 100));

                        return (
                            <div key={goal.id} style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', marginBottom: '15px', borderRadius: '15px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{goal.title}</span>
                                    <button onClick={() => handleDelete(goal.id)} style={{ background: 'none', border: 'none', color: '#ef5350', cursor: 'pointer' }}><FaTrash /></button>
                                </div>

                                {/* Progress Bar */}
                                <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px', position: 'relative' }}>
                                    <div style={{
                                        width: `${progress}%`,
                                        height: '100%',
                                        background: progress >= 100 ? '#4caf50' : 'linear-gradient(90deg, #2196f3, #64b5f6)',
                                        transition: 'width 0.8s ease',
                                        position: 'relative'
                                    }}>
                                        {/* Green Line Indicator for Yearly Goals (or just general reached level) */}
                                        <div style={{
                                            position: 'absolute',
                                            right: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: '2px',
                                            background: '#00e676',
                                            boxShadow: '0 0 10px #00e676'
                                        }}></div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    <span>${currentVal.toFixed(2)} / ${targetVal.toFixed(2)}</span>
                                    <span style={{ color: progress >= 100 ? '#4caf50' : 'inherit' }}>{progress.toFixed(1)}% {progress >= 100 ? '(Achieved!)' : ''}</span>
                                </div>

                                {/* Update Input - Only for Monthly */}
                                {!isYearly && (
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem' }}>Update Saved: </span>
                                        <input
                                            type="number"
                                            defaultValue={goal.currentAmount}
                                            onBlur={(e) => handleUpdateProgress(goal.id, e.target.value)}
                                            style={{ width: '80px', padding: '5px', borderRadius: '5px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                                        />
                                    </div>
                                )}

                                {isYearly && (
                                    <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#64b5f6', fontStyle: 'italic' }}>
                                        <FaWallet style={{ marginRight: '5px' }} />
                                        Auto-tracking Total Savings
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};


const ProfileOverview = () => {
    const [exportFormat, setExportFormat] = useState('excel'); // excel, pdf, json

    // Customization State
    const [customize, setCustomize] = useState({
        backgroundColor: localStorage.getItem('backgroundColor') || '#ffffff',
        navbarColor: localStorage.getItem('navbarColor') || '#e8e8e8',
        sidebarColor: localStorage.getItem('sidebarColor') || '#161616',
        backgroundImage: null
    });
    const [previewBg, setPreviewBg] = useState(null);

    // Initial load for customization (if needed, though we rely on localStorage primarily)
    useEffect(() => {
        // Fetch profile to get current server-side settings
        // But for now, just load from localStorage is fast
    }, []);


    const handleColorChange = (key, value) => {
        setCustomize({ ...customize, [key]: value });
        // Instant Preview
        if (key === 'backgroundColor') document.documentElement.style.setProperty('--app-bg-color', value);
        if (key === 'navbarColor') document.documentElement.style.setProperty('--navbar-bg-dynamic', value);
        if (key === 'sidebarColor') document.documentElement.style.setProperty('--sidebar-bg-dynamic', value);
    };

    const handleBgImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCustomize({ ...customize, backgroundImage: file });
            const url = URL.createObjectURL(file);
            setPreviewBg(url);
            // Instant Preview for Background Image
            document.documentElement.style.setProperty('--app-bg-image', `url(${url})`);
        }
    };

    const handleReset = async () => {
        // 1. Reset State to empty (allowing CSS defaults to take over)
        // Note: input type="color" needs a fallback value in render, but state should be empty/null to represent "default"
        setCustomize({ backgroundColor: '', navbarColor: '', sidebarColor: '', backgroundImage: null });
        setPreviewBg(null);

        // 2. Remove CSS Variables so Theme Defaults (Light/Dark) apply
        document.documentElement.style.removeProperty('--app-bg-color');
        document.documentElement.style.removeProperty('--navbar-bg-dynamic');
        document.documentElement.style.removeProperty('--sidebar-bg-dynamic');
        document.documentElement.style.removeProperty('--app-bg-image');

        // 3. Clear LocalStorage
        localStorage.removeItem('backgroundColor');
        localStorage.removeItem('navbarColor');
        localStorage.removeItem('sidebarColor');
        localStorage.removeItem('backgroundImageUrl');

        // 4. Call Backend to Clear
        try {
            const formData = new FormData();
            // We don't send colors here, acts as "don't update" for the individual fields
            // But we send flags to explicitly remove them
            formData.append('removeBackgroundImage', 'true');
            formData.append('removeCustomization', 'true'); // New flag to clear colors

            const url = `${API_BASE_URL}/auth/profile/update`;
            await fetch(url, {
                method: "PUT",
                headers: { 'Authorization': localStorage.getItem('token') },
                body: formData
            });
            handleSuccess("Theme Reset to System Default");
        } catch (err) {
            handleError("Reset locally, but failed to save to server");
        }
    };

    const handleApplyCustomization = async () => {
        const formData = new FormData();
        // Only send colors if they are set (not empty)
        if (customize.backgroundColor) formData.append('backgroundColor', customize.backgroundColor);
        if (customize.navbarColor) formData.append('navbarColor', customize.navbarColor);
        if (customize.sidebarColor) formData.append('sidebarColor', customize.sidebarColor);
        if (customize.backgroundImage) {
            formData.append('backgroundImage', customize.backgroundImage);
        }

        try {
            const url = `${API_BASE_URL}/auth/profile/update`;
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    'Authorization': localStorage.getItem('token')
                },
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                handleSuccess('Theme Updated Successfully');

                // Update Local Storage
                if (customize.backgroundColor) localStorage.setItem('backgroundColor', customize.backgroundColor);
                if (customize.navbarColor) localStorage.setItem('navbarColor', customize.navbarColor);
                if (customize.sidebarColor) localStorage.setItem('sidebarColor', customize.sidebarColor);
                if (result.profile.backgroundImageUrl) {
                    localStorage.setItem('backgroundImageUrl', result.profile.backgroundImageUrl);
                }

                // Apply Application Gloabally
                if (customize.backgroundColor) document.documentElement.style.setProperty('--app-bg-color', customize.backgroundColor);
                if (result.profile.backgroundImageUrl) {
                    document.documentElement.style.setProperty('--app-bg-image', `url(${API_BASE_URL}/${result.profile.backgroundImageUrl})`);
                }

                // Apply Navbar & Sidebar Colors
                if (customize.navbarColor) document.documentElement.style.setProperty('--navbar-bg-dynamic', customize.navbarColor);
                if (customize.sidebarColor) document.documentElement.style.setProperty('--sidebar-bg-dynamic', customize.sidebarColor);

                // Dispatch event to force update if needed, but variables should handle it
            } else {
                handleError(result.message);
            }
        } catch (err) {
            handleError('Failed to update theme');
        }
    };


    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();

        try {
            if (fileName.endsWith('.json')) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const json = JSON.parse(event.target.result);
                        if (await DataManager.importData(json)) {
                            handleSuccess('Data Imported Successfully');
                        } else {
                            handleError('Import Failed');
                        }
                    } catch (err) {
                        handleError('Invalid JSON file');
                    }
                };
                reader.readAsText(file);
            } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                if (await DataManager.importDataExcel(file)) {
                    handleSuccess('Excel Data Imported Successfully');
                } else {
                    handleError('Excel Import Failed');
                }
            } else {
                handleError('Unsupported file format. Use .json or .xlsx');
            }
        } catch (error) {
            handleError('Error importing data');
        }
    };

    const handleExport = () => {
        if (exportFormat === 'excel') DataManager.exportDataExcel();
        else if (exportFormat === 'pdf') DataManager.exportDataPDF();
        else DataManager.exportData(); // JSON
    };

    return (
        <div className="profile-settings-container">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaUserCircle /> Profile Overview
            </h2>

            {/* Customization Section */}
            <div className="product-card" style={{ marginTop: '20px', padding: '30px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaPalette /> App Customization
                </h3>
                <p style={{ opacity: 0.7, marginBottom: '20px' }}>
                    Personalize your BudgetWise experience. Changes apply immediately as preview.
                </p>

                {/* Theme Presets */}
                <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>Color Palettes</h4>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        {[
                            { name: 'Midnight', bg: '#0f172a', nav: '#1e293b', side: '#0f172a' },
                            { name: 'Ocean', bg: '#004d40', nav: '#00695c', side: '#004d40' },
                            { name: 'Sunset', bg: '#4a148c', nav: '#6a1b9a', side: '#4a148c' },
                            { name: 'Forest', bg: '#1b5e20', nav: '#2e7d32', side: '#1b5e20' },
                            { name: 'Light', bg: '#ffffff', nav: '#f3f4f6', side: '#ffffff' }
                        ].map(preset => (
                            <button
                                key={preset.name}
                                onClick={() => {
                                    setCustomize({ ...customize, backgroundColor: preset.bg, navbarColor: preset.nav, sidebarColor: preset.side });
                                    document.documentElement.style.setProperty('--app-bg-color', preset.bg);
                                    document.documentElement.style.setProperty('--navbar-bg-dynamic', preset.nav);
                                    document.documentElement.style.setProperty('--sidebar-bg-dynamic', preset.side);
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '8px 12px', borderRadius: '12px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(255,255,255,0.05)',
                                    cursor: 'pointer', color: 'var(--text-primary)'
                                }}
                            >
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: preset.bg, border: '1px solid rgba(255,255,255,0.2)' }}></div>
                                {preset.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                    {/* Background Color */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label>App Background</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="color"
                                value={customize.backgroundColor || '#ffffff'}
                                onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                                style={{ width: '40px', height: '40px', cursor: 'pointer', border: 'none', padding: 0, borderRadius: '50%', overflow: 'hidden' }}
                            />
                            <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>{customize.backgroundColor || 'Default'}</span>
                        </div>
                    </div>

                    {/* Navbar Color */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label>Navbar Color</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="color"
                                value={customize.navbarColor || '#e8e8e8'}
                                onChange={(e) => handleColorChange('navbarColor', e.target.value)}
                                style={{ width: '40px', height: '40px', cursor: 'pointer', border: 'none', padding: 0, borderRadius: '50%', overflow: 'hidden' }}
                            />
                            <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>{customize.navbarColor || 'Default'}</span>
                        </div>
                    </div>

                    {/* Sidebar Color */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label>Sidebar Color</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="color"
                                value={customize.sidebarColor || '#161616'}
                                onChange={(e) => handleColorChange('sidebarColor', e.target.value)}
                                style={{ width: '40px', height: '40px', cursor: 'pointer', border: 'none', padding: 0, borderRadius: '50%', overflow: 'hidden' }}
                            />
                            <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>{customize.sidebarColor || 'Default'}</span>
                        </div>
                    </div>

                    {/* Background Image */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label>Background Image</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label className="btn-primary-action" style={{ margin: 0, cursor: 'pointer', fontSize: '0.9rem' }}>
                                <FaImage /> Upload Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBgImageChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            {previewBg && <img src={previewBg} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '5px', objectFit: 'cover', border: '1px solid white' }} />}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                    <button
                        onClick={handleApplyCustomization}
                        className="btn-primary-action"
                        style={{ width: 'fit-content' }}
                    >
                        Save & Apply Changes
                    </button>

                    <button
                        onClick={handleReset}
                        className="btn-danger"
                    >
                        Reset to Defaults
                    </button>
                </div>
            </div>


            {/* Export / Import Section */}
            <div className="product-card" style={{ marginTop: '20px', padding: '30px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCloudDownloadAlt /> Data Management
                </h3>
                <p style={{ opacity: 0.7, marginBottom: '20px' }}>
                    Export your financial data to Excel or PDF, or import data from external sources.
                </p>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Dropdown Export Format */}
                    <div className="dropdown-container" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--glass-border)', padding: '5px 10px', borderRadius: '10px' }}>
                        <FaFileExport style={{ color: 'var(--text-secondary)', marginRight: '8px' }} />
                        <select
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                            style={{
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                border: 'none',
                                padding: '8px',
                                borderRadius: '5px',
                                outline: 'none',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="excel" style={{ background: '#333', color: 'white' }}>Excel Format</option>
                            <option value="pdf" style={{ background: '#333', color: 'white' }}>PDF Report</option>
                        </select>
                    </div>

                    <button
                        onClick={handleExport}
                        style={{
                            padding: '12px 24px', borderRadius: '10px',
                            background: 'var(--primary-color)', color: 'white',
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            fontWeight: 'bold'
                        }}
                    >
                        <FaDownload /> Export {exportFormat.toUpperCase()}
                    </button>

                    <div style={{ position: 'relative' }}>
                        <input
                            type="file"
                            accept=".json, .xlsx, .xls"
                            onChange={handleImport}
                            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                        />
                        <button style={{
                            padding: '12px 24px', borderRadius: '10px',
                            background: '#2196f3', color: 'white',
                            border: 'none', pointerEvents: 'none',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            fontWeight: 'bold'
                        }}>
                            <FaFileImport /> Import Data
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};


const Dashboard = () => {
    const location = useLocation();

    // Determine title based on path
    const getTitle = () => {
        if (location.pathname.includes('/income')) return 'Income Management';
        if (location.pathname.includes('/goals')) return 'Financial Goals';
        if (location.pathname.includes('/profile')) return 'Profile Overview'; // Renamed
        return 'Dashboard Overview';
    };

    return (
        <div className="home-page">
            <div className="bubbles-container">
                <div className="bubble bubble--1"></div>
                <div className="bubble bubble--2"></div>
                <div className="bubble bubble--3"></div>
            </div>
            <FloatingStickers />
            <main className="home-main">
                <div className="home-glass-panel">
                    <h1 className="welcome-title" style={{ textAlign: 'left', marginBottom: '30px' }}>{getTitle()}</h1>

                    <Routes>
                        <Route path="/" element={<DashboardOverview />} />
                        <Route path="/income" element={<IncomeManager />} />
                        <Route path="/goals" element={<GoalsManager />} />
                        <Route path="/profile" element={<ProfileOverview />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
