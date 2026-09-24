import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Navbar({ variante = 'publica' }) {
  const { isAuthenticated, admin, logout } = useAuth();

  return (
    <header className="encabezado">
      <div className="contenedor header-contenido">
        <Link to="/" className="logo">
          Odonto<span>Turno</span>
        </Link>

        {variante === 'admin' ? (
          <nav className="navegacion" aria-label="Administración">
            <span className="nav-user">{admin?.nombre || 'Admin'}</span>
            <Link to="/">Sitio público</Link>
            <button type="button" className="nav-btn" onClick={logout}>
              Cerrar sesión
            </button>
          </nav>
        ) : (
          <nav className="navegacion" aria-label="Principal">
            <a href="/#servicios">Servicios</a>
            <a href="/#reserva">Reservar</a>
            {isAuthenticated ? (
              <NavLink to="/admin">Panel admin</NavLink>
            ) : (
              <NavLink to="/login">Acceso admin</NavLink>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
