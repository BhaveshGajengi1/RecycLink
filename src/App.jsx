import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Component } from 'react';
import { AuthProvider } from './contexts/AuthContext';

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          color: 'white',
          padding: '50px',
          fontSize: '18px',
          background: '#0f172a',
          minHeight: '100vh'
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '20px' }}>⚠️ Error Found!</h1>
          <p style={{ marginBottom: '10px' }}>The application encountered an error:</p>
          <pre style={{
            background: '#1e293b',
            padding: '20px',
            borderRadius: '8px',
            overflow: 'auto',
            color: '#10b981'
          }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// Import components
import AnimatedBackground from './components/AnimatedBackground';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Customer pages
import WasteClassification from './pages/WasteClassification';
import ChatAssistant from './pages/ChatAssistant';
import SchedulePickup from './pages/SchedulePickup';
import ImpactDashboard from './pages/ImpactDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerHome from './pages/CustomerHome';

// Agent pages (will be created)
import AgentDashboard from './pages/AgentDashboard';
import VerifyPickup from './pages/VerifyPickup';
import AgentEarnings from './pages/AgentEarnings';
import AgentPerformance from './pages/AgentPerformance';

// Shared/Legacy
import CollectorVerification from './pages/CollectorVerification';

function AppRoutes() {
  const location = useLocation();

  return (
    <div className="app">
      <AnimatedBackground />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Customer Routes */}
          <Route
            path="/scan"
            element={
              <ProtectedRoute requireRole="customer">
                <WasteClassification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classify"
            element={<Navigate to="/scan" replace />}
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute requireRole="customer">
                <ChatAssistant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute requireRole="customer">
                <SchedulePickup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireRole="customer">
                <ImpactDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rewards"
            element={
              <ProtectedRoute requireRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute requireRole="customer">
                <CustomerHome />
              </ProtectedRoute>
            }
          />

          {/* Agent Routes */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute requireRole="agent">
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/verify"
            element={
              <ProtectedRoute requireRole="agent">
                <VerifyPickup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/earnings"
            element={
              <ProtectedRoute requireRole="agent">
                <AgentEarnings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/performance"
            element={
              <ProtectedRoute requireRole="agent">
                <AgentPerformance />
              </ProtectedRoute>
            }
          />

          {/* Legacy/Shared Routes */}
          <Route
            path="/verify"
            element={
              <ProtectedRoute>
                <CollectorVerification />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

