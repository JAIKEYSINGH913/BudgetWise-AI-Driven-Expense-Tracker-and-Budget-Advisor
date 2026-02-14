import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../utils/apiConfig';
import { FaUserShield } from 'react-icons/fa';
import './VerificationLock.css';
import './VerificationLock.css';
// import { handleError, handleSuccess } from '../utils'; // Removed unused imports

const VerificationLock = ({ children }) => {
    // Default to FALSE (Locked) for security. Only unlock if explicitly verified.
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Whitelisted routes that unverified users can access
    const allowedRoutes = ['/profile', '/login', '/signup', '/'];

    useEffect(() => {
        checkVerification();
        // Listen for updates (e.g. after verification in Profile)
        window.addEventListener('user-verified', checkVerification);
        return () => window.removeEventListener('user-verified', checkVerification);
    }, [location.pathname]);

    const checkVerification = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return; // Not logged in, handled by PrivateRoute usually
        }

        try {
            const url = `${API_BASE_URL}/auth/profile`;
            const response = await fetch(url, {
                headers: { 'Authorization': token }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch profile");
            }

            const result = await response.json();

            if (result.success) {
                // Backend ProfileResponse uses 'profile', AuthResponse uses 'user'
                const userData = result.profile || result.user;

                // Robust checking for emailVerified (boolean or string)
                let verified = false;
                if (userData) {
                    if (userData.emailVerified === true || userData.emailVerified === 'true') verified = true;
                    if (userData.isEmailVerified === true || userData.isEmailVerified === 'true') verified = true;
                }

                setIsVerified(verified);

                // Update local storage for other components if needed
                localStorage.setItem('isVerified', verified ? 'true' : 'false');
            } else {
                // API returned success: false
                setIsVerified(false);
            }
        } catch (err) {
            console.error("Verification check failed", err);
            // FAIL SECURE: If check fails, assume NOT verified
            setIsVerified(false);
        } finally {
            setLoading(false);
        }
    };

    // If loading, render children (don't block prematurely) or loader
    if (loading) return <>{children}</>;

    // If verified, render normally
    if (isVerified) return <>{children}</>;

    // If unverified, but on allowed route, render normally
    if (allowedRoutes.includes(location.pathname)) return <>{children}</>;

    // Otherwise, render Lock Overlay
    return (
        <div className="verification-lock-container">
            {/* We render children blurred in background */}
            <div className="blurred-content">
                {children}
            </div>

            {/* Glass Overlay */}
            <div className="glass-overlay">
                <div className="lock-card">
                    <div className="lock-icon">
                        <FaUserShield />
                    </div>
                    <h2>Account Unverified</h2>
                    <p>
                        Your account must be verified to access the dashboard and expenses.
                        Please verify your email address to unlock all features.
                    </p>
                    <div className="lock-actions">
                        <button
                            onClick={() => navigate('/profile', { state: { triggerVerification: true } })}
                            className="btn-go-verify"
                        >
                            Complete Verification
                        </button>
                        <button onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('loggedInUser');
                            navigate('/login');
                        }} className="btn-logout-lock">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationLock;
