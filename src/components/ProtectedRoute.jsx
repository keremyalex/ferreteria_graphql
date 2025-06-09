import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requiredPermission = null,
  requiredAction = null 
}) => {
  const { user, hasRole, hasPermission, loading } = useAuth();

  // Si está cargando, mostramos un spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigimos al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificamos los roles requeridos
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  // Verificamos los permisos requeridos
  if (requiredPermission && requiredAction && !hasPermission(requiredPermission, requiredAction)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}; 