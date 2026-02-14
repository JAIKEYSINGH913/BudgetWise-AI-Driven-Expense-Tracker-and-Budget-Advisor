import React, { useState } from 'react';
import { FaTimes, FaHome, FaChartPie, FaSignOutAlt, FaWallet, FaTags, FaFileAlt, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { useSound } from '../context/SoundContext';

const Sidebar = ({ isOpen, onClose, handleLogout }) => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState(null);
    const { playClick, playHover } = useSound();

    const menuItems = [
        {
            title: 'Home',
            icon: <FaHome />,
            path: '/home',
            subsections: []
        },
        {
            title: 'Dashboard',
            icon: <FaChartPie />,
            path: '/dashboard',
            subsections: [
                { title: 'Income', path: '/dashboard/income' },
                { title: 'Financial Goals', path: '/dashboard/goals' },
                { title: 'Profile Overview', path: '/dashboard/profile' }
            ]
        },
        {
            title: 'Expenses',
            icon: <FaWallet />,
            path: '/expenses',
            subsections: [
                { title: 'Add Expense', path: '/expenses/add' },
                { title: 'Edit Expense', path: '/expenses/edit' },
                { title: 'Delete Expense', path: '/expenses/delete' }
            ]
        },
        {
            title: 'Categories',
            icon: <FaTags />,
            path: '/categories',
            subsections: [
                { title: 'Food', path: '/categories/food' },
                { title: 'Rent', path: '/categories/rent' },
                { title: 'Travel', path: '/categories/travel' },
                { title: 'Shopping', path: '/categories/shopping' },
                { title: 'Utilities', path: '/categories/utilities' }
            ]
        },
        {
            title: 'Reports',
            icon: <FaFileAlt />,
            path: '/reports',
            subsections: [
                { title: 'Monthly View', path: '/reports/monthly' },
                { title: 'Yearly View', path: '/reports/yearly' }
            ]
        }
    ];

    const handleNavigation = (path) => {
        playClick();
        navigate(path);
        onClose();
    };

    const onLogout = (e) => {
        playClick();
        handleLogout(e);
        onClose();
    }

    return (
        <>
            <div className={`sidebar-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`sidebar-panel ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <h2 className="menu-title">BudgetWise</h2>
                    </div>
                    <button className="close-btn" onClick={() => { playClick(); onClose(); }} onMouseEnter={playHover}>
                        <FaTimes />
                    </button>
                </div>

                <div className="sidebar-content">
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            className="menu-group"
                            onMouseEnter={() => {
                                if (item.subsections && item.subsections.length > 0) setActiveSection(index);
                                playHover();
                            }}
                            onMouseLeave={() => setActiveSection(null)}
                        >
                            <div className="menu-item main-item" onClick={() => handleNavigation(item.path)}>
                                <span className="item-icon">{item.icon}</span>
                                <span className="item-text">{item.title}</span>
                            </div>

                            {/* Parallel Dropdown (Flyout) - Only render if subsections exist */}
                            {item.subsections && item.subsections.length > 0 && (
                                <div className={`flyout-menu ${activeSection === index ? 'visible' : ''}`}>
                                    <div className="flyout-header">{item.title}</div>
                                    {item.subsections.map((sub, subIndex) => (
                                        <div
                                            key={subIndex}
                                            className="flyout-item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleNavigation(sub.path);
                                            }}
                                            onMouseEnter={playHover}
                                        >
                                            {sub.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <div className="footer-divider"></div>
                    <button className="menu-item logout-item" onClick={onLogout} onMouseEnter={playHover}>
                        <span className="item-icon"><FaSignOutAlt /></span>
                        <span className="item-text">Logout</span>
                    </button>
                    <div className="user-profile-preview" onClick={() => handleNavigation('/profile')} onMouseEnter={playHover} style={{ cursor: 'pointer' }}>
                        {localStorage.getItem('loggedInUserImage') ? (
                            <img
                                src={`http://localhost:8080/${localStorage.getItem('loggedInUserImage')}`}
                                alt="Profile"
                                style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }}
                            />
                        ) : (
                            <FaUserCircle className="profile-icon" />
                        )}
                        <span className="profile-text">My Profile</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
