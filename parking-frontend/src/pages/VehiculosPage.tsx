import { useEffect, useState } from 'react';
import { vehiculosApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import type { Vehiculo, CreateVehiculoRequest, TipoVehiculo } from '../types';

const TIPOS: TipoVehiculo[] = ['Auto', 'Motocicleta', 'Camioneta'];
const CLASIFICACIONES = ['Electrico', 'Gasolina', 'Diesel', 'Hibrido'];

export default function VehiculosPage() {
  const { hasPermission } = useAuth();
  const { addToast, ToastContainer } = useToast();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tipo, setTipo] = useState<TipoVehiculo>('Auto');
  const [form, setForm] = useState({ placa: '', marca: '', modelo: '', color: '', anio: 2024, clasificacion: 'Gasolina', numeroPuertas: 4, capacidadMaletero: 400, tipoMoto: 'Deportiva', cabina: 'simple', capacidadCarga: 800 });

  useEffect(() => {
    loadVehiculos();
  }, []);

  const loadVehiculos = async () => {
    try {
      const data = await vehiculosApi.getAll();
      setVehiculos(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: CreateVehiculoRequest = {
        tipo,
        datos: {
          placa: form.placa,
          marca: form.marca,
          modelo: form.modelo,
          color: form.color,
          anio: form.anio,
          clasificacion: form.clasificacion,
          ...(tipo === 'Auto' ? { numeroPuertas: form.numeroPuertas, capacidadMaletero: form.capacidadMaletero } : {}),
          ...(tipo === 'Motocicleta' ? { tipoMoto: form.tipoMoto } : {}),
          ...(tipo === 'Camioneta' ? { cabina: form.cabina, capacidadCarga: form.capacidadCarga } : {}),
        },
      };
      await vehiculosApi.create(payload);
      addToast('Vehículo creado exitosamente', 'success');
      setShowModal(false);
      loadVehiculos();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await vehiculosApi.delete(id);
      addToast('Vehículo eliminado', 'success');
      loadVehiculos();
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
          <h1 className="page-title">Vehículos</h1>
          <p className="page-subtitle">Gestión del registro de vehículos</p>
        </div>
        {hasPermission('VEHICULOS_CREATE') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Vehículo</button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Vehículos Registrados ({vehiculos.length})</span>
        </div>
        {vehiculos.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay vehículos registrados.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Color</th>
                  <th>Año</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  {hasPermission('VEHICULOS_DELETE') && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {vehiculos.map(v => (
                  <tr key={v.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v.placa}</td>
                    <td>{v.marca}</td>
                    <td>{v.modelo}</td>
                    <td>{v.color}</td>
                    <td>{v.anio}</td>
                    <td><span className="badge badge-info">{v.tipo}</span></td>
                    <td>
                      <span className={`badge ${v.activo ? 'badge-success' : 'badge-danger'}`}>
                        {v.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {hasPermission('VEHICULOS_DELETE') && (
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(v.id)}>Eliminar</button>
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
            <h2 className="modal-title">Registrar Vehículo</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select value={tipo} onChange={e => setTipo(e.target.value as TipoVehiculo)}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Placa</label>
                <input value={form.placa} onChange={e => setForm({ ...form, placa: e.target.value.toUpperCase() })} placeholder={tipo === 'Motocicleta' ? 'ABC-123D' : 'ABC-1234'} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Marca</label>
                  <input value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Modelo</label>
                  <input value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Año</label>
                  <input type="number" value={form.anio} onChange={e => setForm({ ...form, anio: +e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Clasificación</label>
                <select value={form.clasificacion} onChange={e => setForm({ ...form, clasificacion: e.target.value })}>
                  {CLASIFICACIONES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {tipo === 'Auto' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nro. Puertas</label>
                    <input type="number" min={2} max={5} value={form.numeroPuertas} onChange={e => setForm({ ...form, numeroPuertas: +e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cap. Maletero (kg)</label>
                    <input type="number" min={150} max={800} value={form.capacidadMaletero} onChange={e => setForm({ ...form, capacidadMaletero: +e.target.value })} />
                  </div>
                </div>
              )}
              {tipo === 'Motocicleta' && (
                <div className="form-group">
                  <label className="form-label">Tipo de Moto</label>
                  <select value={form.tipoMoto} onChange={e => setForm({ ...form, tipoMoto: e.target.value })}>
                    <option value="Deportiva">Deportiva</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Motocross">Motocross</option>
                  </select>
                </div>
              )}
              {tipo === 'Camioneta' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Cabina</label>
                    <select value={form.cabina} onChange={e => setForm({ ...form, cabina: e.target.value })}>
                      <option value="simple">Simple</option>
                      <option value="doble">Doble</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cap. Carga (kg)</label>
                    <input type="number" min={450} max={1360} value={form.capacidadCarga} onChange={e => setForm({ ...form, capacidadCarga: +e.target.value })} />
                  </div>
                </div>
              )}
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
