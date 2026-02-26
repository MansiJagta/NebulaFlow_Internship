import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, role } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    // If role is not set yet, keep the user on auth-connected flows
    if (!role) return <Navigate to="/repository-selection" replace />;
    if (requiredRole && role !== requiredRole) {
        return <Navigate to={role === 'pm' ? '/pm/dashboard' : '/collaborator/dashboard'} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
