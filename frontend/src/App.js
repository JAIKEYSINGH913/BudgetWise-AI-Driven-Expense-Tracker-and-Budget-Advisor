import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useState, lazy, Suspense } from 'react';
import RefreshHandler from './RefreshHandler';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import VerificationLock from './components/VerificationLock';
import Layout from './components/Layout';
import { SoundProvider } from './context/SoundContext';

// Lazy Load Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Categories = lazy(() => import('./pages/Categories'));
const Reports = lazy(() => import('./pages/Reports'));
const Profile = lazy(() => import('./pages/Profile'));

// Loading Fallback Component
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
    <div className="loading-spinner"></div>
    <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Loading BudgetWise...</p>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />
  }

  return (
    <SoundProvider>
      <ThemeProvider>
        <div className="App">
          <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
          <ThemeToggle /> {/* Global Floating Toggle */}
          <VerificationLock>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path='/' element={<LandingPage />} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />

                {/* Protected Routes Wrapped in Layout */}
                <Route element={<PrivateRoute element={<Layout />} />}>
                  <Route path='/home' element={<Home />} />
                  <Route path='/dashboard/*' element={<Dashboard />} />
                  <Route path='/expenses/*' element={<Expenses />} />
                  <Route path='/categories/*' element={<Categories />} />
                  <Route path='/reports/*' element={<Reports />} />
                  <Route path='/profile' element={<Profile />} />
                </Route>
              </Routes>
            </Suspense>
          </VerificationLock>
        </div>
      </ThemeProvider>
    </SoundProvider>
  );
}

export default App;
