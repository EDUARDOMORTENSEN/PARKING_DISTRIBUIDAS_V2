import { useState } from 'react';
import { ticketsApi, espaciosApi, zonasApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import type { Ticket, Espacio, Zona } from '../types';
import { useEffect } from 'react';

export default function TicketsPage() {
  const { hasPermission, user } = useAuth();
  const { addToast, ToastContainer } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedEspacio, setSelectedEspacio] = useState('');
  const [placa, setPlaca] = useState('');
  const [idUsuario, setIdUsuario] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchedTicket, setSearchedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (hasPermission('ZONAS_READ')) {
          const [e, z] = await Promise.all([espaciosApi.getAll(), zonasApi.getAll()]);
          setEspacios(e);
          setZonas(z);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  const espaciosDisponibles = espacios.filter(e => e.estado === 'DISPONIBLE');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ticket = await ticketsApi.create({
        id_espacio: selectedEspacio,
        id_usuario: idUsuario || user!.sub,
        placa,
      });
      setTickets(prev => [ticket, ...prev]);
      addToast(`Ticket ${ticket.codigo_ticket} creado`, 'success');
      setShowCreateModal(false);
      setPlaca('');
      setSelectedEspacio('');
      // Refresh espacios
      const updated = await espaciosApi.getAll();
      setEspacios(updated);
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ticket = await ticketsApi.getById(searchId);
      setSearchedTicket(ticket);
      if (!tickets.find(t => t.id_ticket === ticket.id_ticket)) {
        setTickets(prev => [ticket, ...prev]);
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Ticket no encontrado', 'error');
    }
  };

  const handleSalida = async (id: string) => {
    try {
      const updated = await ticketsApi.registrarSalida(id);
      setTickets(prev => prev.map(t => t.id_ticket === id ? updated : t));
      addToast(`Salida registrada. Valor: $${updated.valor_recaudado}`, 'success');
      const esp = await espaciosApi.getAll();
      setEspacios(esp);
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  const handleAnular = async (id: string) => {
    try {
      const updated = await ticketsApi.anular(id, 'Anulación manual');
      setTickets(prev => prev.map(t => t.id_ticket === id ? updated : t));
      addToast('Ticket anulado', 'success');
      const esp = await espaciosApi.getAll();
      setEspacios(esp);
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  const estadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo': return 'badge-success';
      case 'pagado': return 'badge-info';
      case 'anulado': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div>
          <h1 className="page-title">Tickets</h1>
          <p className="page-subtitle">Gestión de tickets de estacionamiento</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost" onClick={() => setShowSearchModal(true)}>🔍 Buscar</button>
          {hasPermission('TICKETS_CREATE') && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ Nuevo Ticket</button>
          )}
        </div>
      </div>

      {/* Tickets table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Tickets Recientes ({tickets.length})</span>
        </div>
        {tickets.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            No hay tickets cargados. Crea uno nuevo o busca por ID.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Placa</th>
                  <th>Ingreso</th>
                  <th>Salida</th>
                  <th>Estado</th>
                  <th>Valor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id_ticket}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{t.codigo_ticket}</td>
                    <td><span className="badge badge-neutral">{t.placa}</span></td>
                    <td>{new Date(t.fecha_hora_ingreso).toLocaleString('es-EC')}</td>
                    <td>{t.fecha_hora_salida ? new Date(t.fecha_hora_salida).toLocaleString('es-EC') : '—'}</td>
                    <td><span className={`badge ${estadoBadge(t.estado_ticket)}`}>{t.estado_ticket.toUpperCase()}</span></td>
                    <td>{t.valor_recaudado != null ? `$${t.valor_recaudado}` : '—'}</td>
                    <td>
                      {t.estado_ticket === 'activo' && (
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          {hasPermission('TICKETS_UPDATE') && (
                            <>
                              <button className="btn btn-sm btn-success" onClick={() => handleSalida(t.id_ticket)}>Salida</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleAnular(t.id_ticket)}>Anular</button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Crear Ticket</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Espacio Disponible</label>
                <select value={selectedEspacio} onChange={e => setSelectedEspacio(e.target.value)} required>
                  <option value="">Seleccionar espacio...</option>
                  {espaciosDisponibles.map(e => (
                    <option key={e.id} value={e.id}>{e.codigo} — {e.nombreZona} ({e.tipo})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Placa del Vehículo</label>
                <input value={placa} onChange={e => setPlaca(e.target.value.toUpperCase())} placeholder="ABC-1234" required />
              </div>
              <div className="form-group">
                <label className="form-label">ID Usuario (opcional, default: tú)</label>
                <input value={idUsuario} onChange={e => setIdUsuario(e.target.value)} placeholder={user?.sub} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="modal-overlay" onClick={() => { setShowSearchModal(false); setSearchedTicket(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Buscar Ticket</h2>
            <form onSubmit={handleSearch}>
              <div className="form-group">
                <label className="form-label">ID del Ticket (UUID)</label>
                <input value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="UUID del ticket" required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowSearchModal(false); setSearchedTicket(null); }}>Cerrar</button>
                <button type="submit" className="btn btn-primary">Buscar</button>
              </div>
            </form>
            {searchedTicket && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                <p><strong>Código:</strong> {searchedTicket.codigo_ticket}</p>
                <p><strong>Placa:</strong> {searchedTicket.placa}</p>
                <p><strong>Estado:</strong> <span className={`badge ${estadoBadge(searchedTicket.estado_ticket)}`}>{searchedTicket.estado_ticket}</span></p>
                <p><strong>Ingreso:</strong> {new Date(searchedTicket.fecha_hora_ingreso).toLocaleString('es-EC')}</p>
                {searchedTicket.valor_recaudado != null && <p><strong>Valor:</strong> ${searchedTicket.valor_recaudado}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
