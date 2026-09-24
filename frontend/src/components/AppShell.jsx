import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function AppShell({ children, titulo, subtitulo, acciones }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  function cerrarSesion() {
    setMenuAbierto(false);
    logout();
    navigate('/', { replace: true });
  }

  useEffect(() => {
    function handleClickOutside(evento) {
      if (menuRef.current && !menuRef.current.contains(evento.target)) {
        setMenuAbierto(false);
      }
    }

    function handleEscape(evento) {
      if (evento.key === 'Escape') setMenuAbierto(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const nombreUsuario = admin?.nombre || admin?.email || 'Usuario';

  return (
    <div className="admin-layout">
      <header className="encabezado">
        <div className="contenedor header-contenido">
          <div className="logo">
            Odonto<span>Turno</span>
          </div>
          <nav className="navegacion" aria-label="Backoffice">
            <NavLink to="/turnos">Turnos</NavLink>
            <NavLink to="/servicios">Servicios</NavLink>

            <div className="user-menu" ref={menuRef}>
              <button
                type="button"
                className="user-menu-trigger"
                aria-haspopup="menu"
                aria-expanded={menuAbierto}
                onClick={() => setMenuAbierto((v) => !v)}
              >
                <span className="user-menu-name">{nombreUsuario}</span>
                <span className={`user-menu-caret ${menuAbierto ? 'abierto' : ''}`} aria-hidden="true">
                  ▾
                </span>
              </button>

              {menuAbierto && (
                <div className="user-menu-dropdown" role="menu">
                  <div className="user-menu-meta">{admin?.email}</div>
                  <button
                    type="button"
                    className="user-menu-item"
                    role="menuitem"
                    onClick={cerrarSesion}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="admin-main">
        <div className="contenedor admin-panel">
          <header className="admin-header">
            <div>
              <h1>{titulo}</h1>
              {subtitulo && <p>{subtitulo}</p>}
            </div>
            {acciones}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
