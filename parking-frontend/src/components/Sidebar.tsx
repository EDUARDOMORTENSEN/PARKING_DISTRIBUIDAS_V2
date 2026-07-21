import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊', perm: null },
  { path: '/zonas', label: 'Zonas & Espacios', icon: '🅿️', perm: 'ZONAS_READ' },
  { path: '/tickets', label: 'Tickets', icon: '🎫', perm: 'TICKETS_READ' },
  { path: '/vehiculos', label: 'Vehículos', icon: '🚗', perm: 'VEHICULOS_READ' },
  { path: '/usuarios', label: 'Usuarios', icon: '👥', perm: 'USUARIOS_READ' },
];

export default function Sidebar() {
  const { user, hasPermission, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(item => !item.perm || hasPermission(item.perm));

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {!collapsed && <span className="logo-text">ParkingDS</span>}
            {collapsed && <span className="logo-icon">🅿️</span>}
          </div>
          <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Collapse sidebar">
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {visibleItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={item.label}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="sidebar-user">
              <div className="sidebar-avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
              <div className="sidebar-user-info">
                <span className="sidebar-username">{user?.username}</span>
                <span className="sidebar-role">{user?.roles?.[0]}</span>
              </div>
            </div>
          )}
          <button className="sidebar-link logout-btn" onClick={logout} title="Cerrar sesión">
            <span className="sidebar-icon">🚪</span>
            {!collapsed && <span className="sidebar-label">Salir</span>}
          </button>
        </div>
      </aside>

      <style>{`
        .sidebar-mobile-toggle {
          display: none;
          position: fixed;
          top: 14px;
          left: 14px;
          z-index: 1100;
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          font-size: 1.2rem;
          align-items: center;
          justify-content: center;
        }
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 998;
        }
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sidebar-width);
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 999;
          transition: width var(--transition);
          overflow: hidden;
        }
        .sidebar.collapsed { width: var(--sidebar-collapsed); }
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          min-height: 64px;
        }
        .sidebar-logo { display: flex; align-items: center; gap: 0.5rem; }
        .logo-text {
          font-size: 1.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--accent), var(--info));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          white-space: nowrap;
        }
        .logo-icon { font-size: 1.4rem; }
        .sidebar-collapse-btn {
          background: transparent;
          color: var(--text-muted);
          font-size: 0.7rem;
          padding: 0.25rem;
        }
        .sidebar-collapse-btn:hover { color: var(--text-primary); }
        .sidebar-nav {
          flex: 1;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          overflow-y: auto;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.75rem;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all var(--transition);
          white-space: nowrap;
        }
        .sidebar-link:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          text-decoration: none;
        }
        .sidebar-link.active {
          background: rgba(59, 130, 246, 0.15);
          color: var(--accent);
        }
        .sidebar-icon { font-size: 1.15rem; flex-shrink: 0; }
        .sidebar-footer {
          padding: 0.75rem;
          border-top: 1px solid var(--border);
        }
        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 0.5rem;
          padding: 0.5rem 0.75rem;
        }
        .sidebar-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--info));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          color: white;
          flex-shrink: 0;
        }
        .sidebar-user-info { display: flex; flex-direction: column; overflow: hidden; }
        .sidebar-username { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
        .sidebar-role { font-size: 0.7rem; color: var(--text-muted); }
        .logout-btn { color: var(--danger) !important; }
        .logout-btn:hover { background: var(--danger-bg) !important; }

        @media (max-width: 768px) {
          .sidebar-mobile-toggle { display: flex; }
          .sidebar-overlay { display: block; }
          .sidebar {
            transform: translateX(-100%);
            transition: transform var(--transition);
          }
          .sidebar.mobile-open { transform: translateX(0); }
          .sidebar-collapse-btn { display: none; }
        }
      `}</style>
    </>
  );
}
