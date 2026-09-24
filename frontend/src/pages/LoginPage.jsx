import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated, cargando } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@odontoturno.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (cargando) {
    return (
      <div className="auth-loading">
        <p>Cargando...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/turnos" replace />;
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setEnviando(true);
    setError(null);

    try {
      await login(email.trim(), password);
      navigate('/turnos', { replace: true });
    } catch (err) {
      setError(err.payload?.message || err.message || 'No se pudo iniciar sesión');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo login-logo">
          Odonto<span>Turno</span>
        </div>
        <h1>Inicio de sesión</h1>
        <p className="login-sub">
          Inicia sesión con tu email y contraseña para acceder a la administración de tu consultorio.
        </p>

        <form className="formulario" onSubmit={handleSubmit}>
          <div className="campo">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="campo">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn btn-primario btn-submit" disabled={enviando}>
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="login-hint">
          Demo: <code>admin@odontoturno.com</code> / <code>admin123</code>
        </p>
      </div>
    </div>
  );
}
