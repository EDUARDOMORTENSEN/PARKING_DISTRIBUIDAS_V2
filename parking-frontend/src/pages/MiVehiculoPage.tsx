import { useEffect, useState } from 'react';
import { vehiculosApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import type { Vehiculo, CreateVehiculoRequest, TipoVehiculo, Clasificacion } from '../types';

const TIPOS: TipoVehiculo[] = ['Auto', 'Motocicleta', 'Camioneta'];
const CLASIFICACIONES: Clasificacion[] = ['Electrico', 'Gasolina', 'Diesel', 'Hibrido'];

export default function MiVehiculoPage() {
  const { user, logout } = useAuth();
  const { addToast, ToastContainer } = useToast();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form
  const [tipo, setTipo] = useState<TipoVehiculo>('Auto');
  const [form, setForm] = useState({
    placa: '', marca: '', modelo: '', color: '', anio: new Date().getFullYear(),
    clasificacion: 'Gasolina' as string,
    numeroPuertas: 4, capacidadMaletero: 400,
    tipoMoto: 'Deportiva', cabina: 'simple', capacidadCarga: 800,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => { loadVehiculos(); }, []);

  const loadVehiculos = async () => {
    try {
      // Fetch vehicles owned by current user (persona ID = user.personId)
      const data = await vehiculosApi.getByPropietario(user!.personId);
      setVehiculos(data);
      if (data.length === 0) setShowOnboarding(true);
    } catch {
      // If the propietario endpoint fails (404), show onboarding
      setVehiculos([]);
      setShowOnboarding(true);
    }
    setLoading(false);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const placaRegex = tipo === 'Motocicleta' ? /^[A-Z]{3}-\d{3}[A-Z]$/ : /^[A-Z]{3}-\d{4}$/;
    if (!placaRegex.test(form.placa)) {
      errors.placa = tipo === 'Motocicleta' ? 'Formato: ABC-123D' : 'Formato: ABC-1234';
    }
    if (form.marca.length < 2 || form.marca.length > 30) errors.marca = '2-30 caracteres';
    if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ\s\-]+$/.test(form.marca)) errors.marca = 'Solo letras y espacios';
    if (form.modelo.length < 3 || form.modelo.length > 107) errors.modelo = '3-107 caracteres';
    if (form.color.length < 3 || form.color.length > 64) errors.color = '3-64 caracteres';
    if (form.anio < 1885 || form.anio > new Date().getFullYear()) errors.anio = `Año entre 1885 y ${new Date().getFullYear()}`;
    if (tipo === 'Auto') {
      if (form.numeroPuertas < 2 || form.numeroPuertas > 5) errors.numeroPuertas = 'Entre 2 y 5';
      if (form.capacidadMaletero < 150 || form.capacidadMaletero > 800) errors.capacidadMaletero = 'Entre 150 y 800 kg';
    }
    if (tipo === 'Camioneta') {
      if (form.capacidadCarga < 450 || form.capacidadCarga > 1360) errors.capacidadCarga = 'Entre 450 y 1360 kg';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setCreating(true);
    try {
      const payload: CreateVehiculoRequest = {
        tipo,
        idPropietario: user!.personId,
        datos: {
          placa: form.placa,
          marca: form.marca.trim(),
          modelo: form.modelo.trim(),
          color: form.color.trim(),
          anio: form.anio,
          clasificacion: form.clasificacion,
          ...(tipo === 'Auto' ? { numeroPuertas: form.numeroPuertas, capacidadMaletero: form.capacidadMaletero } : {}),
          ...(tipo === 'Motocicleta' ? { tipoMoto: form.tipoMoto } : {}),
          ...(tipo === 'Camioneta' ? { cabina: form.cabina, capacidadCarga: form.capacidadCarga } : {}),
        },
      };
      await vehiculosApi.create(payload);
      addToast('¡Vehículo registrado exitosamente!', 'success');
      setShowOnboarding(false);
      setForm({ placa: '', marca: '', modelo: '', color: '', anio: new Date().getFullYear(), clasificacion: 'Gasolina', numeroPuertas: 4, capacidadMaletero: 400, tipoMoto: 'Deportiva', cabina: 'simple', capacidadCarga: 800 });
      await loadVehiculos();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al registrar vehículo', 'error');
    } finally {
      setCreating(false);
    }
  };

  const updateForm = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Cargando...</span></div>;

  // Onboarding: must register vehicle
  if (showOnboarding && vehiculos.length === 0) {
    return (
      <div className="onboarding-overlay">
        <ToastContainer />
        <div className="onboarding-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>🚗 ¡Bienvenido! Registra tu vehículo</h2>
            <button className="btn btn-ghost" onClick={() => logout()} style={{ fontSize: '0.85rem', padding: '0.3rem 0.6rem' }}>Cerrar sesión</button>
          </div>
          <p>
            Para usar el sistema de parqueo, necesitas registrar al menos un vehículo. 
            Este se vinculará automáticamente a tu cuenta.
          </p>
          <VehicleForm
            tipo={tipo} setTipo={setTipo}
            form={form} updateForm={updateForm}
            formErrors={formErrors}
            onSubmit={handleCreate}
            creating={creating}
            showCancel={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Vehículo</h1>
          <p className="page-subtitle">Vehículos registrados a tu nombre</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowOnboarding(true)}>+ Registrar Vehículo</button>
      </div>

      {vehiculos.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🚗</div>
            <div className="empty-state-title">Sin vehículos</div>
            <div className="empty-state-text">Registra tu primer vehículo para utilizar el sistema de parqueo.</div>
            <button className="btn btn-primary" onClick={() => setShowOnboarding(true)}>Registrar Vehículo</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {vehiculos.map(v => (
            <div key={v.id} className="card">
              <div className="card-header">
                <span style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>{v.placa}</span>
                <span className={`badge ${v.activo ? 'badge-success' : 'badge-danger'}`}>
                  {v.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Tipo:</span> <span className="badge badge-info">{v.tipo}</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Marca:</span> {v.marca}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Modelo:</span> {v.modelo}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Color:</span> {v.color}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Año:</span> {v.anio}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Combustible:</span> {v.clasificacion}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add vehicle modal */}
      {showOnboarding && vehiculos.length > 0 && (
        <div className="modal-overlay" onClick={() => setShowOnboarding(false)}>
          <div className="modal" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">🚗 Registrar Nuevo Vehículo</h2>
            <VehicleForm
              tipo={tipo} setTipo={setTipo}
              form={form} updateForm={updateForm}
              formErrors={formErrors}
              onSubmit={handleCreate}
              creating={creating}
              showCancel={true}
              onCancel={() => setShowOnboarding(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Vehicle form component (reused in onboarding and modal)
function VehicleForm({ tipo, setTipo, form, updateForm, formErrors, onSubmit, creating, showCancel, onCancel }: {
  tipo: TipoVehiculo;
  setTipo: (t: TipoVehiculo) => void;
  form: Record<string, string | number>;
  updateForm: (field: string, value: string | number) => void;
  formErrors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
  creating: boolean;
  showCancel: boolean;
  onCancel?: () => void;
}) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label className="form-label">Tipo de Vehículo</label>
        <select value={tipo} onChange={e => setTipo(e.target.value as TipoVehiculo)}>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Placa *</label>
        <input
          value={form.placa as string}
          onChange={e => updateForm('placa', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
          placeholder={tipo === 'Motocicleta' ? 'ABC-123D' : 'ABC-1234'}
          maxLength={8} required
        />
        {formErrors.placa && <div className="form-error">{formErrors.placa}</div>}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Marca *</label>
          <input value={form.marca as string} onChange={e => updateForm('marca', e.target.value)} maxLength={30} required />
          {formErrors.marca && <div className="form-error">{formErrors.marca}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Modelo *</label>
          <input value={form.modelo as string} onChange={e => updateForm('modelo', e.target.value)} maxLength={107} required />
          {formErrors.modelo && <div className="form-error">{formErrors.modelo}</div>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Color *</label>
          <input value={form.color as string} onChange={e => updateForm('color', e.target.value)} maxLength={64} required />
          {formErrors.color && <div className="form-error">{formErrors.color}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Año *</label>
          <input type="number" value={form.anio as number} onChange={e => updateForm('anio', +e.target.value)} required />
          {formErrors.anio && <div className="form-error">{formErrors.anio}</div>}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Combustible</label>
        <select value={form.clasificacion as string} onChange={e => updateForm('clasificacion', e.target.value)}>
          {CLASIFICACIONES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {tipo === 'Auto' && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nro. Puertas</label>
            <input type="number" min={2} max={5} value={form.numeroPuertas as number} onChange={e => updateForm('numeroPuertas', +e.target.value)} />
            {formErrors.numeroPuertas && <div className="form-error">{formErrors.numeroPuertas}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Cap. Maletero (kg)</label>
            <input type="number" min={150} max={800} value={form.capacidadMaletero as number} onChange={e => updateForm('capacidadMaletero', +e.target.value)} />
            {formErrors.capacidadMaletero && <div className="form-error">{formErrors.capacidadMaletero}</div>}
          </div>
        </div>
      )}
      {tipo === 'Motocicleta' && (
        <div className="form-group">
          <label className="form-label">Tipo de Moto</label>
          <select value={form.tipoMoto as string} onChange={e => updateForm('tipoMoto', e.target.value)}>
            <option value="Deportiva">Deportiva</option>
            <option value="Scooter">Scooter</option>
            <option value="Motocross">Motocross</option>
          </select>
        </div>
      )}
      {tipo === 'Camioneta' && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Cabina</label>
            <select value={form.cabina as string} onChange={e => updateForm('cabina', e.target.value)}>
              <option value="simple">Simple</option>
              <option value="doble">Doble</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cap. Carga (kg)</label>
            <input type="number" min={450} max={1360} value={form.capacidadCarga as number} onChange={e => updateForm('capacidadCarga', +e.target.value)} />
            {formErrors.capacidadCarga && <div className="form-error">{formErrors.capacidadCarga}</div>}
          </div>
        </div>
      )}
      <div className="form-actions">
        {showCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>}
        <button type="submit" className="btn btn-primary" disabled={creating}>
          {creating ? 'Registrando...' : '🚗 Registrar Vehículo'}
        </button>
      </div>
    </form>
  );
}
