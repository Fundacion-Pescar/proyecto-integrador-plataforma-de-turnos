import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="auth-loading">
        <p>Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
