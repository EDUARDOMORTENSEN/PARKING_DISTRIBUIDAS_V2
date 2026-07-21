const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message || data?.detail || data?.error || `Error ${res.status}`;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }

  return data as T;
}

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    request<{ access_token: string; refresh_token: string }>('/usuarios/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  validate: () =>
    request<{ userId: string; username: string; roles: string[]; permissions: string[] }>('/usuarios/auth/validate'),
};

// Zonas
import type { Zona, CreateZonaRequest } from '../types';

export const zonasApi = {
  getAll: () => request<Zona[]>('/v1/zonas/'),
  create: (data: CreateZonaRequest) =>
    request<Zona>('/v1/zonas/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: CreateZonaRequest) =>
    request<Zona>(`/v1/zonas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleActive: (id: string) =>
    request<void>(`/v1/zonas/${id}`, { method: 'PATCH' }),
};

// Espacios
import type { Espacio, CreateEspacioRequest, EstadoEspacio } from '../types';

export const espaciosApi = {
  getAll: () => request<Espacio[]>('/v1/espacios/'),
  getById: (id: string) => request<Espacio>(`/v1/espacios/${id}`),
  create: (data: CreateEspacioRequest) =>
    request<Espacio>('/v1/espacios/', { method: 'POST', body: JSON.stringify(data) }),
  updateEstado: (id: string, estado: EstadoEspacio) =>
    request<Espacio>(`/v1/espacios/${id}`, { method: 'POST', body: JSON.stringify(estado) }),
  getByZona: (idZona: string) => request<Espacio[]>(`/v1/espacios/zona/${idZona}`),
  delete: (id: string) => request<void>(`/v1/espacios/${id}`, { method: 'DELETE' }),
};

// Tickets
import type { Ticket, CreateTicketRequest } from '../types';

export const ticketsApi = {
  create: (data: CreateTicketRequest) =>
    request<Ticket>('/v1/tickets/', { method: 'POST', body: JSON.stringify(data) }),
  getById: (id: string) => request<Ticket>(`/v1/tickets/${id}`),
  registrarSalida: (id: string, fecha?: string) =>
    request<Ticket>(`/v1/tickets/${id}/salida`, {
      method: 'PATCH',
      body: JSON.stringify({ fecha_hora_salida: fecha || null }),
    }),
  anular: (id: string, motivo?: string) =>
    request<Ticket>(`/v1/tickets/${id}/anular`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo: motivo || null }),
    }),
};

// Vehiculos
import type { Vehiculo, CreateVehiculoRequest } from '../types';

export const vehiculosApi = {
  getAll: () => request<Vehiculo[]>('/vehiculos'),
  getById: (id: string) => request<Vehiculo>(`/vehiculos/${id}`),
  getByPlaca: (placa: string) => request<Vehiculo>(`/vehiculos/placa/${placa}`),
  create: (data: CreateVehiculoRequest) =>
    request<Vehiculo>('/vehiculos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<Vehiculo>(`/vehiculos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<Vehiculo>(`/vehiculos/${id}`, { method: 'DELETE' }),
};

// Personas
import type { Persona, CreatePersonaRequest } from '../types';

export const personasApi = {
  getAll: () => request<Persona[]>('/usuarios/personas'),
  getById: (id: string) => request<Persona>(`/usuarios/personas/${id}`),
  create: (data: CreatePersonaRequest) =>
    request<{ persona: Persona; user: { id: string; username: string } }>('/usuarios/personas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<CreatePersonaRequest>) =>
    request<Persona>(`/usuarios/personas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  activate: (id: string) =>
    request<Persona>(`/usuarios/personas/activate/${id}`, { method: 'PATCH' }),
  deactivate: (id: string) =>
    request<Persona>(`/usuarios/personas/deactivate/${id}`, { method: 'PATCH' }),
};
