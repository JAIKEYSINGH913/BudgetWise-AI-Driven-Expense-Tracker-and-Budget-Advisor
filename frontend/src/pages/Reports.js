import React, { useState, useEffect, useMemo } from 'react';
import DataManager from '../utils/DataManager';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell, Sector
} from 'recharts';
import './Home.css';
import FloatingStickers from '../components/FloatingStickers';
import {
    FaTable, FaChartLine, FaChartPie, FaDownload, FaCalendarAlt,
    FaUtensils, FaHome, FaPlane, FaShoppingBag, FaBolt, FaHeartbeat,
    FaGraduationCap, FaFilm, FaGamepad, FaCar, FaTag, FaMoneyBillWave,
    FaChartBar, FaSyncAlt
} from 'react-icons/fa';

/* -------- Category colors for pie chart -------- */
const CAT_COLORS = {
    Food: '#ff9800', Rent: '#2196f3', Travel: '#00bcd4', Shopping: '#e91e63',
    Utilities: '#ffeb3b', Health: '#f44336', Education: '#9c27b0',
    Entertainment: '#009688', General: '#9e9e9e', Income: '#4caf50'
};
const PIE_FALLBACK_COLORS = ['#6C63FF', '#4caf50', '#ff9800', '#e91e63', '#00bcd4', '#f44336', '#9c27b0', '#ffeb3b', '#009688', '#ff5722'];

const tooltipStyle = {
    contentStyle: {
        backgroundColor: 'rgba(15,15,30,0.92)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
    },
    itemStyle: { color: '#fff' }
};

const axisProps = {
    stroke: '#42a5f5',
    tick: { fill: '#64b5f6', fontSize: 11 },
    tickLine: false,
    axisLine: { stroke: '#42a5f5', strokeWidth: 1.5 }
};

/* -------- Custom Pie active shape -------- */
const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    return (
        <g>
            <text x={cx} y={cy - 12} textAnchor="middle" fill="#fff" fontSize={15} fontWeight="bold">{payload.name}</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={13}>${value.toFixed(2)}</text>
            <text x={cx} y={cy + 32} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={11}>{(percent * 100).toFixed(1)}%</text>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        </g>
    );
};

/* Parse YYYY-MM-DD safely in local time (avoids UTC-midnight timezone shift) */
const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
};

