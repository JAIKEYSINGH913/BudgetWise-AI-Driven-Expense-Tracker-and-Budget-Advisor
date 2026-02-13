import React, { useState, useEffect } from 'react';
import { handleSuccess, handleError } from '../utils';
import DataManager from '../utils/DataManager'; // Import DataManager
import { ToastContainer } from 'react-toastify';
import { FaTag, FaDollarSign, FaList, FaCalendarAlt, FaWallet, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import FloatingStickers from '../components/FloatingStickers';
import './Home.css';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [remainingBalance, setRemainingBalance] = useState(0);
    const [categories, setCategories] = useState([]);

    // Load Data
    const loadData = async () => {
        setExpenses(await DataManager.getExpenses());
        setRemainingBalance(await DataManager.getRemainingBalance());
        setCategories(await DataManager.getCategories());
    };

    useEffect(() => {
        loadData();
        // Listen for data changes (e.g. from other tabs or import)
        window.addEventListener('budgetwise_data_change', loadData);
        return () => window.removeEventListener('budgetwise_data_change', loadData);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount) {
            return handleError('Please fill required fields');
        }

        const amount = parseFloat(formData.amount);

        // Validation: Prevent negative remaining balance (only for new expenses or amount increase)
        // For simplicity, strict check: if adding this expense makes balance < 0
        if (!isEditing) {
            if (!(await DataManager.canAddExpense(amount))) {
                return handleError(`Insufficient Funds! Remaining: $${remainingBalance.toFixed(2)}`);
            }
            await DataManager.addExpense(formData);
            handleSuccess('Expense Added');
        } else {
            // Logic for edit: calculate difference or just re-save
            // Ideally check if (CurrentBalance + OldAmount - NewAmount) < 0
            const currentExp = expenses.find(e => e.id === editId);
            const netChange = amount - parseFloat(currentExp.amount);

            if (remainingBalance - netChange < 0) {
                return handleError(`Insufficient Funds to increase amount! Remaining: $${remainingBalance.toFixed(2)}`);
            }

            const updated = { ...formData, id: editId };
            await DataManager.updateExpense(editId, updated);

            setIsEditing(false);
            setEditId(null);
            handleSuccess('Expense Updated');
        }

        setFormData({
            title: '',
            amount: '',
            category: 'Food',
            date: new Date().toISOString().split('T')[0]
        });
        loadData(); // Refresh UI
    };

    const handleEdit = (expense) => {
        setFormData(expense);
        setIsEditing(true);
        setEditId(expense.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            await DataManager.deleteExpense(id); // Update storage
            loadData(); // Refresh remaining balance
            handleSuccess('Expense Deleted');
        }
    };

    return (
        <div className="home-page">
            <div className="bubbles-container">
                <div className="bubble bubble--1"></div>
                <div className="bubble bubble--2"></div>
            </div>
            <FloatingStickers />
            <main className="home-main">
                <div className="home-glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h1 className="welcome-title" style={{ textAlign: 'left', margin: 0 }}>Expenses</h1>
                        <div className="balance-display" style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaWallet style={{ color: '#fff' }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Remaining Budget: </span>
                            <span style={{ color: remainingBalance >= 0 ? '#4caf50' : '#ef5350', fontSize: '1.2rem', fontWeight: 'bold' }}>${remainingBalance.toFixed(2)}</span>
                        </div>
                    </div>


                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                        {/* Form Section */}
                        <div className="auth-form-container" style={{ padding: '0', background: 'transparent', width: '100%', maxWidth: 'none', boxShadow: 'none' }}>
                            <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>{isEditing ? 'Edit Expense' : 'Add New Expense'}</h2>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><FaTag /> Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                                        placeholder="e.g. Grocery Shopping"
                                    />
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><FaDollarSign /> Amount ($)</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><FaList /> Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                                    >
                                        {categories.map((cat, index) => (
                                            <option key={index} value={cat} style={{ background: '#333' }}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><FaCalendarAlt /> Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        max={new Date().toISOString().split('T')[0]} // Disable future dates
                                        value={formData.date}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                                <button type="submit" className="btn-primary-action">
                                    {isEditing ? <><FaEdit /> Update Expense</> : <><FaPlus /> Add Expense</>}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={() => { setIsEditing(false); setFormData({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] }); }} style={{ padding: '12px', borderRadius: '10px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* List Section */}
                        <div style={{ overflowX: 'auto' }}>
                            <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Recent Expenses</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                        <th style={{ padding: '10px' }}><FaCalendarAlt style={{ marginRight: '5px', opacity: 0.7 }} /> Date</th>
                                        <th style={{ padding: '10px' }}><FaTag style={{ marginRight: '5px', opacity: 0.7 }} /> Title</th>
                                        <th style={{ padding: '10px' }}><FaList style={{ marginRight: '5px', opacity: 0.7 }} /> Category</th>
                                        <th style={{ padding: '10px' }}><FaDollarSign style={{ marginRight: '5px', opacity: 0.7 }} /> Amount</th>
                                        <th style={{ padding: '10px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No expenses recorded yet.</td>
                                        </tr>
                                    ) : (
                                        expenses.map(expense => (
                                            <tr key={expense.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '10px' }}>{expense.date}</td>
                                                <td style={{ padding: '10px' }}>{expense.title}</td>
                                                <td style={{ padding: '10px' }}>
                                                    <span style={{ padding: '4px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', fontSize: '0.8rem' }}>{expense.category}</span>
                                                </td>
                                                <td style={{ padding: '10px' }}>${parseFloat(expense.amount).toFixed(2)}</td>
                                                <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => handleEdit(expense)} style={{ background: 'none', border: 'none', color: '#64b5f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <FaEdit />
                                                    </button>
                                                    <button onClick={() => handleDelete(expense.id)} style={{ background: 'none', border: 'none', color: '#ef5350', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
            <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        </div>
    );
};

export default Expenses;
