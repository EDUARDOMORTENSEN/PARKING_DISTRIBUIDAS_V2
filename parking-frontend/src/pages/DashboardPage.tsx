import { useEffect, useState } from 'react';
import { zonasApi, espaciosApi } from '../api';
import { useAuth } from '../context/AuthContext';
import type { Zona, Espacio } from '../types';

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (hasPermission('ZONAS_READ')) {
          const [z, e] = await Promise.all([zonasApi.getAll(), espaciosApi.getAll()]);
          setZonas(z);
          setEspacios(e);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  const disponibles = espacios.filter(e => e.estado === 'DISPONIBLE').length;
  const ocupados = espacios.filter(e => e.estado === 'OCUPADO').length;
  const totalZonas = zonas.filter(z => z.estado === 1).length;

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Bienvenido, {user?.username} 👋</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon blue">🅿️</div>
          <div>
            <div className="stat-value">{totalZonas}</div>
            <div className="stat-label">Zonas Activas</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon green">✅</div>
          <div>
            <div className="stat-value">{disponibles}</div>
            <div className="stat-label">Espacios Disponibles</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon red">🚗</div>
          <div>
            <div className="stat-value">{ocupados}</div>
            <div className="stat-label">Espacios Ocupados</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon yellow">📊</div>
          <div>
            <div className="stat-value">{espacios.length}</div>
            <div className="stat-label">Total Espacios</div>
          </div>
        </div>
      </div>

      {hasPermission('ZONAS_READ') && zonas.length > 0 && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="card-header">
            <span className="card-title">Resumen por Zonas</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Zona</th>
                  <th>Tipo</th>
                  <th>Capacidad</th>
                  <th>Disponibles</th>
                  <th>Ocupados</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {zonas.map(z => {
                  const espZona = espacios.filter(e => e.idZona === z.id);
                  const disp = espZona.filter(e => e.estado === 'DISPONIBLE').length;
                  const ocup = espZona.filter(e => e.estado === 'OCUPADO').length;
                  return (
                    <tr key={z.id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{z.nombre}</td>
                      <td><span className="badge badge-info">{z.tipo}</span></td>
                      <td>{z.capacidad}</td>
                      <td style={{ color: 'var(--success)' }}>{disp}</td>
                      <td style={{ color: 'var(--danger)' }}>{ocup}</td>
                      <td>
                        <span className={`badge ${z.estado === 1 ? 'badge-success' : 'badge-danger'}`}>
                          {z.estado === 1 ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card-header">
          <span className="card-title">Tus Permisos</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {user?.permissions.map(p => (
            <span key={p} className="badge badge-info">{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
