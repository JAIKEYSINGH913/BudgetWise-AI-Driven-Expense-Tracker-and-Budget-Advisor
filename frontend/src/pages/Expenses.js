import React, { useState, useEffect, useRef } from 'react';
import { handleSuccess, handleError } from '../utils';
import DataManager from '../utils/DataManager';
import { ToastContainer } from 'react-toastify';
import {
    FaTag, FaDollarSign, FaList, FaCalendarAlt, FaWallet,
    FaEdit, FaTrash, FaPlus, FaCamera, FaSpinner, FaTimes
} from 'react-icons/fa';
import FloatingStickers from '../components/FloatingStickers';
import VoiceAssistantOverlay from '../components/VoiceAssistantOverlay';
import './Home.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const parseVoiceTranscript = (transcript) => {
    const text = transcript.toLowerCase().trim();
    const result = {};

    // Amount: capture numbers including decimals, e.g. "50", "1500", "12.50"
    const amountPatterns = [
        /(?:rs\.?|rupees?|\$|dollars?|₹|spent|paid|cost|costed|costs)\s*([\d,]+(?:\.\d+)?)/i,
        /([\d,]+(?:\.\d+)?)\s*(?:rs\.?|rupees?|\$|dollars?|₹)/i,
        /([\d,]+(?:\.\d+)?)/,
    ];
    for (const p of amountPatterns) {
        const m = text.match(p);
        if (m) { result.amount = parseFloat(m[1].replace(/,/g, '')); break; }
    }

    // Date
    if (text.includes('today')) result.date = new Date().toISOString().split('T')[0];
    else if (text.includes('yesterday')) {
        const d = new Date(); d.setDate(d.getDate() - 1);
        result.date = d.toISOString().split('T')[0];
    } else {
        result.date = new Date().toISOString().split('T')[0]; // default to today
    }

    // Category keyword map
    const catMap = [
        { cat: 'Food', kw: ['food', 'grocery', 'groceries', 'restaurant', 'coffee', 'lunch', 'dinner', 'breakfast', 'snack', 'eat', 'meal', 'pizza', 'burger', 'biryani', 'chai', 'tea'] },
        { cat: 'Travel', kw: ['travel', 'uber', 'ola', 'taxi', 'cab', 'flight', 'bus', 'auto', 'rickshaw', 'metro', 'train', 'fuel', 'petrol', 'diesel', 'transport'] },
        { cat: 'Shopping', kw: ['shopping', 'amazon', 'flipkart', 'mall', 'clothes', 'clothing', 'shirt', 'shoes', 'fashion', 'purchase'] },
        { cat: 'Utilities', kw: ['utilities', 'electricity', 'electric', 'water', 'internet', 'wifi', 'broadband', 'bill', 'phone', 'recharge', 'mobile', 'gas'] },
        { cat: 'Health', kw: ['health', 'doctor', 'pharmacy', 'medicine', 'hospital', 'clinic', 'medical', 'gym', 'fitness'] },
        { cat: 'Education', kw: ['education', 'school', 'college', 'university', 'course', 'book', 'tuition', 'fees', 'class'] },
        { cat: 'Entertainment', kw: ['entertainment', 'movie', 'netflix', 'spotify', 'prime', 'hotstar', 'game', 'cinema', 'concert', 'show', 'subscription'] },
        { cat: 'Rent', kw: ['rent', 'landlord', 'pg', 'hostel', 'accommodation'] },
        { cat: 'General', kw: [] },
    ];
    for (const { cat, kw } of catMap) {
        if (kw.some(k => text.includes(k))) { result.category = cat; break; }
    }
    if (!result.category) result.category = 'General';

    // Title extraction — smart patterns
    const titlePatterns = [
        /(?:spent on|paid for|bought|purchased|expense for|for)\s+([a-zA-Z][a-zA-Z\s]{1,35}?)(?:\s+(?:for|today|yesterday|\d)|$)/i,
        /([a-zA-Z][a-zA-Z\s]{2,30})\s+(?:costed?|costs?|was|bill)/i,
        /(?:add|added)\s+(?:an?\s+)?expense\s+for\s+([a-zA-Z][a-zA-Z\s]{1,35})/i,
    ];
    for (const p of titlePatterns) {
        const m = transcript.match(p);
        if (m && m[1].trim().length > 2) { result.title = m[1].trim(); break; }
    }
    // Fallback: use category as title if no pattern matched
    if (!result.title) {
        const words = transcript.replace(/[\d.,]/g, '').trim();
        result.title = words.length > 3 ? words.slice(0, 50) : (result.category || 'Expense');
    }

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

    // Voice state
    const [isListening, setIsListening] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [voiceStatus, setVoiceStatus] = useState('');
    const recRef = useRef(null);

    // Receipt state
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

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
            const curr = expenses.find(e => e.id === editId);
            if (remainingBalance - (amount - parseFloat(curr.amount)) < 0)
                return handleError('Insufficient Funds!');
            await DataManager.updateExpense(editId, { ...formData, id: editId });
            setIsEditing(false); setEditId(null);
            handleSuccess('Expense Updated');
        }
        setFormData({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
        loadData();
    };

    const handleEdit = (expense) => { setFormData(expense); setIsEditing(true); setEditId(expense.id); };
    const handleDelete = async (id) => {
        if (window.confirm('Delete this expense?')) { await DataManager.deleteExpense(id); loadData(); handleSuccess('Deleted'); }
    };

    /* ---- Voice handlers ---- */
    const finalTranscriptRef = useRef('');

    const startListening = () => {
        if (!SpeechRecognition) return handleError('Voice not supported. Use Chrome or Edge.');
        const r = new SpeechRecognition();
        r.lang = 'en-US'; r.interimResults = true; r.continuous = false;
        recRef.current = r;
        finalTranscriptRef.current = '';

        r.onstart = () => { setIsListening(true); setVoiceTranscript(''); setVoiceStatus('🎙️ Listening... speak naturally'); };

        r.onresult = (ev) => {
            const t = Array.from(ev.results).map(x => x[0].transcript).join('');
            setVoiceTranscript(t);
            finalTranscriptRef.current = t; // keep ref in sync for onend
        };

        r.onend = () => {
            setIsListening(false);
            const t = finalTranscriptRef.current;
            if (!t) { setVoiceStatus('⚠️ Nothing heard. Try again.'); return; }
            // AUTO-APPLY immediately
            const parsed = parseVoiceTranscript(t);
            setFormData(prev => ({
                ...prev,
                title: parsed.title || prev.title,
                amount: parsed.amount !== undefined ? String(parsed.amount) : prev.amount,
                category: parsed.category || prev.category,
                date: parsed.date || prev.date,
            }));
            setVoiceStatus(`✅ Auto-filled: "${t.slice(0, 60)}${t.length > 60 ? '…' : ''}"`);
            setVoiceTranscript(''); // clear subtitle
        };

        r.onerror = (ev) => { setIsListening(false); setVoiceStatus(`❌ Error: ${ev.error}`); };
        r.start();
    };

    const cancelVoice = () => {
        recRef.current?.stop();
        setIsListening(false); setVoiceTranscript(''); setVoiceStatus('');
    };

    // No-op — auto-applied on end; kept for overlay prop compatibility
    const applyVoice = () => { };

    /* ---- Receipt ---- */
    const handleReceiptUpload = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        setReceiptPreview(URL.createObjectURL(file));
        setIsScanning(true); setScanStatus('🔍 AI is reading your receipt...');
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
            setScanStatus('✅ Receipt scanned! Fields auto-filled.');
        } else {
            setScanStatus('❌ Could not read receipt. Fill manually.');
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
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Remaining: </span>
                            <span style={{ color: remainingBalance >= 0 ? '#4caf50' : '#ef5350', fontSize: '1.2rem', fontWeight: 'bold' }}>${remainingBalance.toFixed(2)}</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                        {/* Form */}
                        <div className="auth-form-container" style={{ padding: 0, background: 'transparent', width: '100%', maxWidth: 'none', boxShadow: 'none' }}>
                            <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
                                {isEditing ? 'Edit Expense' : 'Add New Expense'}
                            </h2>

                            {/* ---- Voice Overlay ---- */}
                            <VoiceAssistantOverlay
                                isActive={isListening}
                                transcript={voiceTranscript}
                                statusHint={voiceStatus}
                                onStart={startListening}
                                onCancel={cancelVoice}
                                onSubmit={applyVoice}
                            />

                            {/* ---- Scan Receipt Button ---- */}
                            <button
                                type="button"
                                onClick={() => receiptInputRef.current?.click()}
                                disabled={isScanning}
                                style={{
                                    width: '100%', padding: '12px', marginBottom: '14px', borderRadius: '10px',
                                    cursor: isScanning ? 'not-allowed' : 'pointer',
                                    border: '1.5px solid rgba(129,199,132,0.5)',
                                    background: 'rgba(129,199,132,0.08)', color: '#81c784',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    fontWeight: '600', fontSize: '0.88rem', transition: 'all 0.3s ease'
                                }}
                            >
                                {isScanning
                                    ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Scanning receipt...</>
                                    : <><FaCamera /> Scan Receipt (AI)</>
                                }
                            </button>
                            <input ref={receiptInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleReceiptUpload} />

                            {/* Receipt preview */}
                            {(receiptPreview || scanStatus) && (
                                <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(129,199,132,0.07)', border: '1px solid rgba(129,199,132,0.25)' }}>
                                    {scanStatus && <div style={{ color: '#a5d6a7', fontSize: '0.83rem', marginBottom: receiptPreview ? '8px' : 0 }}>{scanStatus}</div>}
                                    {receiptPreview && (
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <img src={receiptPreview} alt="receipt" style={{ maxHeight: '75px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)' }} />
                                            <button onClick={clearReceipt} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#ef5350', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FaTimes size={9} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Manual form */}
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', fontSize: '0.88rem' }}><FaTag /> Title</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} style={inputStyle} placeholder="e.g. Grocery Shopping" />
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', fontSize: '0.88rem' }}><FaDollarSign /> Amount</label>
                                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} style={inputStyle} placeholder="0.00" />
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', fontSize: '0.88rem' }}><FaList /> Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                                        {categories.map((cat, i) => <option key={i} value={cat} style={{ background: '#333' }}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', fontSize: '0.88rem' }}><FaCalendarAlt /> Date</label>
                                    <input type="date" name="date" max={new Date().toISOString().split('T')[0]} value={formData.date} onChange={handleChange} style={inputStyle} />
                                </div>
                                <button type="submit" className="btn-primary-action">
                                    {isEditing ? <><FaEdit /> Update Expense</> : <><FaPlus /> Add Expense</>}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={() => { setIsEditing(false); setFormData({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] }); }}
                                        style={{ padding: '12px', borderRadius: '10px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                        <FaTimes /> Cancel Edit
                                    </button>
                                )}
                            </form>

                            <div style={{ marginTop: '18px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0, lineHeight: 1.8 }}>
                                    💡 <strong>Voice:</strong> Say <em>"Spent 50 on groceries today"</em><br />
                                    📸 <strong>Receipt:</strong> Upload any photo — AI auto-fills the details.
                                </p>
                            </div>
                        </div>

                        {/* Expense Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Recent Expenses</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                        <th style={{ padding: '10px' }}><FaCalendarAlt style={{ marginRight: 4, opacity: 0.7 }} />Date</th>
                                        <th style={{ padding: '10px' }}><FaTag style={{ marginRight: 4, opacity: 0.7 }} />Title</th>
                                        <th style={{ padding: '10px' }}><FaList style={{ marginRight: 4, opacity: 0.7 }} />Category</th>
                                        <th style={{ padding: '10px' }}><FaDollarSign style={{ marginRight: 4, opacity: 0.7 }} />Amount</th>
                                        <th style={{ padding: '10px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.length === 0
                                        ? <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No expenses yet.</td></tr>
                                        : expenses.map(exp => (
                                            <tr key={exp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '10px' }}>{exp.date}</td>
                                                <td style={{ padding: '10px' }}>{exp.title}</td>
                                                <td style={{ padding: '10px' }}><span style={{ padding: '4px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', fontSize: '0.8rem' }}>{exp.category}</span></td>
                                                <td style={{ padding: '10px' }}>${parseFloat(exp.amount).toFixed(2)}</td>
                                                <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => handleEdit(exp)} style={{ background: 'none', border: 'none', color: '#64b5f6', cursor: 'pointer' }}><FaEdit /></button>
                                                    <button onClick={() => handleDelete(exp.id)} style={{ background: 'none', border: 'none', color: '#ef5350', cursor: 'pointer' }}><FaTrash /></button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        </div>
    );
};

export default Expenses;
