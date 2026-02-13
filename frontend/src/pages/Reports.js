import React, { useState, useEffect, useMemo } from 'react';
import DataManager from '../utils/DataManager';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './Home.css';
import FloatingStickers from '../components/FloatingStickers';
import {
    FaTable, FaChartLine, FaDownload, FaCalendarAlt,
    FaUtensils, FaHome, FaPlane, FaShoppingBag, FaBolt, FaHeartbeat, FaGraduationCap, FaFilm, FaGamepad, FaCar, FaTag, FaMoneyBillWave
} from 'react-icons/fa';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('charts'); // 'charts' or 'history'

    // Data State
    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]); // New for History

    // Filter State
    const [chartType, setChartType] = useState('Line'); // Line, Bar, Area
    const [viewMode, setViewMode] = useState('Monthly'); // Monthly or Yearly
    const [selectedDate, setSelectedDate] = useState(new Date());

    // History Filters
    const [historyStartDate, setHistoryStartDate] = useState('');
    const [historyEndDate, setHistoryEndDate] = useState('');

    useEffect(() => {
        loadData();
        window.addEventListener('budgetwise_data_change', loadData);
        return () => window.removeEventListener('budgetwise_data_change', loadData);
    }, []);

    // Set default history range to current month on filtered load
    useEffect(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        setHistoryStartDate(start);
        setHistoryEndDate(end);
    }, []);

    const loadData = async () => {
        setExpenses(await DataManager.getExpenses());
        setIncomes(await DataManager.getIncome());
    };

    const getCategoryIcon = (categoryName) => {
        const style = { marginRight: '8px', fontSize: '1.2em' };
        if (!categoryName) return <FaTag style={{ ...style, color: '#9e9e9e' }} />;
        const name = categoryName.toLowerCase();

        if (name.includes('food') || name.includes('dining') || name.includes('restaurant')) return <FaUtensils style={{ ...style, color: '#ff9800' }} />; // Orange
        if (name.includes('rent') || name.includes('house') || name.includes('home')) return <FaHome style={{ ...style, color: '#2196f3' }} />; // Blue
        if (name.includes('travel') || name.includes('trip') || name.includes('flight')) return <FaPlane style={{ ...style, color: '#00bcd4' }} />; // Cyan
        if (name.includes('transport') || name.includes('car') || name.includes('fuel')) return <FaCar style={{ ...style, color: '#3f51b5' }} />; // Indigo
        if (name.includes('shopping') || name.includes('clothes')) return <FaShoppingBag style={{ ...style, color: '#e91e63' }} />; // Pink
        if (name.includes('utilit') || name.includes('bill') || name.includes('electric')) return <FaBolt style={{ ...style, color: '#ffeb3b' }} />; // Yellow
        if (name.includes('health') || name.includes('medical') || name.includes('doctor')) return <FaHeartbeat style={{ ...style, color: '#f44336' }} />; // Red
        if (name.includes('education') || name.includes('school') || name.includes('course')) return <FaGraduationCap style={{ ...style, color: '#9c27b0' }} />; // Purple
        if (name.includes('entertainment') || name.includes('movie')) return <FaFilm style={{ ...style, color: '#009688' }} />; // Teal
        if (name.includes('game') || name.includes('gaming')) return <FaGamepad style={{ ...style, color: '#673ab7' }} />; // Deep Purple
        if (name.includes('income') || name.includes('salary')) return <FaMoneyBillWave style={{ ...style, color: '#4caf50' }} />; // Green

        return <FaTag style={{ ...style, color: '#9e9e9e' }} />;
    };

    // --- Chart Data Processing ---
    // Monthly Data: Group by Day (1-31)
    const monthlyData = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth(); // 0-11
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Initialize all days with 0
        const data = Array.from({ length: daysInMonth }, (_, i) => ({
            name: `${i + 1}`,
            amount: 0,
            fullDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
        }));

        expenses.forEach(exp => {
            const expDate = new Date(exp.date);
            if (expDate.getFullYear() === year && expDate.getMonth() === month) {
                const dayIndex = expDate.getDate() - 1;
                if (data[dayIndex]) {
                    data[dayIndex].amount += parseFloat(exp.amount || 0);
                }
            }
        });

        return data;
    }, [expenses, selectedDate]);

    // Yearly Data: Group by Month (Jan-Dec)
    const yearlyData = useMemo(() => {
        const year = selectedDate.getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const data = months.map(m => ({ name: m, amount: 0 }));

        expenses.forEach(exp => {
            const expDate = new Date(exp.date);
            if (expDate.getFullYear() === year) {
                data[expDate.getMonth()].amount += parseFloat(exp.amount || 0);
            }
        });

        return data;
    }, [expenses, selectedDate]);


    const currentChartData = viewMode === 'Monthly' ? monthlyData : yearlyData;
    const currentChartColor = viewMode === 'Monthly' ? '#6C63FF' : '#4caf50';

    // --- History Data Processing ---
    const transactionHistory = useMemo(() => {
        if (!historyStartDate || !historyEndDate) return [];

        const start = new Date(historyStartDate);
        const end = new Date(historyEndDate);
        end.setHours(23, 59, 59, 999); // Include full end day

        // 1. Combine Data
        const allTransactions = [
            ...expenses.map(e => ({ ...e, type: 'expense', amount: parseFloat(e.amount) })),
            ...incomes.map(i => ({ ...i, type: 'income', amount: parseFloat(i.amount) }))
        ];

        // 2. Filter by Date
        const filtered = allTransactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= start && tDate <= end;
        });

        // 3. Sort Ascending by Date
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

        // 4. Calculate Running Balance
        // NOTE: Real bank statements need "Opening Balance". 
        // We will approximate by summing all previous transactions before start date.
        let runningBalance = 0;

        // Calculate Opening Balance
        allTransactions.forEach(t => {
            const tDate = new Date(t.date);
            if (tDate < start) {
                if (t.type === 'income') runningBalance += t.amount;
                else runningBalance -= t.amount;
            }
        });

        const dataWithBalance = filtered.map(t => {
            if (t.type === 'income') runningBalance += t.amount;
            else runningBalance -= t.amount;

            return {
                ...t,
                balance: runningBalance
            };
        });

        return dataWithBalance;

    }, [expenses, incomes, historyStartDate, historyEndDate]);


    // --- Render Helpers ---

    const renderChartTab = () => (
        <div className="animate-fade-in" style={{ height: '100%' }}>
            {/* Controls Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="toggle-pill" style={{ background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '50px', display: 'flex', gap: '5px' }}>
                        <button
                            onClick={() => setViewMode('Monthly')}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '40px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                color: 'white',
                                transition: 'all 0.3s ease',
                                background: viewMode === 'Monthly' ? 'linear-gradient(135deg, #6C63FF, #4834d4)' : 'transparent',
                                boxShadow: viewMode === 'Monthly' ? '0 4px 15px rgba(108, 99, 255, 0.4)' : 'none'
                            }}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setViewMode('Yearly')}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '40px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                color: 'white',
                                transition: 'all 0.3s ease',
                                background: viewMode === 'Yearly' ? 'linear-gradient(135deg, #4caf50, #009688)' : 'transparent',
                                boxShadow: viewMode === 'Yearly' ? '0 4px 15px rgba(76, 175, 80, 0.4)' : 'none'
                            }}
                        >
                            Yearly
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="glass-input"
                        style={{ width: '140px' }}
                    >
                        <option value="Line">Line Chart</option>
                        <option value="Bar">Bar Chart</option>
                        <option value="Area">Area Chart</option>
                    </select>

                    {viewMode === 'Monthly' ? (
                        <input
                            type="month"
                            value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
                            max={new Date().toISOString().slice(0, 7)} // Disable future months
                            onChange={(e) => {
                                if (e.target.value) setSelectedDate(new Date(e.target.value + '-01'));
                            }}
                            className="glass-input-date"
                            style={{
                                border: `1px solid ${viewMode === 'Monthly' ? '#6C63FF' : '#4caf50'}`,
                                color: viewMode === 'Monthly' ? '#6C63FF' : '#4caf50'
                            }}
                        />
                    ) : (
                        <select
                            value={selectedDate.getFullYear()}
                            onChange={(e) => {
                                const newYear = parseInt(e.target.value);
                                const newDate = new Date(selectedDate);
                                newDate.setFullYear(newYear);
                                setSelectedDate(newDate);
                            }}
                            className="glass-input-date"
                            style={{
                                cursor: 'pointer',
                                border: `1px solid ${viewMode === 'Monthly' ? '#6C63FF' : '#4caf50'}`,
                                color: viewMode === 'Monthly' ? '#6C63FF' : '#4caf50'
                            }}
                        >
                            {/* Generate years from 2020 to Current Year ONLY */}
                            {Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => 2020 + i).reverse().map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '20px', paddingLeft: '5px' }}>
                <h3 className="section-title-small" style={{ opacity: 0.8, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {viewMode === 'Monthly'
                        ? `Daily Insight • ${selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`
                        : `Annual Overview • ${selectedDate.getFullYear()}`
                    }
                </h3>
            </div>


            {/* Chart Area */}
            <div className="chart-container" style={{ height: 'calc(100% - 140px)', minHeight: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'Bar' ? (
                        <BarChart data={currentChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="rgba(255,255,255,0.3)"
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.3)"
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                                }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar
                                dataKey="amount"
                                fill="url(#colorGradient)"
                                name="Expense"
                                radius={[6, 6, 0, 0]}
                                barSize={40}
                            >
                                {
                                    currentChartData.map((entry, index) => (
                                        <cell key={`cell-${index}`} fill={currentChartColor} />
                                    ))
                                }
                            </Bar>
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={currentChartColor} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={currentChartColor} stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    ) : chartType === 'Area' ? (
                        <AreaChart data={currentChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={currentChartColor} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={currentChartColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="rgba(255,255,255,0.3)"
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.3)"
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    backdropFilter: 'blur(10px)'
                                }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke={currentChartColor}
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                                name="Expense"
                                strokeWidth={3}
                            />
                        </AreaChart>
                    ) : (
                        <LineChart data={currentChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="rgba(255,255,255,0.3)"
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.3)"
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px'
                                }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke={currentChartColor}
                                strokeWidth={4}
                                dot={{ r: 4, strokeWidth: 2, fill: '#1a1a1a' }}
                                activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                                name="Expense"
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );

    const [showExportOptions, setShowExportOptions] = useState(false);

    const renderHistoryTab = () => (
        <div className="animate-fade-in">
            {/* Filters Container */}
            <div className="history-filters glass-panel-small" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '15px' }}>

                {/* Row 1: Date Range Filters */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap', width: '100%' }}>
                    <div className="filter-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCalendarAlt size={12} /> From Date</label>
                        <input
                            type="date"
                            value={historyStartDate}
                            onChange={(e) => setHistoryStartDate(e.target.value)}
                            className="glass-input-date"
                        />
                    </div>
                    <div className="filter-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCalendarAlt size={12} /> To Date</label>
                        <input
                            type="date"
                            value={historyEndDate}
                            onChange={(e) => setHistoryEndDate(e.target.value)}
                            className="glass-input-date"
                        />
                    </div>

                    {/* Export Button (Toggles Options) */}
                    <div className="filter-group" style={{ marginLeft: 'auto' }}>
                        <button
                            onClick={() => setShowExportOptions(!showExportOptions)}
                            className="btn-export"
                            style={{ minWidth: '160px', justifyContent: 'center' }}
                        >
                            <FaDownload /> Export Options
                        </button>
                    </div>
                </div>

                {/* Row 2: Export Options (Expandable) */}
                {showExportOptions && (
                    <div className="export-options-panel" style={{
                        width: '100%',
                        padding: '15px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        gap: '15px',
                        animation: 'fadeInUp 0.3s ease-out'
                    }}>
                        <button
                            onClick={() => {
                                if (!transactionHistory || transactionHistory.length === 0) return alert("No data to export");

                                // CSV Export with Excel fix
                                const headers = ["Date", "Description", "Category", "Debit", "Credit", "Balance"];
                                const csvContent = [
                                    headers.join(","),
                                    ...transactionHistory.map(t => {
                                        // Fix: Force Excel to treat date as string or ensure correct format
                                        // Adding a tab character often forces Excel to treat as string, or using ="value" syntax
                                        // Here using ="YYYY-MM-DD" syntax which is standard for forcing string in Excel CSV
                                        const dateStr = `="${t.date}"`;
                                        return `${dateStr},"${t.text || t.source || 'Transaction'}",${t.category || t.source || 'General'},${t.type === 'expense' ? t.amount : 0},${t.type === 'income' ? t.amount : 0},${t.balance}`;
                                    })
                                ].join("\n");

                                const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' }); // Add BOM for UTF-8
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.setAttribute("href", url);
                                link.setAttribute("download", `Statement_${historyStartDate}_to_${historyEndDate}.csv`);
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            className="btn-primary-action"
                            style={{ margin: 0, padding: '10px 20px', fontSize: '0.9rem' }}
                        >
                            Download CSV
                        </button>

                        {/* Placeholder for PDF - reusing CSV logic or can be expanded later */}
                        {/* PDF Download Button */}
                        <button
                            onClick={() => {
                                if (!transactionHistory || transactionHistory.length === 0) return alert("No data to export");
                                DataManager.exportStatementPDF(transactionHistory, historyStartDate, historyEndDate);
                            }}
                            className="btn-primary-action"
                            style={{ margin: 0, padding: '10px 20px', fontSize: '0.9rem', background: '#e74c3c', color: 'white' }}
                        >
                            <FaDownload style={{ marginRight: '8px' }} /> Download PDF
                        </button>
                    </div>
                )}
            </div>

            {/* Bank Statement Table */}
            <div className="table-container glass-panel-no-pad" style={{ marginTop: '30px', padding: '10px' }}>
                <table className="statement-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '15%', padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>Date</th>
                            <th style={{ width: '30%', padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>Description</th>
                            <th style={{ width: '20%', padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>Category</th>
                            <th className="text-right" style={{ width: '12%', padding: '15px 20px', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>Debit</th>
                            <th className="text-right" style={{ width: '12%', padding: '15px 20px', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>Credit</th>
                            <th className="text-right" style={{ width: '11%', padding: '15px 20px', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactionHistory.length > 0 ? (
                            transactionHistory.map((t, index) => (
                                <tr key={index} className="fade-in-row" style={{ background: 'rgba(255,255,255,0.02)', transition: 'transform 0.2s' }}>
                                    <td className="date-cell" style={{ padding: '15px 20px' }}>{t.date}</td>
                                    <td className="desc-cell" style={{ padding: '15px 20px' }}>{t.text || t.source}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span className={`cat-badge ${t.type}`} style={{ padding: '8px 12px', borderRadius: '8px' }}>
                                            {getCategoryIcon(t.category || t.source)}
                                            {t.category || t.source}
                                        </span>
                                    </td>
                                    <td className="text-right debit-col" style={{ padding: '15px 20px', color: '#ff6b6b' }}>
                                        {t.type === 'expense' ? `- $${t.amount.toFixed(2)}` : '-'}
                                    </td>
                                    <td className="text-right credit-col" style={{ padding: '15px 20px', color: '#2ecc71' }}>
                                        {t.type === 'income' ? `+ $${t.amount.toFixed(2)}` : '-'}
                                    </td>
                                    <td className="text-right balance-col" style={{ padding: '15px 20px', fontWeight: 'bold' }}>
                                        ${t.balance.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data" style={{ padding: '40px', textAlign: 'center', opacity: 0.6 }}>No transactions found in this period</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
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
                    <div className="report-header">
                        <h1 className="welcome-title">Financial Reports</h1>

                        {/* Tab Switcher */}
                        <div className="report-tabs">
                            <button
                                className={`report-tab ${activeTab === 'charts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('charts')}
                            >
                                <FaChartLine /> Visual Analytics
                            </button>
                            <button
                                className={`report-tab ${activeTab === 'history' ? 'active' : ''}`}
                                onClick={() => setActiveTab('history')}
                            >
                                <FaTable /> Statement History
                            </button>
                        </div>
                    </div>

                    <div className="report-content">
                        {activeTab === 'charts' ? renderChartTab() : renderHistoryTab()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Reports;
