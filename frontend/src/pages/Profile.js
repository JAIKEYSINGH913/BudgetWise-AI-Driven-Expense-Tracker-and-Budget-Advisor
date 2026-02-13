import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCamera, FaIdCard, FaSignOutAlt, FaShieldAlt, FaUserCircle } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { handleSuccess, handleError } from '../utils';
import { API_BASE_URL } from '../utils/apiConfig';
import FloatingStickers from '../components/FloatingStickers';
import './Profile.css';

const Profile = () => {
    const location = useLocation();

    // User Data State
    const [user, setUser] = useState({
        name: '',
        email: '',
        username: '',
        mobile: '',
        profileImage: '',
        emailVerified: false,
        mobileVerified: false,
        createdAt: ''
    });

    const [activeTab, setActiveTab] = useState('overview');

    // Edit Form State
    const [editInfo, setEditInfo] = useState({
        name: '',
        email: '',
        username: '',
        mobile: '',
        currentPassword: '',
        newPassword: ''
    });

    // Image Upload State
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    // OTP State (Only for Email Verification)
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpIdentifier, setOtpIdentifier] = useState('');

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle External Verification Trigger (from Lock Screen)
    useEffect(() => {
        if (location.state?.triggerVerification && user.email) {
            handleSendOtp(user.email);
            window.history.replaceState({}, document.title);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, user.email]);

    const fetchProfile = async () => {
        try {
            const url = `${API_BASE_URL}/auth/profile`;
            const headers = {
                headers: { 'Authorization': localStorage.getItem('token') }
            }
            const response = await fetch(url, headers);
            const result = await response.json();
            if (result.success) {
                setUser(result.profile);
                setEditInfo({
                    name: result.profile.name,
                    email: result.profile.email,
                    username: result.profile.username,
                    mobile: result.profile.mobile || '',
                    currentPassword: '',
                    newPassword: ''
                });

            } else {
                handleError(result.message);
            }
        } catch (err) {
            handleError('Failed to fetch profile');
        }
    };

    const handleInitialChange = (e) => {
        const { name, value } = e.target;
        setEditInfo({ ...editInfo, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', editInfo.name);
        formData.append('email', editInfo.email);
        formData.append('username', editInfo.username);

        if (editInfo.mobile) formData.append('mobile', editInfo.mobile);

        if (editInfo.currentPassword && editInfo.newPassword) {
            formData.append('password', editInfo.currentPassword);
            formData.append('newPassword', editInfo.newPassword);
        }

        if (profileImage) {
            formData.append('profileImage', profileImage);
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
                handleSuccess(result.message);
                setEditInfo(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
                fetchProfile();
            } else {
                handleError(result.message);
            }
        } catch (err) {
            handleError('An error occurred during update');
        }
    };

    // OTP Logic (Email Only)
    const handleSendOtp = async (identifier) => {
        try {
            const url = `${API_BASE_URL}/auth/resend-otp?email=${encodeURIComponent(identifier)}`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            });
            const result = await response.json();
            if (result.success) {
                handleSuccess(result.message);
                setOtpIdentifier(identifier);
                setShowOtpModal(true);
            } else {
                handleError(result.message);
            }
        } catch (err) {
            handleError('Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return handleError('Please enter OTP');
        try {
            const url = `${API_BASE_URL}/auth/verify-otp`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ identifier: otpIdentifier, otp })
            });
            const result = await response.json();
            if (result.success) {
                handleSuccess('Verified successfully');
                setShowOtpModal(false);
                fetchProfile();
                window.dispatchEvent(new Event('user-verified'));
            } else {
                handleError(result.message);
            }
        } catch (err) {
            handleError('Verification failed');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('backgroundColor');
        localStorage.removeItem('backgroundImageUrl');
        localStorage.removeItem('navbarColor'); // added cleanup for navbarColor
        window.location.href = '/login';
    };

    const handleDelete = async () => {
        const password = prompt("Type your password to confirm account deletion:");
        if (!password) return;
        try {
            const url = `${API_BASE_URL}/auth/profile/delete`;
            const response = await fetch(url, {
                method: "DELETE",
                headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('token') },
                body: JSON.stringify({ password })
            });
            const result = await response.json();
            if (result.success) {
                handleSuccess("Account deleted.");
                localStorage.clear();
                window.location.href = "/login";
            } else {
                handleError(result.message);
            }
        } catch (err) { handleError(err.message); }
    }

    return (
        <div className="app-container">
            <FloatingStickers />
            <Sidebar />
            <div className="main-content">
                <div className="profile-container animate-fade-in">

                    {/* Unified Profile Card */}
                    <div className="profile-card-unified">

                        {/* LEFT SIDE: Navigation & Mini Profile */}
                        <div className="profile-sidebar-pane">
                            <div className="profile-mini-header">
                                <div className="profile-avatar-wrapper">
                                    <div className="profile-avatar-container-small">
                                        {previewImage || user.profileImage ? (
                                            <img
                                                src={previewImage || `${API_BASE_URL}/${user.profileImage}`}
                                                alt="Profile"
                                                className="profile-avatar-small"
                                            />
                                        ) : (
                                            <FaUserCircle className="profile-avatar-small" style={{ color: 'rgba(255,255,255,0.5)', padding: '5px' }} />
                                        )}
                                    </div>
                                    <div className={`status-dot ${user.emailVerified ? 'online' : 'away'}`}></div>
                                </div>
                                <h3 className="profile-name-small">{user.name || 'User'}</h3>
                                <p className="profile-username-small">@{user.username}</p>

                                {/* Verify Badge / Button */}
                                <div style={{ marginTop: '10px' }}>
                                    {user.emailVerified ? (
                                        <div className="badge-verified-pill">
                                            <FaShieldAlt /> Verified Member
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleSendOtp(user.email)}
                                            className="btn-verify-sidebar pulse-anim"
                                        >
                                            Verify Account
                                        </button>
                                    )}
                                </div>

                                <p className="profile-join-date">Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                            </div>

                            <div className="profile-nav-menu">
                                <button
                                    className={`profile-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    <FaIdCard className="nav-icon" /> Overview
                                </button>
                                <button
                                    className={`profile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('settings')}
                                >
                                    <FaUser className="nav-icon" /> Settings
                                </button>
                                <button onClick={handleLogout} className="profile-nav-item logout">
                                    <FaSignOutAlt className="nav-icon" /> Sign Out
                                </button>
                            </div>
                        </div>

                        {/* RIGHT SIDE: Content Area */}
                        <div className="profile-content-area">

                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="profile-section overview-section animate-slide-up">
                                    <h2 className="section-title">Profile Overview</h2>

                                    <div className="info-grid">
                                        <div className="info-item">
                                            <div className="info-label"><FaUser /> Full Name</div>
                                            <div className="info-value">{user.name}</div>
                                        </div>
                                        <div className="info-item">
                                            <div className="info-label">@ Username</div>
                                            <div className="info-value">{user.username}</div>
                                        </div>
                                        <div className="info-item">
                                            <div className="info-label"><FaEnvelope /> Email Address</div>
                                            <div className="info-value">
                                                {user.email}
                                                {user.emailVerified && <span className="badge-verified"><FaShieldAlt /> Verified</span>}
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <div className="info-label"><FaPhone /> Mobile Number</div>
                                            <div className="info-value">{user.mobile || 'Not set'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SETTINGS TAB */}
                            {activeTab === 'settings' && (
                                <div className="profile-section settings-section animate-slide-up">
                                    <h2 className="section-title">Edit Profile</h2>
                                    <form onSubmit={handleUpdateProfile} className="edit-form">

                                        {/* Image Upload */}
                                        <div className="form-group center-group">
                                            <div className="image-upload-wrapper">
                                                <label htmlFor="profileImageInput" className="image-upload-label">
                                                    {previewImage || user.profileImage ? (
                                                        <img
                                                            src={previewImage || `${API_BASE_URL}/${user.profileImage}`}
                                                            alt="Upload"
                                                            className="profile-avatar-upload"
                                                        />
                                                    ) : (
                                                        <FaUserCircle className="profile-avatar-upload" style={{ color: 'rgba(255,255,255,0.5)', padding: '10px' }} />
                                                    )}
                                                    <div className="upload-overlay"><FaCamera /></div>
                                                </label>
                                                <input
                                                    type="file"
                                                    id="profileImageInput"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    hidden
                                                />
                                            </div>
                                            <p className="form-hint">Click to update profile picture</p>
                                        </div>

                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label>Full Name</label>
                                                <div className="input-wrapper">
                                                    <FaUser className="input-icon" />
                                                    <input type="text" name="name" value={editInfo.name} onChange={handleInitialChange} placeholder="John Doe" />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label>Username</label>
                                                <div className="input-wrapper">
                                                    <span className="input-icon">@</span>
                                                    <input type="text" name="username" value={editInfo.username} onChange={handleInitialChange} placeholder="username" />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label>Email</label>
                                                <div className="input-wrapper">
                                                    <FaEnvelope className="input-icon" />
                                                    <input type="email" name="email" value={editInfo.email} onChange={handleInitialChange} placeholder="user@example.com" />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label>Mobile</label>
                                                <div className="input-wrapper">
                                                    <FaPhone className="input-icon" />
                                                    <input type="text" name="mobile" value={editInfo.mobile} onChange={handleInitialChange} placeholder="1234567890" />
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="section-subtitle">Change Password</h3>
                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label>Current Password</label>
                                                <div className="input-wrapper">
                                                    <FaLock className="input-icon" />
                                                    <input type="password" name="currentPassword" value={editInfo.currentPassword} onChange={handleInitialChange} placeholder="••••••" />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>New Password</label>
                                                <div className="input-wrapper">
                                                    <FaLock className="input-icon" />
                                                    <input type="password" name="newPassword" value={editInfo.newPassword} onChange={handleInitialChange} placeholder="••••••" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-actions">
                                            <button type="submit" className="save-btn">Save Changes</button>
                                        </div>
                                    </form>

                                    <div className="danger-zone-compact">
                                        <h4>Delete Account</h4>
                                        <button onClick={handleDelete} className="delete-btn-text">Delete my account permanently</button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* OTP Modal (Signin Style) */}
                    {showOtpModal && (
                        <div className="otp-modal-overlay">
                            <div className="otp-modal animate-scale-in">
                                <h3>Verify Your Account</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Enter the 6-digit code sent to <br /><strong>{otpIdentifier}</strong></p>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="otp-input"
                                    placeholder="123456"
                                    maxLength={6}
                                    autoFocus
                                    style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '1.5rem' }}
                                />
                                <div className="otp-actions" style={{ flexDirection: 'column', gap: '10px' }}>
                                    <button onClick={handleVerifyOtp} className="btn-verify-confirm" style={{ width: '100%' }}>Verify Now</button>
                                    <button onClick={() => setShowOtpModal(false)} className="btn-cancel" style={{ width: '100%' }}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Profile;
