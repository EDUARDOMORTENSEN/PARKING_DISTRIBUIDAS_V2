import { useEffect, useState, useRef, useCallback } from 'react';
import { zonasApi, espaciosApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import type { Zona, Espacio, TipoZona, CreateZonaRequest, CreateEspacioRequest, TipoEspacio } from '../types';

const TIPO_ZONA_OPTIONS: TipoZona[] = ['VIP', 'REGULAR', 'INTERNA', 'EXTERNA', 'PREFERENCIAL'];
const TIPO_ESPACIO_OPTIONS: TipoEspacio[] = ['AUTO', 'MOTO', 'BUSETA'];

export default function ZonasPage() {
  const { hasPermission } = useAuth();
  const { addToast, ToastContainer } = useToast();
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [selectedZona, setSelectedZona] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showZonaModal, setShowZonaModal] = useState(false);
  const [showEspacioModal, setShowEspacioModal] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [z, e] = await Promise.all([zonasApi.getAll(), espaciosApi.getAll()]);
      setZonas(z);
      setEspacios(e);
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error cargando datos', 'error');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // SSE connection for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const es = new EventSource(`/api/v1/tickets/sse/espacios?token=${token}`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id_espacio && data.estado) {
          setEspacios(prev =>
            prev.map(e => e.id === data.id_espacio ? { ...e, estado: data.estado } : e)
          );
          addToast(`Espacio actualizado: ${data.estado}`, 'info');
        }
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      es.close();
      // Reconnect after 5s
      setTimeout(() => {
        if (eventSourceRef.current === es) loadData();
      }, 5000);
    };

    return () => es.close();
  }, []);

  const zonasEspacios = selectedZona
    ? espacios.filter(e => e.idZona === selectedZona)
    : espacios;

  const selectedZonaData = zonas.find(z => z.id === selectedZona);

  // Zona form
  const [zonaForm, setZonaForm] = useState<CreateZonaRequest>({ nombre: '', tipo: 'REGULAR', capacidad: 10 });

  const handleCreateZona = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await zonasApi.create(zonaForm);
      addToast('Zona creada exitosamente', 'success');
      setShowZonaModal(false);
      setZonaForm({ nombre: '', tipo: 'REGULAR', capacidad: 10 });
      loadData();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  // Espacio form
  const [espacioForm, setEspacioForm] = useState<CreateEspacioRequest>({ idZona: '', tipo: 'AUTO' });

  const handleCreateEspacio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await espaciosApi.create({ ...espacioForm, idZona: selectedZona || espacioForm.idZona });
      addToast('Espacio creado exitosamente', 'success');
      setShowEspacioModal(false);
      loadData();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div>
          <h1 className="page-title">Zonas & Espacios</h1>
          <p className="page-subtitle">
            {selectedZona ? `Viendo: ${selectedZonaData?.nombre}` : 'Gestión de zonas de parqueo'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {selectedZona && (
            <button className="btn btn-ghost" onClick={() => setSelectedZona(null)}>← Todas las zonas</button>
          )}
          {hasPermission('ZONAS_CREATE') && (
            <>
              <button className="btn btn-primary" onClick={() => setShowZonaModal(true)}>+ Zona</button>
              {selectedZona && (
                <button className="btn btn-success" onClick={() => setShowEspacioModal(true)}>+ Espacio</button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Zonas Grid */}
      {!selectedZona && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {zonas.map(z => {
            const espZona = espacios.filter(e => e.idZona === z.id);
            const disp = espZona.filter(e => e.estado === 'DISPONIBLE').length;
            const ocup = espZona.filter(e => e.estado === 'OCUPADO').length;
            return (
              <div key={z.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelectedZona(z.id)}>
                <div className="card-header">
                  <span className="card-title">{z.nombre}</span>
                  <span className={`badge ${z.estado === 1 ? 'badge-success' : 'badge-danger'}`}>
                    {z.estado === 1 ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="badge badge-info">{z.tipo}</span>
                  <span className="badge badge-neutral">{z.codigo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Capacidad: {z.capacidad}</span>
                  <span style={{ color: 'var(--success)' }}>✅ {disp}</span>
                  <span style={{ color: 'var(--danger)' }}>🚗 {ocup}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Espacios Grid */}
      {selectedZona && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              Espacios de {selectedZonaData?.nombre} ({zonasEspacios.length})
            </span>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--success)' }}>✅ {zonasEspacios.filter(e => e.estado === 'DISPONIBLE').length} disponibles</span>
              <span style={{ color: 'var(--danger)' }}>🚗 {zonasEspacios.filter(e => e.estado === 'OCUPADO').length} ocupados</span>
            </div>
          </div>
          <div className="espacios-grid">
            {zonasEspacios.map(e => (
              <div key={e.id} className={`espacio-slot ${e.estado.toLowerCase()}`} title={`${e.codigo} - ${e.tipo} - ${e.estado}`}>
                <span className="espacio-code">{e.codigo}</span>
                <span className="espacio-type">{e.tipo}</span>
                <span style={{ fontSize: '0.55rem', marginTop: '0.25rem', opacity: 0.7 }}>{e.estado}</span>
              </div>
            ))}
            {zonasEspacios.length === 0 && (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No hay espacios en esta zona. Crea uno con el botón "+ Espacio".
              </p>
            )}
          </div>
        </div>
      )}

      {/* Create Zona Modal */}
      {showZonaModal && (
        <div className="modal-overlay" onClick={() => setShowZonaModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Crear Zona</h2>
            <form onSubmit={handleCreateZona}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input value={zonaForm.nombre} onChange={e => setZonaForm({ ...zonaForm, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input value={zonaForm.descripcion || ''} onChange={e => setZonaForm({ ...zonaForm, descripcion: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select value={zonaForm.tipo} onChange={e => setZonaForm({ ...zonaForm, tipo: e.target.value as TipoZona })}>
                  {TIPO_ZONA_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Capacidad</label>
                <input type="number" min={1} max={100} value={zonaForm.capacidad} onChange={e => setZonaForm({ ...zonaForm, capacidad: +e.target.value })} required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowZonaModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear Zona</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Espacio Modal */}
      {showEspacioModal && (
        <div className="modal-overlay" onClick={() => setShowEspacioModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Crear Espacio</h2>
            <form onSubmit={handleCreateEspacio}>
              <div className="form-group">
                <label className="form-label">Zona</label>
                <input value={selectedZonaData?.nombre || ''} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select value={espacioForm.tipo} onChange={e => setEspacioForm({ ...espacioForm, tipo: e.target.value as TipoEspacio })}>
                  {TIPO_ESPACIO_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input value={espacioForm.descripcion || ''} onChange={e => setEspacioForm({ ...espacioForm, descripcion: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowEspacioModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear Espacio</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
