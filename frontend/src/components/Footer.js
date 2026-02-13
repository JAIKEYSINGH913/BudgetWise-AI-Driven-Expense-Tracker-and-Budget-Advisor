import React from 'react';
import './Footer.css';
import { FaHeart } from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <div className="footer-content">
                <p>
                    &copy; {currentYear} BudgetWise. All rights reserved.
                </p>
                <p>
                    Designed & Developed with <FaHeart style={{ color: '#ef5350', verticalAlign: 'middle', margin: '0 2px' }} /> by <span className="footer-highlight">Jaikey Singh</span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
