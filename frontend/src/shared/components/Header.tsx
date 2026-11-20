import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { apiClient } from '../api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './Header.css';

interface Notificacion {
  id: string;
  mensaje: string;
  leido: boolean;
  fechaCreacion: string;
  solicitudId: string | null;
}

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const { data: notifications = [] } = useQuery<Notificacion[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiClient.get('/notificaciones?soloNoLeidas=true');
      return res.data;
    },
    refetchInterval: 30000,
    enabled: !!user,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/notificaciones/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/notificaciones/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleNotificationClick = async (notif: Notificacion) => {
    setDropdownOpen(false);
    try {
      await markReadMutation.mutateAsync(notif.id);
    } catch {
      // Navigate even if mark-as-read transiently fails.
    }
    if (notif.solicitudId) {
      navigate(`/solicitudes/${notif.solicitudId}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="header-container">
      <div className="logo-section">
        <h2>Solicitudes SDD</h2>
      </div>

      <nav className="nav-links" aria-label="Navegación principal">
        {user.rol === 'Empleado' && (
          <>
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' || location.pathname.startsWith('/editar') ? 'active' : ''}`}
            >
              Mis Solicitudes
            </Link>
            <Link
              to="/nueva"
              className={`nav-link ${location.pathname === '/nueva' ? 'active' : ''}`}
            >
              Nueva Solicitud
            </Link>
          </>
        )}

        {user.rol === 'Supervisor' && (
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' || location.pathname.startsWith('/solicitudes') ? 'active' : ''}`}
          >
            Panel de Supervisor
          </Link>
        )}

        {user.rol === 'Administrador' && (
          <>
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Ver Solicitudes
            </Link>
            <Link
              to="/admin/tipos-solicitud"
              className={`nav-link ${location.pathname.startsWith('/admin/tipos-solicitud') ? 'active' : ''}`}
            >
              Tipos de Solicitud
            </Link>
            <Link
              to="/admin/usuarios"
              className={`nav-link ${location.pathname.startsWith('/admin/usuarios') ? 'active' : ''}`}
            >
              Usuarios y Reasignaciones
            </Link>
          </>
        )}
      </nav>

      <div className="user-controls">
        <span className="user-badge">
          {user.nombre} ({user.rol})
        </span>

        {user.rol !== 'Administrador' && (
          <div className="notification-bell-container" ref={dropdownRef}>
            <button
              type="button"
              className="bell-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label={`Notificaciones (${notifications.length} sin leer)`}
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
            >
              🔔
              {notifications.length > 0 && (
                <span className="bell-badge" aria-hidden="true">{notifications.length}</span>
              )}
            </button>

            {dropdownOpen && (
              <div className="notifications-dropdown" role="menu" aria-label="Lista de notificaciones">
                <div className="notifications-header">
                  <h4>Notificaciones ({notifications.length})</h4>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      className="clear-all-btn"
                      onClick={() => markAllReadMutation.mutate()}
                    >
                      Marcar todo leído
                    </button>
                  )}
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="empty-notifications">No tienes notificaciones pendientes</div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        type="button"
                        key={notif.id}
                        role="menuitem"
                        className="notification-item unread"
                        onClick={() => handleNotificationClick(notif)}
                        style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      >
                        <div>{notif.mensaje}</div>
                        <span className="notification-time">
                          {new Date(notif.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <button type="button" className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};
