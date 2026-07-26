import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import Login from './pages/Login';
import Register from './pages/Register';
import InvestorDashboard from './pages/InvestorDashboard';
import PlatformInfo from './pages/PlatformInfo';
import AdminDashboard from './pages/AdminDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import StartupApplication from './pages/StartupApplication';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0f19',
          color: '#f1f5f9',
          fontFamily: '"Plus Jakarta Sans", "Outfit", sans-serif',
          padding: 24,
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Session Initialization Error</h2>
          <p style={{ color: '#94a3b8', maxWidth: 450, marginBottom: 24, fontSize: 14 }}>
            {this.state.error?.message || 'An error occurred while loading your dashboard session.'}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            style={{
              padding: '12px 28px',
              backgroundColor: '#00d09c',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 15
            }}
          >
            Re-login to Elevate
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route wrapper for role authentication
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr || userStr === 'undefined' || userStr === 'null') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  let user = null;
  try {
    user = JSON.parse(userStr);
  } catch (e) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  if (!user || typeof user !== 'object') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'company') return <Navigate to="/company" replace />;
    return <Navigate to="/investor" replace />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
}

function App() {
  const [themeMode, setThemeMode] = useState(
    localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    const handleThemeChange = () => {
      setThemeMode(localStorage.getItem('theme') || 'light');
    };
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  useEffect(() => {
    // Dynamic body styling to match selected theme
    document.body.style.backgroundColor = themeMode === 'dark' ? '#0b0f19' : '#f4f6f9';
    document.body.style.color = themeMode === 'dark' ? '#f1f5f9' : '#44475b';
    if (themeMode === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [themeMode]);

  const isDark = themeMode === 'dark';

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#00d09c', // Groww's Mint Green
          colorSuccess: '#00d09c',
          colorWarning: '#ffb300',
          colorError: '#eb5757',
          colorTextBase: isDark ? '#f1f5f9' : '#44475b',
          colorBgBase: isDark ? '#0b0f19' : '#f4f6f9',
          colorBgContainer: isDark ? '#111827' : '#ffffff',
          colorBorder: isDark ? '#1f2937' : '#d1d5db',
          borderRadius: 12,
          fontFamily: '"Plus Jakarta Sans", "Outfit", -apple-system, BlinkMacSystemFont, sans-serif'
        },
        components: {
          Button: {
            colorPrimary: '#00d09c',
            colorPrimaryHover: '#00b88e',
            controlHeight: 40,
            borderRadius: 8,
            fontWeight: 600,
            colorBgContainer: isDark ? '#1f2937' : '#ffffff',
            colorBorder: isDark ? '#374151' : '#d1d5db'
          },
          Input: {
            controlHeight: 40,
            borderRadius: 8,
            colorBgContainer: isDark ? '#1f2937' : '#ffffff',
            colorBorder: isDark ? '#374151' : '#d1d5db',
            colorText: isDark ? '#f1f5f9' : '#44475b'
          },
          Card: {
            colorBgContainer: isDark ? '#111827' : '#ffffff',
            colorBorderSecondary: isDark ? '#1f2937' : '#edf2f7',
            paddingLG: 20
          },
          Table: {
            colorBgContainer: isDark ? '#111827' : '#ffffff',
            colorHeaderBg: isDark ? '#1f2937' : '#f8fafc',
            colorHeaderColor: isDark ? '#9ca3af' : '#7c8099',
            colorRowHover: isDark ? '#1f2937' : '#f8fafc'
          },
          Tabs: {
            colorPrimary: '#00d09c',
            colorText: isDark ? '#9ca3af' : '#7c8099',
            horizontalItemPadding: '12px 16px'
          }
        }
      }}
    >

      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/investor" 
            element={
              <ProtectedRoute allowedRole="investor">
                <InvestorDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/investor/info/:topicId" 
            element={
              <ProtectedRoute allowedRole="investor">
                <PlatformInfo />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/company" 
            element={
              <ProtectedRoute allowedRole="company">
                <CompanyDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/company/apply" 
            element={
              <ProtectedRoute allowedRole="company">
                <StartupApplication />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
