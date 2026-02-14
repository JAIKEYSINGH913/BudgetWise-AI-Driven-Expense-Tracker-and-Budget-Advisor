import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import ThemeToggle from '../components/ThemeToggle';
import FloatingStickers from '../components/FloatingStickers';
import BackgroundBubbles from '../components/BackgroundBubbles';
import Footer from '../components/Footer';
import './Auth.css';
import { useSound } from '../context/SoundContext';

import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {

    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false);

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [emailForVerification, setEmailForVerification] = useState('');

    const navigate = useNavigate();
    const { playClick, playSuccess, playError } = useSound();

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copyLoginInfo = { ...loginInfo };
        copyLoginInfo[name] = value;
        setLoginInfo(copyLoginInfo);
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        playClick();
        const { email, password } = loginInfo;
        if (!email || !password) {
            return handleError('email and password are required')
        }
        try {
            const url = `http://localhost:8080/auth/login`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    identifier: loginInfo.email,
                    password: loginInfo.password
                })
            });
            const result = await response.json();
            const { success, message, token, error } = result;

            if (success) {
                playSuccess();
                handleSuccess(message);
                localStorage.setItem('token', token);
                // Backend ProfileResponse uses 'profile', AuthResponse uses 'user' (check API)
                // Assuming result.user from login
                localStorage.setItem('loggedInUser', result.user?.name);
                localStorage.setItem('loggedInUsername', result.user?.username || 'User');
                localStorage.setItem('loggedInUserImage', result.user?.profileImage || '');
                localStorage.setItem('loggedInUserEmail', result.user?.email || '');
                localStorage.setItem('loggedInUserMobile', result.user?.mobile || '');
                localStorage.setItem('loggedInUserCreatedAt', result.user?.createdAt || '');
                localStorage.setItem('loggedInUserCreatedAt', result.user?.createdAt || '');
                localStorage.setItem('isVerified', result.user?.emailVerified);
                if (result.user?.backgroundColor) localStorage.setItem('backgroundColor', result.user.backgroundColor);
                if (result.user?.backgroundImageUrl) localStorage.setItem('backgroundImageUrl', result.user.backgroundImageUrl);
                if (result.user?.navbarColor) localStorage.setItem('navbarColor', result.user.navbarColor);
                if (result.user?.sidebarColor) localStorage.setItem('sidebarColor', result.user.sidebarColor);
                setTimeout(() => {
                    navigate('/home')
                }, 1000)
            } else if (response.status === 403 && message.toLowerCase().includes('verified')) {
                playError();
                // Handle Unverified User
                handleError("Account not verified. Please enter the OTP sent to your email.");
                setEmailForVerification(email.includes('@') ? email : '');
                setShowOtpModal(true);
            } else if (error) {
                playError();
                const details = error?.details[0].message;
                handleError(details);
            } else if (!success) {
                playError();
                handleError(message);
            }
        } catch (err) {
            playError();
            handleError(err.message || 'An error occurred');
        }
    }

    // Forgot Password State
    const [forgotPasswordStep, setForgotPasswordStep] = useState(0); // 0=None/Verify, 1=Request, 2=VerifyOTP, 3=Reset
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showResetPassword, setShowResetPassword] = useState(false);

    const handleVerifyOtp = async () => {
        if (!otp || !emailForVerification) return handleError("Please enter email and OTP");
        try {
            const url = `http://localhost:8080/auth/verify-otp`;
            const response = await fetch(url, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: emailForVerification, otp })
            });
            const result = await response.json();
            if (result.success) {
                handleSuccess("Verification successful! You can now login.");
                setShowOtpModal(false);
                setOtp('');
            } else {
                handleError(result.message);
            }
        } catch (err) {
            handleError(err.message);
        }
    }

    const handleResendOtp = async () => {
        if (!emailForVerification) return handleError("Please enter your email first");
        try {
            const url = `http://localhost:8080/auth/resend-otp?email=${encodeURIComponent(emailForVerification)}`;
            const response = await fetch(url, { method: "POST" });
            const result = await response.json();
            if (result.success) {
                handleSuccess("OTP resent successfully");
            } else {
                handleError(result.message);
            }
        } catch (err) {
            handleError(err.message);
        }
    }

    // Forgot Password Handlers
    const handleForgotRequest = async () => {
        if (!emailForVerification) return handleError("Please enter your email or username");
        try {
            const url = `http://localhost:8080/auth/forgot-password`;
            const response = await fetch(url, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: emailForVerification })
            });
            const result = await response.json();
            if (result.success) {
                handleSuccess("OTP sent to your email");
                setForgotPasswordStep(2); // Move to Verify step
                setOtp('');
            } else {
                handleError(result.message || "User not found");
            }
        } catch (err) {
            handleError(err.message);
        }
    }

    const handleForgotVerify = async () => {
        if (!otp) return handleError("Please enter OTP");
        try {
            const url = `http://localhost:8080/auth/verify-reset-otp`;
            const response = await fetch(url, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: emailForVerification, otp })
            });
            const result = await response.json();
            if (result.success) {
                setResetToken(result.token); // Save secure token
                setForgotPasswordStep(3); // Move to Reset step
                handleSuccess("OTP Verified. Set new password.");
            } else {
                handleError(result.message);
            }
        } catch (err) {
            handleError(err.message);
        }
    }

    const handleForgotReset = async () => {
        if (!newPassword || !confirmPassword) return handleError("Please fill all fields");
        if (newPassword !== confirmPassword) return handleError("Passwords do not match");

        try {
            const url = `http://localhost:8080/auth/reset-password`;
            const response = await fetch(url, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: resetToken, newPassword })
            });
            const result = await response.json();
            if (result.success) {
                handleSuccess("Password reset successfully! Please login.");
                setShowOtpModal(false);
                setForgotPasswordStep(0);
                setLoginInfo({ ...loginInfo, password: '' });
            } else {
                handleError(result.message);
            }
        } catch (err) {
            handleError(err.message);
        }
    }

    return (
        <div className="auth-page">
            <BackgroundBubbles />
            <FloatingStickers />
            <div className="auth-header">
                <ThemeToggle />
            </div>
            <div className='container auth-container animate-scale-in'>
                <div className="auth-branding">
                    <img src="/logo512.png" alt="BudgetWise Logo" className="auth-logo" style={{ width: '80px', marginBottom: '15px' }} />
                    <h1 className="brand-title">BudgetWise</h1>
                    <p className="brand-subtitle">AI Driven Expense Tracker</p>
                </div>
                <h2 className="auth-heading">Welcome Back</h2>
                <p className="auth-description">Sign in to continue managing your budget</p>
                <form onSubmit={handleLogin}>
                    <div className="form-group animate-slide-up delay-100">
                        <label htmlFor='email'>Email / Username</label>
                        <input
                            onChange={handleChange}
                            type='text'
                            name='email'
                            placeholder='Enter your email or username...'
                            value={loginInfo.email}
                            required
                        />
                    </div>
                    <div className="form-group animate-slide-up delay-200">
                        <label htmlFor='password'>Password</label>
                        <div className="password-container">
                            <input
                                onChange={handleChange}
                                type={showPassword ? 'text' : 'password'}
                                name='password'
                                placeholder='Enter your password...'
                                value={loginInfo.password}
                                required
                            />
                            <span
                                className="password-toggle-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </span>
                        </div>
                    </div>
                    <div className="form-group animate-slide-up delay-300" style={{ alignItems: 'flex-end' }}>
                        <span
                            onClick={() => { setShowOtpModal(true); setForgotPasswordStep(1); setEmailForVerification(''); }}
                            style={{ cursor: 'pointer', color: 'var(--primary-color)', fontSize: '0.9rem', textDecoration: 'underline' }}
                        >
                            Forgot Password?
                        </span>
                    </div>
                    <button type='submit' className="sticky animate-slide-up delay-400">Login</button>
                    <div className="auth-footer animate-slide-up delay-500">
                        <span>Don't have an account? <Link to="/signup" onClick={playClick}>Sign Up</Link></span>
                    </div>
                </form>
            </div>

            {/* OTP Modal (Handles Unverified Login AND Forgot Password) */}
            {showOtpModal && (
                <div className="otp-modal-overlay">
                    <div className="otp-modal">
                        {/* Dynamic Header based on Flow */}
                        <h3>{forgotPasswordStep > 0 ? "Reset Password" : "Verify Your Account"}</h3>

                        {/* Step 0: Verification for Unverified Login (Default) */}
                        {forgotPasswordStep === 0 && (
                            <>
                                <p style={{ marginBottom: '10px' }}>Account exists but is unverified.</p>
                                <input
                                    type="email"
                                    value={emailForVerification}
                                    onChange={(e) => setEmailForVerification(e.target.value)}
                                    placeholder="Confirm your Email"
                                    className="otp-input"
                                    style={{ marginTop: '0', marginBottom: '10px', fontSize: '1rem', padding: '10px' }}
                                />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit Code"
                                    className="otp-input"
                                    maxLength={6}
                                />
                                <div className="otp-actions">
                                    <button onClick={handleVerifyOtp} className="btn-verify-confirm">Verify</button>
                                    <button onClick={() => setShowOtpModal(false)} className="btn-cancel">Cancel</button>
                                </div>
                                <button onClick={handleResendOtp} className="btn-link">Resend Code</button>
                            </>
                        )}

                        {/* Step 1: Forgot Password - Request OTP */}
                        {forgotPasswordStep === 1 && (
                            <>
                                <p>Enter your email/username to receive an OTP.</p>
                                <input
                                    type="text"
                                    value={emailForVerification}
                                    onChange={(e) => setEmailForVerification(e.target.value)}
                                    placeholder="Email or Username"
                                    className="otp-input"
                                    style={{ fontSize: '1.2rem', padding: '12px' }}
                                />
                                <div className="otp-actions">
                                    <button onClick={handleForgotRequest} className="btn-verify-confirm">Send OTP</button>
                                    <button onClick={() => { setShowOtpModal(false); setForgotPasswordStep(0); }} className="btn-cancel">Cancel</button>
                                </div>
                            </>
                        )}

                        {/* Step 2: Forgot Password - Verify OTP */}
                        {forgotPasswordStep === 2 && (
                            <>
                                <p>Enter the code sent to your email.</p>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit Code"
                                    className="otp-input"
                                    maxLength={6}
                                />
                                <div className="otp-actions">
                                    <button onClick={handleForgotVerify} className="btn-verify-confirm">Verify</button>
                                    <button onClick={() => setForgotPasswordStep(1)} className="btn-cancel">Back</button>
                                </div>
                            </>
                        )}

                        {/* Step 3: Forgot Password - Set New Password */}
                        {forgotPasswordStep === 3 && (
                            <form onSubmit={(e) => { e.preventDefault(); handleForgotReset(); }}>
                                <p>Set your new password.</p>
                                <div className="password-container" style={{ marginBottom: '15px' }}>
                                    <input
                                        type={showResetPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="New Password"
                                        className="otp-input"
                                        style={{ fontSize: '1.2rem', padding: '12px', margin: 0 }}
                                        autoComplete="new-password"
                                    />
                                    <span
                                        className="password-toggle-icon"
                                        style={{ top: '50%', right: '15px' }}
                                        onClick={() => setShowResetPassword(!showResetPassword)}
                                    >
                                        {showResetPassword ? <FaEye /> : <FaEyeSlash />}
                                    </span>
                                </div>
                                <div className="password-container">
                                    <input
                                        type={showResetPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm Password"
                                        className="otp-input"
                                        style={{ fontSize: '1.2rem', padding: '12px', margin: 0 }}
                                        autoComplete="new-password"
                                    />
                                    <span
                                        className="password-toggle-icon"
                                        style={{ top: '50%', right: '15px' }}
                                        onClick={() => setShowResetPassword(!showResetPassword)}
                                    >
                                        {showResetPassword ? <FaEye /> : <FaEyeSlash />}
                                    </span>
                                </div>
                                <div className="otp-actions" style={{ marginTop: '20px' }}>
                                    <button type="submit" className="btn-verify-confirm">Set Password</button>
                                    <button type="button" onClick={() => { setShowOtpModal(false); setForgotPasswordStep(0); }} className="btn-cancel">Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover
                toastClassName="custom-toast"
            />
            <Footer />
        </div>
    )
}

export default Login
