import React, { useState, useEffect, useRef } from 'react';
import { handleSuccess, handleError } from '../utils';
import DataManager from '../utils/DataManager';
import { ToastContainer } from 'react-toastify';
import {
    FaTag, FaDollarSign, FaList, FaCalendarAlt, FaWallet,
    FaEdit, FaTrash, FaPlus, FaMicrophone, FaMicrophoneSlash,
    FaCamera, FaSpinner, FaTimes, FaCheckCircle
} from 'react-icons/fa';
import FloatingStickers from '../components/FloatingStickers';
import './Home.css';

/* ------- Voice Recognition helper ------- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

/* ------- Parse voice transcript into expense fields ------- */
const parseVoiceTranscript = (transcript) => {
    const text = transcript.toLowerCase();
    const result = {};

    // Amount: "twenty dollars", "$20", "20 rupees", etc.
    const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:dollar|rupee|pound|euro|rs|₹|\$)?s?/);
    if (amountMatch) result.amount = parseFloat(amountMatch[1]);

    // Date
    if (text.includes('today')) result.date = new Date().toISOString().split('T')[0];
    else if (text.includes('yesterday')) {
        const d = new Date(); d.setDate(d.getDate() - 1);
        result.date = d.toISOString().split('T')[0];
    }

    // Category keywords
    const categories = ['food', 'travel', 'shopping', 'utilities', 'health', 'education', 'entertainment', 'rent', 'general'];
    for (const cat of categories) {
        if (text.includes(cat)) { result.category = cat.charAt(0).toUpperCase() + cat.slice(1); break; }
    }
    if (text.includes('grocery') || text.includes('restaurant') || text.includes('coffee')) result.category = 'Food';
    if (text.includes('uber') || text.includes('taxi') || text.includes('flight')) result.category = 'Travel';
    if (text.includes('amazon') || text.includes('mall')) result.category = 'Shopping';

    // Title: try "spent on X", "paid for X", "bought X"
    const titlePatterns = [
        /(?:spent on|paid for|bought|purchased|expense for|added)\s+([a-z\s]+?)(?:\s+for|\s+\d|$)/i,
        /([a-z\s]{3,30})(?:\s+costed?|\s+was|\s+cost)/i,
    ];
    for (const p of titlePatterns) {
        const m = transcript.match(p);
        if (m && m[1].trim().length > 2) { result.title = m[1].trim(); break; }
    }
    if (!result.title) result.title = transcript.slice(0, 40);

    return result;
};

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [formData, setFormData] = useState({
        title: '', amount: '', category: 'Food',
        date: new Date().toISOString().split('T')[0]
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [remainingBalance, setRemainingBalance] = useState(0);
    const [categories, setCategories] = useState([]);

    // Voice states
    const [isListening, setIsListening] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [voiceStatus, setVoiceStatus] = useState('');
    const recognitionRef = useRef(null);

    // Receipt states
    const [isScanning, setIsScanning] = useState(false);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const [scanStatus, setScanStatus] = useState('');
    const receiptInputRef = useRef(null);

    const loadData = async () => {
        setExpenses(await DataManager.getExpenses());
        setRemainingBalance(await DataManager.getRemainingBalance());
        setCategories(await DataManager.getCategories());
    };

    useEffect(() => {
        loadData();
        window.addEventListener('budgetwise_data_change', loadData);
        return () => window.removeEventListener('budgetwise_data_change', loadData);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount) return handleError('Please fill required fields');

        const amount = parseFloat(formData.amount);
        if (!isEditing) {
            if (!(await DataManager.canAddExpense(amount)))
                return handleError(`Insufficient Funds! Remaining: $${remainingBalance.toFixed(2)}`);
            await DataManager.addExpense(formData);
            handleSuccess('Expense Added');
        } else {
            const currentExp = expenses.find(e => e.id === editId);
            const netChange = amount - parseFloat(currentExp.amount);
            if (remainingBalance - netChange < 0)
                return handleError(`Insufficient Funds to increase amount!`);
            await DataManager.updateExpense(editId, { ...formData, id: editId });
            setIsEditing(false); setEditId(null);
            handleSuccess('Expense Updated');
        }
        setFormData({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
        loadData();
    };

    const handleEdit = (expense) => { setFormData(expense); setIsEditing(true); setEditId(expense.id); };
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            await DataManager.deleteExpense(id);
            loadData(); handleSuccess('Expense Deleted');
        }
    };

    /* -------- Voice Logic -------- */
    const startListening = () => {
        if (!SpeechRecognition) return handleError('Voice recognition not supported in your browser.');
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;
        recognitionRef.current = recognition;

        recognition.onstart = () => { setIsListening(true); setVoiceStatus('🎙️ Listening... speak now'); };
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
            setVoiceTranscript(transcript);
        };
        recognition.onend = () => {
            setIsListening(false);
            setVoiceStatus('✅ Processing voice input...');
            if (voiceTranscript || recognitionRef.current._lastTranscript) {
                const t = recognitionRef.current._lastTranscript || voiceTranscript;
                const parsed = parseVoiceTranscript(t);
                setFormData(prev => ({
                    ...prev,
                    title: parsed.title || prev.title,
                    amount: parsed.amount !== undefined ? String(parsed.amount) : prev.amount,
                    category: parsed.category || prev.category,
                    date: parsed.date || prev.date,
                }));
                setVoiceStatus('✅ Fields auto-filled from voice. Please review.');
            } else {
                setVoiceStatus('⚠️ No speech detected. Try again.');
            }
        };
        recognition.onerror = (e) => {
            setIsListening(false);
            setVoiceStatus(`❌ Error: ${e.error}`);
        };
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
            setVoiceTranscript(transcript);
            recognitionRef.current._lastTranscript = transcript;
        };
        recognition.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
    };

    /* -------- Receipt Scan Logic -------- */
    const handleReceiptUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setReceiptPreview(URL.createObjectURL(file));
        setIsScanning(true);
        setScanStatus('🔍 AI is reading your receipt...');

        const result = await DataManager.scanReceipt(file);
        setIsScanning(false);

        if (result && !result.error) {
            setFormData(prev => ({
                ...prev,
                title: result.title || prev.title,
                amount: result.amount !== undefined ? String(result.amount) : prev.amount,
                category: result.category || prev.category,
                date: result.date || prev.date,
            }));
            setScanStatus('✅ Receipt scanned! Fields auto-filled. Please review.');
        } else {
            setScanStatus('❌ Could not read receipt. Please fill manually.');
        }
    };

    const clearReceipt = () => { setReceiptPreview(null); setScanStatus(''); if (receiptInputRef.current) receiptInputRef.current.value = ''; };

    const inputStyle = {
        width: '100%', padding: '12px', borderRadius: '10px',
        border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)',
        color: 'var(--text-primary)', boxSizing: 'border-box'
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
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
                        <h1 className="welcome-title" style={{ textAlign: 'left', margin: 0 }}>Expenses</h1>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaWallet style={{ color: '#fff' }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Remaining Budget: </span>
                            <span style={{ color: remainingBalance >= 0 ? '#4caf50' : '#ef5350', fontSize: '1.2rem', fontWeight: 'bold' }}>${remainingBalance.toFixed(2)}</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                        {/* Form Section */}
                        <div className="auth-form-container" style={{ padding: '0', background: 'transparent', width: '100%', maxWidth: 'none', boxShadow: 'none' }}>
                            <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
                                {isEditing ? 'Edit Expense' : 'Add New Expense'}
                            </h2>

                            {/* ---- AI Input Toolbar ---- */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                {/* Voice Button */}
                                <button
                                    type="button"
                                    onClick={isListening ? stopListening : startListening}
                                    title="Use voice to fill expense"
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer',
                                        border: `2px solid ${isListening ? '#ef5350' : 'rgba(100,181,246,0.6)'}`,
                                        background: isListening ? 'rgba(239,83,80,0.15)' : 'rgba(100,181,246,0.1)',
                                        color: isListening ? '#ef5350' : '#64b5f6',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        fontWeight: '600', fontSize: '0.85rem',
                                        transition: 'all 0.3s ease',
                                        animation: isListening ? 'pulse 1.2s infinite' : 'none'
                                    }}
                                >
                                    {isListening ? <FaMicrophoneSlash size={16} /> : <FaMicrophone size={16} />}
                                    {isListening ? 'Stop Listening' : 'Voice Entry'}
                                </button>

                                {/* Receipt Scan Button */}
                                <button
                                    type="button"
                                    onClick={() => receiptInputRef.current?.click()}
                                    disabled={isScanning}
                                    title="Scan a receipt to auto-fill fields"
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '10px', cursor: isScanning ? 'not-allowed' : 'pointer',
                                        border: '2px solid rgba(129,199,132,0.6)',
                                        background: 'rgba(129,199,132,0.1)',
                                        color: '#81c784',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        fontWeight: '600', fontSize: '0.85rem',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {isScanning ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={16} /> : <FaCamera size={16} />}
                                    {isScanning ? 'Scanning...' : 'Scan Receipt'}
                                </button>
                                <input ref={receiptInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleReceiptUpload} />
                            </div>

                            {/* Voice status */}
                            {voiceStatus && (
                                <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(100,181,246,0.1)', border: '1px solid rgba(100,181,246,0.3)', color: '#90caf9', fontSize: '0.85rem' }}>
                                    {voiceStatus}
                                    {voiceTranscript && <div style={{ marginTop: '6px', opacity: 0.7, fontStyle: 'italic' }}>"{voiceTranscript}"</div>}
                                </div>
                            )}

                            {/* Receipt preview & scan status */}
                            {(receiptPreview || scanStatus) && (
                                <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(129,199,132,0.08)', border: '1px solid rgba(129,199,132,0.3)' }}>
                                    {scanStatus && <div style={{ color: '#a5d6a7', fontSize: '0.85rem', marginBottom: receiptPreview ? '8px' : '0' }}>{scanStatus}</div>}
                                    {receiptPreview && (
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <img src={receiptPreview} alt="Receipt Preview" style={{ maxHeight: '80px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }} />
                                            <button onClick={clearReceipt} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef5350', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                <FaTimes size={9} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><FaTag /> Title</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} style={inputStyle} placeholder="e.g. Grocery Shopping" />
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><FaDollarSign /> Amount</label>
                                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} style={inputStyle} placeholder="0.00" />
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><FaList /> Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                                        {categories.map((cat, i) => <option key={i} value={cat} style={{ background: '#333' }}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><FaCalendarAlt /> Date</label>
                                    <input type="date" name="date" max={new Date().toISOString().split('T')[0]} value={formData.date} onChange={handleChange} style={inputStyle} />
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

                            {/* AI Tips */}
                            <div style={{ marginTop: '20px', padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0, lineHeight: '1.7' }}>
                                    💡 <strong>Voice Tips:</strong> Say things like <em>"Spent 50 dollars on groceries today"</em> or <em>"Paid 200 for rent yesterday"</em><br />
                                    📸 <strong>Receipt Tips:</strong> Upload a clear photo of your receipt and AI will auto-extract the details.
                                </p>
                            </div>
                        </div>

                        {/* List Section */}
                        <div style={{ overflowX: 'auto' }}>
                            <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Recent Expenses</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                        <th style={{ padding: '10px' }}><FaCalendarAlt style={{ marginRight: '5px', opacity: 0.7 }} />Date</th>
                                        <th style={{ padding: '10px' }}><FaTag style={{ marginRight: '5px', opacity: 0.7 }} />Title</th>
                                        <th style={{ padding: '10px' }}><FaList style={{ marginRight: '5px', opacity: 0.7 }} />Category</th>
                                        <th style={{ padding: '10px' }}><FaDollarSign style={{ marginRight: '5px', opacity: 0.7 }} />Amount</th>
                                        <th style={{ padding: '10px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.length === 0 ? (
                                        <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No expenses recorded yet.</td></tr>
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
                                                    <button onClick={() => handleEdit(expense)} style={{ background: 'none', border: 'none', color: '#64b5f6', cursor: 'pointer' }}><FaEdit /></button>
                                                    <button onClick={() => handleDelete(expense.id)} style={{ background: 'none', border: 'none', color: '#ef5350', cursor: 'pointer' }}><FaTrash /></button>
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

            {/* CSS for animations */}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(239,83,80,0.4); } 50% { box-shadow: 0 0 0 8px rgba(239,83,80,0); } }
            `}</style>
            <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        </div>
    );
};

export default Expenses;
