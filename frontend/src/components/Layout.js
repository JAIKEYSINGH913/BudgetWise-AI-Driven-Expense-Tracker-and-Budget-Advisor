import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import { handleSuccess } from '../utils'; // Assuming this is available
import Sidebar from './Sidebar';
import FloatingStickers from './FloatingStickers';
import BackgroundBubbles from './BackgroundBubbles';
import '../pages/Home.css'; // Reusing global app styles including Navbar

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    // Assuming loggedInUser is stored or managed globally/context, 
    // but for the Navbar text (which doesn't seem to have the user name in the shared part, only Home does), it's fine.

    React.useEffect(() => {
        const navbarColor = localStorage.getItem('navbarColor');
        const sidebarColor = localStorage.getItem('sidebarColor');
        const bgColor = localStorage.getItem('backgroundColor');
        const bgImage = localStorage.getItem('backgroundImageUrl');

        if (bgColor) {
            document.documentElement.style.setProperty('--app-bg-color', bgColor);
        }
        if (bgImage) {
            document.documentElement.style.setProperty('--app-bg-image', `url(http://localhost:8080/${bgImage})`);
        }
        if (navbarColor) {
            document.documentElement.style.setProperty('--navbar-bg-dynamic', navbarColor);
        }
        if (sidebarColor) {
            document.documentElement.style.setProperty('--sidebar-bg-dynamic', sidebarColor);
        }
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }

    const handleLogout = (e) => {
        if (e) e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        handleSuccess('Logged out successfully');
        setTimeout(() => {
            navigate('/login');
        }, 1000)
    }

    return (
        <div className={`home-page ${isSidebarOpen ? 'is-sidebar-open' : ''}`}>
            <BackgroundBubbles />
            <FloatingStickers />
            <nav className={`home-navbar fixed-navbar ${isSidebarOpen ? 'navbar-reduced' : ''}`}
                style={{
                    background: 'var(--navbar-bg-dynamic, var(--navbar-bg))'
                }}
            >
                <div className="navbar-content">
                    <div className="navbar-brand">
                        <h1 className="brand-logo">
                            <Link to="/home">BudgetWise</Link>
                        </h1>
                        <span className="brand-tagline">AI Driven Expense Tracker</span>
                    </div>
                    <div className="navbar-actions">
                        <button className="dashboard-btn" onClick={toggleSidebar}>
                            <FaBars className="btn-icon" />
                        </button>
                        <Sidebar
                            isOpen={isSidebarOpen}
                            onClose={() => setIsSidebarOpen(false)}
                            handleLogout={handleLogout}
                        />
                    </div>
                </div>
            </nav>

            {/* Render the specific page content here */}
            <Outlet />

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
                theme="dark"
            />
        </div >
    );
};

export default Layout;
