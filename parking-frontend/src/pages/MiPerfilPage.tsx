import { useEffect, useState } from 'react';
import { personasApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import type { Persona } from '../types';

export default function MiPerfilPage() {
  const { user } = useAuth();
  const { addToast, ToastContainer } = useToast();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await personasApi.getById(user!.personId);
        setPersona(data);
      } catch {
        addToast('Error al cargar perfil', 'error');
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Cargando perfil...</span></div>;
  if (!persona) return <div className="loading-page"><span>No se pudo cargar el perfil</span></div>;

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-subtitle">Información de tu cuenta</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Datos Personales</span>
          </div>
          <div style={{ display: 'grid', gap: '0.65rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', fontWeight: 700, color: 'white', flexShrink: 0,
              }}>
                {persona.first_name[0]}{persona.last_name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {persona.first_name} {persona.middle_name || ''} {persona.last_name}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  @{persona.user?.username}
                </div>
              </div>
            </div>
            <InfoRow label="Cédula" value={persona.dni} />
            <InfoRow label="Email" value={persona.email} />
            <InfoRow label="Teléfono" value={persona.phone} />
            <InfoRow label="Nacionalidad" value={persona.nationality} />
            {persona.address && <InfoRow label="Dirección" value={persona.address} />}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Cuenta</span>
          </div>
          <div style={{ display: 'grid', gap: '0.65rem', fontSize: '0.88rem' }}>
            <InfoRow label="ID de Usuario" value={persona.user?.id || '—'} mono />
            <InfoRow label="Username" value={persona.user?.username || '—'} />
            <InfoRow label="Estado" value={persona.activo ? '✅ Activo' : '❌ Inactivo'} />
            <InfoRow label="Registrado" value={new Date(persona.created_at).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })} />
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Roles:</span>
              <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                {user?.roles.map(r => (
                  <span key={r} className={`role-chip ${r.toLowerCase()}`}>{r}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card-header">
          <span className="card-title">Privacidad</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
          Tu información personal y vehículos son privados. Otros usuarios no pueden ver tus datos.
          Solo los administradores del sistema tienen acceso a la información de gestión.
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 500, fontFamily: mono ? 'monospace' : 'inherit', fontSize: mono ? '0.78rem' : undefined }}>{value}</span>
    </div>
  );
}
