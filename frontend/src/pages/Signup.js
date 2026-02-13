import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import ThemeToggle from '../components/ThemeToggle';
import FloatingStickers from '../components/FloatingStickers';
import BackgroundBubbles from '../components/BackgroundBubbles';
import './Auth.css';
import { useSound } from '../context/SoundContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Signup() {

    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: '',
        username: '',
        mobile: ''
    })
    const [profileImage, setProfileImage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { playClick, playSuccess, playError } = useSound();

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copySignupInfo = { ...signupInfo };
        copySignupInfo[name] = value;
        setSignupInfo(copySignupInfo);
    }

    const handleFileChange = (e) => {
        setProfileImage(e.target.files[0]);
    }

    const handleSignup = async (e) => {
        e.preventDefault();
        playClick();
        const { name, email, password, username } = signupInfo;
        if (!name || !email || !password || !username) {
            return handleError('Name, email, username and password are required')
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('username', username);
        if (signupInfo.mobile) formData.append('mobile', signupInfo.mobile);
        if (profileImage) formData.append('profileImage', profileImage);

        setIsLoading(true);
        try {
            const url = `http://localhost:8080/auth/signup`;
            const response = await fetch(url, {
                method: "POST",
                body: formData
            });
            const result = await response.json();
            const { success, message, error } = result;

            setIsLoading(false);
            if (success) {
                playSuccess();
                handleSuccess(message); // "Signup successful. Please verify..."
                setShowOtpModal(true); // Trigger OTP Modal
            } else if (error) {
                playError();
                const details = error?.details[0].message;
                handleError(details);
            } else if (!success) {
                playError();
                handleError(message);
            }
        } catch (err) {
            setIsLoading(false);
            playError();
            handleError(err.message || 'An error occurred');
        }
    }

    const handleVerifyOtp = async () => {
        if (!otp) return handleError("Please enter OTP");
        setIsLoading(true);
        try {
            const url = `http://localhost:8080/auth/verify-otp`;
            const response = await fetch(url, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: signupInfo.email, otp })
            });
            const result = await response.json();
            setIsLoading(false);
            if (result.success) {
                handleSuccess("Verification successful! Redirecting to login...");
                setShowOtpModal(false);
                setTimeout(() => navigate('/login'), 1500);
            } else {
                handleError(result.message);
            }
        } catch (err) {
            setIsLoading(false);
            handleError(err.message);
        }
    }

    const handleResendOtp = async () => {
        try {
            const url = `http://localhost:8080/auth/resend-otp?email=${encodeURIComponent(signupInfo.email)}`;
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
                <h2 className="auth-heading">Create Account</h2>
                <p className="auth-description">Join BudgetWise to start managing your expenses</p>
                <form onSubmit={handleSignup}>
                    <div className="form-group animate-slide-up delay-100">
                        <label htmlFor='name'>Full Name</label>
                        <input
                            onChange={handleChange}
                            type='text'
                            name='name'
                            autoFocus
                            placeholder='Enter your full name...'
                            value={signupInfo.name}
                            required
                        />
                    </div>
                    <div className="form-group animate-slide-up delay-200">
                        <label htmlFor='username'>Username</label>
                        <input
                            onChange={handleChange}
                            type='text'
                            name='username'
                            placeholder='Choose a unique username...'
                            value={signupInfo.username}
                            required
                        />
                    </div>
                    <div className="form-group animate-slide-up delay-300">
                        <label htmlFor='email'>Email Address</label>
                        <input
                            onChange={handleChange}
                            type='email'
                            name='email'
                            placeholder='Enter your email...'
                            value={signupInfo.email}
                            required
                        />
                    </div>
                    <div className="form-group animate-slide-up delay-400">
                        <label htmlFor='mobile'>Mobile (Optional)</label>
                        <input
                            onChange={handleChange}
                            type='text'
                            name='mobile'
                            placeholder='Enter mobile number...'
                            value={signupInfo.mobile}
                        />
                    </div>
                    <div className="form-group animate-slide-up delay-500">
                        <label htmlFor='profileImage'>Profile Image (Optional)</label>
                        <input
                            onChange={handleFileChange}
                            type='file'
                            name='profileImage'
                            accept="image/*"
                            style={{ width: 'auto', margin: '0 auto', display: 'block' }}
                        />
                        {profileImage && (
                            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                                <img
                                    src={URL.createObjectURL(profileImage)}
                                    alt="Profile Preview"
                                    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="form-group animate-slide-up delay-600">
                        <label htmlFor='password'>Password</label>
                        <div className="password-container">
                            <input
                                onChange={handleChange}
                                type={showPassword ? 'text' : 'password'}
                                name='password'
                                placeholder='Create a strong password...'
                                value={signupInfo.password}
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
                    <button type='submit' className="sticky animate-slide-up delay-700" disabled={isLoading}>
                        {isLoading ? 'Signing up...' : 'Sign Up'}
                    </button>
                    <div className="auth-footer animate-slide-up delay-700">
                        <span>Already have an account? <Link to="/login" onClick={playClick}>Login</Link></span>
                    </div>
                </form>
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="otp-modal-overlay">
                    <div className="otp-modal">
                        <h3>Verify Your Email</h3>
                        <p>We sent a 6-digit code to <br /><strong>{signupInfo.email}</strong></p>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit Code"
                            className="otp-input"
                            maxLength={6}
                        />
                        <div className="otp-actions">
                            <button onClick={handleVerifyOtp} className="btn-verify-confirm" disabled={isLoading}>
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </button>
                            {/* Disabled Cancel mostly to force verification, but allow exit to login? */}
                            <button onClick={() => navigate('/login')} className="btn-cancel">Cancel</button>
                        </div>
                        <button onClick={handleResendOtp} className="btn-link">Resend Code</button>
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
        </div>
    )
}

export default Signup