const Reports = () => {
    const [activeTab, setActiveTab] = useState('charts');
    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const [chartType, setChartType] = useState('Area');    // Line | Bar | Area | Pie | Compare
    const [viewMode, setViewMode] = useState('Monthly');   // Monthly | Yearly
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activePieIndex, setActivePieIndex] = useState(0);

    const [historyStartDate, setHistoryStartDate] = useState('');
    const [historyEndDate, setHistoryEndDate] = useState('');
    const [showExportOptions, setShowExportOptions] = useState(false);

    /* ---- Real-time data loading ---- */
    const loadData = async () => {
        const [exp, inc] = await Promise.all([DataManager.getExpenses(), DataManager.getIncome()]);
        setExpenses(exp);
        setIncomes(inc);
        setLastRefresh(new Date());
    };

    useEffect(() => {
        loadData();
        const handler = () => loadData();
        window.addEventListener('budgetwise_data_change', handler);
        // Also poll every 30s as a safety net so chart is always fresh
        const interval = setInterval(loadData, 30000);
        return () => {
            window.removeEventListener('budgetwise_data_change', handler);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const now = new Date();
        setHistoryStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
        setHistoryEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);
    }, []);

    /* ---- Chart data computations ---- */
    const monthlyData = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const data = Array.from({ length: days }, (_, i) => ({
            name: `${i + 1}`,
            expense: 0,
            income: 0,
        }));
        expenses.forEach(exp => {
            const d = parseLocalDate(exp.date);
            if (d.getFullYear() === year && d.getMonth() === month)
                data[d.getDate() - 1].expense += parseFloat(exp.amount || 0);
        });
        incomes.forEach(inc => {
            const d = parseLocalDate(inc.date);
            if (d.getFullYear() === year && d.getMonth() === month)
                data[d.getDate() - 1].income += parseFloat(inc.amount || 0);
        });
        return data;
    }, [expenses, incomes, selectedDate]);

    const yearlyData = useMemo(() => {
        const year = selectedDate.getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = months.map(m => ({ name: m, expense: 0, income: 0 }));
        expenses.forEach(exp => {
            const d = parseLocalDate(exp.date);
            if (d.getFullYear() === year) data[d.getMonth()].expense += parseFloat(exp.amount || 0);
        });
        incomes.forEach(inc => {
            const d = parseLocalDate(inc.date);
            if (d.getFullYear() === year) data[d.getMonth()].income += parseFloat(inc.amount || 0);
        });
        return data;
    }, [expenses, incomes, selectedDate]);

    /* Pie: spending by category */
    const categoryPieData = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const map = {};
        expenses.forEach(exp => {
            const d = parseLocalDate(exp.date);
            const matchMonth = viewMode === 'Monthly' ? (d.getFullYear() === year && d.getMonth() === month) : d.getFullYear() === year;
            if (matchMonth) {
                const cat = exp.category || 'General';
                map[cat] = (map[cat] || 0) + parseFloat(exp.amount || 0);
            }
        });
        return Object.entries(map)
            .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
            .sort((a, b) => b.value - a.value);
    }, [expenses, selectedDate, viewMode]);

    const currentChartData = viewMode === 'Monthly' ? monthlyData : yearlyData;

    /* ---- Icons ---- */
    const getCategoryIcon = (cat) => {
        const s = { marginRight: '6px', fontSize: '1.1em' };
        if (!cat) return <FaTag style={{ ...s, color: '#9e9e9e' }} />;
        const n = cat.toLowerCase();
        if (n.includes('food') || n.includes('restaurant') || n.includes('grocery')) return <FaUtensils style={{ ...s, color: '#ff9800' }} />;
        if (n.includes('rent') || n.includes('home')) return <FaHome style={{ ...s, color: '#2196f3' }} />;
        if (n.includes('travel') || n.includes('flight')) return <FaPlane style={{ ...s, color: '#00bcd4' }} />;
        if (n.includes('transport') || n.includes('car') || n.includes('fuel')) return <FaCar style={{ ...s, color: '#3f51b5' }} />;
        if (n.includes('shopping') || n.includes('clothes')) return <FaShoppingBag style={{ ...s, color: '#e91e63' }} />;
        if (n.includes('utilit') || n.includes('bill') || n.includes('electric')) return <FaBolt style={{ ...s, color: '#ffeb3b' }} />;
        if (n.includes('health') || n.includes('doctor')) return <FaHeartbeat style={{ ...s, color: '#f44336' }} />;
        if (n.includes('education') || n.includes('school')) return <FaGraduationCap style={{ ...s, color: '#9c27b0' }} />;
        if (n.includes('entertainment') || n.includes('movie')) return <FaFilm style={{ ...s, color: '#009688' }} />;
        if (n.includes('game')) return <FaGamepad style={{ ...s, color: '#673ab7' }} />;
        if (n.includes('income') || n.includes('salary')) return <FaMoneyBillWave style={{ ...s, color: '#4caf50' }} />;
        return <FaTag style={{ ...s, color: '#9e9e9e' }} />;
    };

    /* ---- Render the main chart ---- */
    const renderMainChart = () => {
        if (chartType === 'Pie') {
            if (categoryPieData.length === 0) return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5, color: '#fff' }}>
                    No expense data for this period.
                </div>
            );
            return (
                <div style={{ display: 'flex', gap: '30px', height: '100%', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Pie */}
                    <div style={{ flex: '0 0 400px', height: '380px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    activeIndex={activePieIndex}
                                    activeShape={renderActiveShape}
                                    data={categoryPieData}
                                    cx="50%" cy="50%"
                                    innerRadius={90} outerRadius={140}
                                    dataKey="value"
                                    onMouseEnter={(_, idx) => setActivePieIndex(idx)}
                                >
                                    {categoryPieData.map((entry, idx) => (
                                        <Cell key={idx} fill={CAT_COLORS[entry.name] || PIE_FALLBACK_COLORS[idx % PIE_FALLBACK_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => `?${v.toFixed(2)}`} {...tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend table */}
                    <div style={{ flex: 1, minWidth: '220px' }}>
                        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 600 }}>Spending Breakdown</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {categoryPieData.map((entry, idx) => {
                                const color = CAT_COLORS[entry.name] || PIE_FALLBACK_COLORS[idx % PIE_FALLBACK_COLORS.length];
                                const total = categoryPieData.reduce((s, e) => s + e.value, 0);
                                return (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onMouseEnter={() => setActivePieIndex(idx)}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                                        <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{getCategoryIcon(entry.name)}{entry.name}</span>
                                        <span style={{ color, fontWeight: 700, fontSize: '0.9rem' }}>${entry.value.toFixed(2)}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', minWidth: '38px', textAlign: 'right' }}>{((entry.value / total) * 100).toFixed(1)}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        }

        if (chartType === 'Compare') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" {...axisProps} />
                        <YAxis {...axisProps} tickFormatter={v => `₹${v}`} />
                        <Tooltip {...tooltipStyle} formatter={v => `₹${v.toFixed(2)}`} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="expense" name="Expense" fill="#4caf50" radius={[6, 6, 0, 0]} barSize={viewMode === 'Monthly' ? 16 : 36} />
                    </BarChart>
                </ResponsiveContainer>
            );
        }

        if (chartType === 'Bar') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentChartData} barCategoryGap="20%" margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" {...axisProps} />
                        <YAxis {...axisProps} tickFormatter={v => `₹${v}`} />
                        <Tooltip {...tooltipStyle} formatter={v => `₹${v.toFixed(2)}`} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="expense" name="Expense" fill="#4caf50" radius={[6, 6, 0, 0]} barSize={viewMode === 'Monthly' ? 14 : 36} />
                    </BarChart>
                </ResponsiveContainer>
            );
        }

        if (chartType === 'Area') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4caf50" stopOpacity={0.6} />
                                <stop offset="95%" stopColor="#4caf50" stopOpacity={0.03} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" {...axisProps} />
                        <YAxis {...axisProps} tickFormatter={v => `₹${v}`} />
                        <Tooltip {...tooltipStyle} formatter={v => `₹${v.toFixed(2)}`} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Area type="monotone" dataKey="expense" name="Expense" stroke="#4caf50" strokeWidth={3} fill="url(#expGrad)" />
                    </AreaChart>
                </ResponsiveContainer>
            );
        }

        // Default: Line
        return (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" {...axisProps} />
                    <YAxis {...axisProps} tickFormatter={v => `₹${v}`} />
                    <Tooltip {...tooltipStyle} formatter={v => `₹${v.toFixed(2)}`} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="expense" name="Expense" stroke="#4caf50" strokeWidth={3} dot={{ r: 3, fill: '#1a1a2e' }} activeDot={{ r: 7 }} />
                </LineChart>
            </ResponsiveContainer>
        );
    };

    /* ---- Transaction history ---- */
    const transactionHistory = useMemo(() => {
        if (!historyStartDate || !historyEndDate) return [];
        const start = new Date(historyStartDate);
        const end = new Date(historyEndDate); end.setHours(23, 59, 59, 999);
        const all = [
            ...expenses.map(e => ({ ...e, type: 'expense', amount: parseFloat(e.amount) })),
            ...incomes.map(i => ({ ...i, type: 'income', amount: parseFloat(i.amount) }))
        ];
        const filtered = all.filter(t => { const d = new Date(t.date); return d >= start && d <= end; });
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        let bal = 0;
        all.forEach(t => { if (new Date(t.date) < start) bal += t.type === 'income' ? t.amount : -t.amount; });
        return filtered.map(t => { bal += t.type === 'income' ? t.amount : -t.amount; return { ...t, balance: bal }; });
    }, [expenses, incomes, historyStartDate, historyEndDate]);

    const btnPill = (label, active, onClick, icon) => (
        <button onClick={onClick} style={{
            padding: '8px 16px', borderRadius: '40px', border: 'none', cursor: 'pointer',
            fontWeight: '600', color: 'white', fontSize: '0.82rem',
            display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.25s ease',
            background: active ? 'linear-gradient(135deg, #6C63FF, #4834d4)' : 'transparent',
            boxShadow: active ? '0 4px 15px rgba(108,99,255,0.4)' : 'none',
        }}>{icon}{label}</button>
    );

    return (
        <div className="home-page">
            <div className="bubbles-container">
                <div className="bubble bubble--5"></div>
                <div className="bubble bubble--1"></div>
            </div>
            <FloatingStickers />
            <main className="home-main">
                <div className="home-glass-panel report-panel">
                    {/* Header */}
                    <div className="report-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <h1 className="welcome-title">Financial Reports</h1>
                            <button onClick={loadData} title="Refresh data now"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}>
                                <FaSyncAlt size={11} /> Refresh
                            </button>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}>
                                Updated {lastRefresh.toLocaleTimeString()}
                            </span>
                        </div>
                        <div className="report-tabs">
                            <button className={`report-tab ${activeTab === 'charts' ? 'active' : ''}`} onClick={() => setActiveTab('charts')}>
                                <FaChartLine /> Visual Analytics
                            </button>
                            <button className={`report-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                                <FaTable /> Statement History
                            </button>
                        </div>
                    </div>

                    <div className="report-content">
                        {activeTab === 'charts' ? (
                            <div className="animate-fade-in" style={{ height: '100%' }}>
                                {/* Controls */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                                    {/* View mode */}
                                    <div style={{ background: 'rgba(255,255,255,0.08)', padding: '4px', borderRadius: '50px', display: 'flex', gap: '4px' }}>
                                        {btnPill('Monthly', viewMode === 'Monthly', () => setViewMode('Monthly'), null)}
                                        {btnPill('Yearly', viewMode === 'Yearly', () => setViewMode('Yearly'), null)}
                                    </div>

                                    {/* Chart type selector */}
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                                        {[
                                            { k: 'Line', label: 'Line', icon: <FaChartLine size={12} /> },
                                            { k: 'Bar', label: 'Bar', icon: <FaChartBar size={12} /> },
                                            { k: 'Area', label: 'Area', icon: <FaChartLine size={12} /> },
                                            { k: 'Pie', label: 'Pie (Category)', icon: <FaChartPie size={12} /> },
                                            { k: 'Compare', label: 'Income vs Expense', icon: <FaChartBar size={12} /> },
                                        ].map(({ k, label, icon }) => (
                                            <button key={k} onClick={() => setChartType(k)}
                                                style={{
                                                    padding: '7px 13px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
                                                    border: `1.5px solid ${chartType === k ? '#6C63FF' : 'rgba(255,255,255,0.12)'}`,
                                                    background: chartType === k ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
                                                    color: chartType === k ? '#b0a8ff' : 'rgba(255,255,255,0.5)',
                                                    display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s'
                                                }}>{icon}{label}
                                            </button>
                                        ))}

                                        {/* Date picker */}
                                        {viewMode === 'Monthly' ? (
                                            <input type="month" className="glass-input-date"
                                                value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
                                                max={new Date().toISOString().slice(0, 7)}
                                                onChange={e => { if (e.target.value) setSelectedDate(new Date(e.target.value + '-01')); }} />
                                        ) : (
                                            <select className="glass-input-date" value={selectedDate.getFullYear()}
                                                onChange={e => { const d = new Date(selectedDate); d.setFullYear(parseInt(e.target.value)); setSelectedDate(d); }}>
                                                {Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => 2020 + i).reverse().map(y => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                {/* Chart title */}
                                <div style={{ marginBottom: '16px' }}>
                                    <h3 style={{ opacity: 0.7, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)' }}>
                                        {chartType === 'Pie' ? `Spending by Category • ` : chartType === 'Compare' ? `Income vs Expense • ` : `${viewMode === 'Monthly' ? 'Daily Insight' : 'Annual Overview'} • `}
                                        {viewMode === 'Monthly'
                                            ? selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })
                                            : selectedDate.getFullYear()}
                                    </h3>
                                </div>

                                {/* Chart */}
                                <div className="chart-container" style={{ height: 'calc(100% - 140px)', minHeight: '400px' }}>
                                    {renderMainChart()}
                                </div>

                                {/* Quick summary strip */}
                                {chartType !== 'Pie' && (
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
                                        {[
                                            { label: 'Total Expense', value: currentChartData.reduce((s, d) => s + d.expense, 0), color: '#ef5350' },
                                            { label: 'Total Income', value: currentChartData.reduce((s, d) => s + d.income, 0), color: '#4caf50' },
                                            { label: 'Net', value: currentChartData.reduce((s, d) => s + d.income - d.expense, 0), color: '#64b5f6' },
                                        ].map(({ label, value, color }) => (
                                            <div key={label} style={{ padding: '10px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{label}</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color }}>${Math.abs(value).toFixed(2)}{label === 'Net' && value < 0 ? ' ▾' : ''}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ---- History Tab ---- */
                            <div className="animate-fade-in">
                                <div className="history-filters glass-panel-small" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '15px' }}>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap', width: '100%' }}>
                                        <div className="filter-group">
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCalendarAlt size={12} /> From</label>
                                            <input type="date" value={historyStartDate} onChange={e => setHistoryStartDate(e.target.value)} className="glass-input-date" />
                                        </div>
                                        <div className="filter-group">
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCalendarAlt size={12} /> To</label>
                                            <input type="date" value={historyEndDate} onChange={e => setHistoryEndDate(e.target.value)} className="glass-input-date" />
                                        </div>
                                        <div className="filter-group" style={{ marginLeft: 'auto' }}>
                                            <button onClick={() => setShowExportOptions(!showExportOptions)} className="btn-export" style={{ minWidth: '160px', justifyContent: 'center' }}>
                                                <FaDownload /> Export Options
                                            </button>
                                        </div>
                                    </div>
                                    {showExportOptions && (
                                        <div style={{ width: '100%', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '15px', animation: 'fadeInUp 0.3s ease-out' }}>
                                            <button onClick={() => {
                                                if (!transactionHistory.length) return alert('No data to export');
                                                const headers = ['Date', 'Description', 'Category', 'Debit', 'Credit', 'Balance'];
                                                const csv = [headers.join(','), ...transactionHistory.map(t => `="${t.date}","${t.text || t.source || 'Transaction'}",${t.category || t.source || 'General'},${t.type === 'expense' ? t.amount : 0},${t.type === 'income' ? t.amount : 0},${t.balance}`)].join('\n');
                                                const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a'); a.href = url; a.download = `Statement_${historyStartDate}_to_${historyEndDate}.csv`;
                                                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                                            }} className="btn-primary-action" style={{ margin: 0, padding: '10px 20px', fontSize: '0.9rem' }}>
                                                Download CSV
                                            </button>
                                            <button onClick={() => { if (!transactionHistory.length) return alert('No data to export'); DataManager.exportStatementPDF(transactionHistory, historyStartDate, historyEndDate); }}
                                                className="btn-primary-action" style={{ margin: 0, padding: '10px 20px', fontSize: '0.9rem', background: '#e74c3c', color: 'white' }}>
                                                <FaDownload style={{ marginRight: '8px' }} /> Download PDF
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="table-container glass-panel-no-pad" style={{ marginTop: '30px', padding: '10px' }}>
                                    <table className="statement-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                        <thead>
                                            <tr>
                                                {['Date', 'Description', 'Category', 'Debit', 'Credit', 'Balance'].map((h, i) => (
                                                    <th key={h} style={{ padding: '12px 18px', textAlign: i >= 3 ? 'right' : 'left', borderBottom: '2px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.82rem' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactionHistory.length > 0 ? transactionHistory.map((t, i) => (
                                                <tr key={i} style={{ background: 'rgba(255,255,255,0.025)' }}>
                                                    <td style={{ padding: '12px 18px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{t.date}</td>
                                                    <td style={{ padding: '12px 18px' }}>{t.text || t.source}</td>
                                                    <td style={{ padding: '12px 18px' }}>
                                                        <span style={{ padding: '5px 10px', borderRadius: '8px', background: `${CAT_COLORS[t.category] || 'rgba(255,255,255,0.1)'}22`, border: `1px solid ${CAT_COLORS[t.category] || 'rgba(255,255,255,0.15)'}55`, fontSize: '0.8rem' }}>
                                                            {getCategoryIcon(t.category || t.source)}{t.category || t.source}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 18px', textAlign: 'right', color: '#ff6b6b' }}>{t.type === 'expense' ? `-$${t.amount.toFixed(2)}` : '-'}</td>
                                                    <td style={{ padding: '12px 18px', textAlign: 'right', color: '#2ecc71' }}>{t.type === 'income' ? `+$${t.amount.toFixed(2)}` : '-'}</td>
                                                    <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 'bold', color: t.balance >= 0 ? '#4caf50' : '#ef5350' }}>${t.balance.toFixed(2)}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>No transactions in this period</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Reports;
