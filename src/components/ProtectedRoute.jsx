import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requiredPermission = null,
  requiredAction = null 
}) => {
  const { user, hasRole, hasPermission } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (requiredPermission && requiredAction && !hasPermission(requiredPermission, requiredAction)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}; 