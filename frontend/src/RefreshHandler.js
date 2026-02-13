import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function RefreshHandler({ setIsAuthenticated }) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const isAuthenticated = !!token;

        setIsAuthenticated(isAuthenticated);

        if (isAuthenticated) {
            if (location.pathname === '/' ||
                location.pathname === '/login' ||
                location.pathname === '/signup'
            ) {
                navigate('/home', { replace: false });
            }
        } else {
            // If not authenticated and trying to access protected routes
            if (location.pathname === '/home') {
                navigate('/login', { replace: false });
            }
        }
    }, [location, navigate, setIsAuthenticated])

    return null
}

export default RefreshHandler
