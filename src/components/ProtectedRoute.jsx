import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireRole }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                color: 'var(--color-light)'
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (requireRole && user.role !== requireRole) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'customer') {
            return <Navigate to="/scan" replace />;
        } else if (user.role === 'agent') {
            return <Navigate to="/agent/dashboard" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
