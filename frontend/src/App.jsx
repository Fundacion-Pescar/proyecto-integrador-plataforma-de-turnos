import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import TurnosPage from './pages/TurnosPage';
import ServiciosPage from './pages/ServiciosPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route
            path="/turnos"
            element={
              <ProtectedRoute>
                <TurnosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicios"
            element={
              <ProtectedRoute>
                <ServiciosPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
