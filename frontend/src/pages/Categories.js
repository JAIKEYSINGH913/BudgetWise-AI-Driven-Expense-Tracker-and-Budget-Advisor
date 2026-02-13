import React, { useState, useEffect } from 'react';
import DataManager from '../utils/DataManager';
import { handleSuccess, handleError } from '../utils';
import {
    FaPlus, FaArrowLeft, FaTrash, FaMoneyBillWave, FaCalendarAlt, FaTag,
    FaUtensils, FaHome, FaPlane, FaShoppingBag, FaBolt, FaHeartbeat, FaGraduationCap, FaFilm, FaGamepad, FaCar
} from 'react-icons/fa';
import FloatingStickers from '../components/FloatingStickers';
import './Home.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [expenses, setExpenses] = useState([]);

    // For adding new category
    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        loadData();
        window.addEventListener('budgetwise_data_change', loadData);
        return () => window.removeEventListener('budgetwise_data_change', loadData);
    }, []);

    const loadData = async () => {
        setCategories(await DataManager.getCategories());
        setExpenses(await DataManager.getExpenses());
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        if (await DataManager.addCategory(newCategory.trim())) {
            handleSuccess(`Category "${newCategory}" added`);
            setNewCategory('');
            setIsAdding(false);
            loadData();
        } else {
            handleError('Category already exists or failed to add');
        }
    };

    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat);
    };

    // Filter expenses for the selected category
    const filteredExpenses = selectedCategory
        ? expenses.filter(exp => exp.category === selectedCategory)
        : [];

    const totalSpent = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    const getCategoryIcon = (categoryName) => {
        const name = categoryName.toLowerCase();
        // Icons with Colors
        if (name.includes('food') || name.includes('dining') || name.includes('restaurant')) return <FaUtensils style={{ color: '#ff9800' }} />;
        if (name.includes('rent') || name.includes('house') || name.includes('home')) return <FaHome style={{ color: '#2196f3' }} />;
        if (name.includes('travel') || name.includes('trip') || name.includes('flight')) return <FaPlane style={{ color: '#00bcd4' }} />;
        if (name.includes('transport') || name.includes('car') || name.includes('fuel')) return <FaCar style={{ color: '#3f51b5' }} />;
        if (name.includes('shopping') || name.includes('clothes')) return <FaShoppingBag style={{ color: '#e91e63' }} />;
        if (name.includes('utilit') || name.includes('bill') || name.includes('electric')) return <FaBolt style={{ color: '#ffeb3b' }} />;
        if (name.includes('health') || name.includes('medical') || name.includes('doctor')) return <FaHeartbeat style={{ color: '#f44336' }} />;
        if (name.includes('education') || name.includes('school') || name.includes('course')) return <FaGraduationCap style={{ color: '#9c27b0' }} />;
        if (name.includes('entertainment') || name.includes('movie')) return <FaFilm style={{ color: '#009688' }} />;
        if (name.includes('game') || name.includes('gaming')) return <FaGamepad style={{ color: '#673ab7' }} />;
        return <FaTag style={{ color: '#9e9e9e' }} />;
    };

    return (
        <div className="home-page">
            <div className="bubbles-container">
                <div className="bubble bubble--3"></div>
                <div className="bubble bubble--4"></div>
            </div>
            <FloatingStickers />
            <main className="home-main">
                <div className="home-glass-panel">

                    {/* Header Area */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '20px' }}>
                        {selectedCategory && (
                            <button onClick={() => setSelectedCategory(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <FaArrowLeft /> Back
                            </button>
                        )}
                        <h1 className="welcome-title" style={{ textAlign: 'left', margin: 0 }}>
                            {selectedCategory ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    {getCategoryIcon(selectedCategory)} {selectedCategory} Expenses
                                </span>
                            ) : 'Expense Categories'}
                        </h1>
                    </div>

                    {/* Main Content Area */}
                    {!selectedCategory ? (
                        /* Categories Grid View */
                        <div className="products-grid">
                            {/* Add Category Card */}
                            <div className="product-card" style={{ border: '2px dashed var(--border-color)', background: 'rgba(255,255,255,0.02)', cursor: 'default' }}>
                                {!isAdding ? (
                                    <div
                                        className="product-info"
                                        style={{ textAlign: 'center', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                                        onClick={() => setIsAdding(true)}
                                    >
                                        <FaPlus style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--accent-color)' }} />
                                        <h3 className="product-name">Add Category</h3>
                                    </div>
                                ) : (
                                    <div className="product-info" style={{ textAlign: 'center' }}>
                                        <input
                                            autoFocus
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            placeholder="Enter name..."
                                            style={{ width: '80%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white' }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddCategory();
                                                if (e.key === 'Escape') setIsAdding(false);
                                            }}
                                        />
                                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                            <button onClick={handleAddCategory} style={{ padding: '5px 10px', borderRadius: '5px', background: '#4caf50', color: 'white', border: 'none', cursor: 'pointer' }}>Add</button>
                                            <button onClick={() => setIsAdding(false)} style={{ padding: '5px 10px', borderRadius: '5px', background: 'transparent', color: '#ef5350', border: '1px solid #ef5350', cursor: 'pointer' }}>Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Existing Categories */}
                            {categories.map((cat, index) => (
                                <div
                                    key={index}
                                    className="product-card"
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', cursor: 'pointer' }}
                                    onClick={() => handleCategoryClick(cat)}
                                    title="Click to view details"
                                >
                                    <div className="product-info" style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
                                            {getCategoryIcon(cat)}
                                        </div>
                                        <h3 className="product-name" style={{ fontSize: '1.2rem' }}>{cat}</h3>
                                        <p className="product-price" style={{ fontSize: '0.9rem', opacity: 0.7 }}>Manage</p>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`Delete category "${cat}"?`)) {
                                                if (await DataManager.deleteCategory(cat)) {
                                                    handleSuccess('Category deleted');
                                                    loadData();
                                                }
                                            }
                                        }}
                                        className="category-delete-btn"
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'transparent',
                                            color: '#ef5350',
                                            border: 'none',
                                            padding: '5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s ease, opacity 0.2s ease'
                                        }}
                                        title="Delete Category"
                                    >
                                        <FaTrash size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Detail View (Expenses List) */
                        <div>
                            <div className="product-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaMoneyBillWave /> Total Spent on {selectedCategory}
                                    </h3>
                                    <h2 style={{ margin: '5px 0 0 0', fontSize: '2rem' }}>${totalSpent.toFixed(2)}</h2>
                                </div>
                                {/* Could add a specific "Add Expense for this Category" button here later */}
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                            <th style={{ padding: '15px' }}><FaCalendarAlt style={{ marginRight: '5px', opacity: 0.7 }} /> Date</th>
                                            <th style={{ padding: '15px' }}><FaTag style={{ marginRight: '5px', opacity: 0.7 }} /> Title</th>
                                            <th style={{ padding: '15px' }}><FaMoneyBillWave style={{ marginRight: '5px', opacity: 0.7 }} /> Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredExpenses.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    No expenses found in {selectedCategory}.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredExpenses.map(exp => (
                                                <tr key={exp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '15px' }}>{exp.date}</td>
                                                    <td style={{ padding: '15px' }}>{exp.title}</td>
                                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>${parseFloat(exp.amount).toFixed(2)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};
export default Categories;
