import { useEffect, useState } from 'react';
import { personasApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import type { Persona, CreatePersonaRequest } from '../types';

export default function UsuariosPage() {
  const { hasPermission } = useAuth();
  const { addToast, ToastContainer } = useToast();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreatePersonaRequest>({ firstName: '', lastName: '', dni: '', email: '', phone: '', nationality: 'Ecuatoriano' });

  useEffect(() => { loadPersonas(); }, []);

  const loadPersonas = async () => {
    try {
      const data = await personasApi.getAll();
      setPersonas(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await personasApi.create(form);
      addToast(`Persona creada. Usuario: ${res.user.username}`, 'success');
      setShowModal(false);
      setForm({ firstName: '', lastName: '', dni: '', email: '', phone: '', nationality: 'Ecuatoriano' });
      loadPersonas();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  const handleToggleActive = async (persona: Persona) => {
    try {
      if (persona.activo) {
        await personasApi.deactivate(persona.id);
        addToast('Persona desactivada', 'success');
      } else {
        await personasApi.activate(persona.id);
        addToast('Persona activada', 'success');
      }
      loadPersonas();
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
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">Gestión de personas y cuentas</p>
        </div>
        {hasPermission('USUARIOS_CREATE') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nueva Persona</button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Personas Registradas ({personas.length})</span>
        </div>
        {personas.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay personas registradas.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Usuario</th>
                  <th>Estado</th>
                  {hasPermission('USUARIOS_UPDATE') && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {personas.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.first_name} {p.last_name}</td>
                    <td>{p.dni}</td>
                    <td>{p.email}</td>
                    <td>{p.phone}</td>
                    <td><span className="badge badge-info">{p.user?.username || '—'}</span></td>
                    <td>
                      <span className={`badge ${p.activo ? 'badge-success' : 'badge-danger'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {hasPermission('USUARIOS_UPDATE') && (
                      <td>
                        <button
                          className={`btn btn-sm ${p.activo ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleActive(p)}
                        >
                          {p.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Registrar Persona</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Apellido</label>
                  <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Cédula (DNI)</label>
                <input value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} maxLength={10} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Nacionalidad</label>
                  <input value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
