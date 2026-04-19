const BASE = '/api';

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'خطأ في الاتصال' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function buildQuery(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return '';
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (filtered.length === 0) return '';
  return '?' + filtered.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}

// ─── Auth ──────────────────────────────────────────────────────
export async function loginAPI(name: string, role: string, phone?: string) {
  return fetchAPI<{ user: { id: string; name: string; role: string; phone?: string | null } }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ name, role, phone }) }
  );
}

// ─── Patients ──────────────────────────────────────────────────
export interface PatientFilters {
  name?: string;
  phone?: string;
  fileNumber?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function getPatientsAPI(params?: PatientFilters) {
  return fetchAPI<{ patients: any[]; total: number; page: number; limit: number }>(
    `/patients${buildQuery(params as any)}`
  );
}

export function getPatientAPI(id: string) {
  return fetchAPI<{ patient: any }>(`/patients/${id}`);
}

export function createPatientAPI(data: any) {
  return fetchAPI<{ patient: any }>('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updatePatientAPI(id: string, data: any) {
  return fetchAPI<{ patient: any }>(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deletePatientAPI(id: string, userId?: string) {
  return fetchAPI<{ success: boolean }>(`/patients/${id}${buildQuery({ userId })}`, {
    method: 'DELETE',
  });
}

// ─── Visits ────────────────────────────────────────────────────
export interface VisitFilters {
  patientId?: string;
  visitType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export function getVisitsAPI(params?: VisitFilters) {
  return fetchAPI<{ visits: any[]; total: number; page: number; limit: number }>(
    `/visits${buildQuery(params as any)}`
  );
}

export function createVisitAPI(data: any) {
  return fetchAPI<{ visit: any }>('/visits', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateVisitAPI(id: string, data: any) {
  return fetchAPI<{ visit: any }>(`/visits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteVisitAPI(id: string) {
  return fetchAPI<{ success: boolean }>(`/visits/${id}`, { method: 'DELETE' });
}

// ─── Sessions ──────────────────────────────────────────────────
export interface SessionFilters {
  patientId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export function getSessionsAPI(params?: SessionFilters) {
  return fetchAPI<{ sessions: any[]; total: number; page: number; limit: number }>(
    `/sessions${buildQuery(params as any)}`
  );
}

export function createSessionAPI(data: any) {
  return fetchAPI<{ session: any }>('/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateSessionAPI(id: string, data: any) {
  return fetchAPI<{ session: any }>(`/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteSessionAPI(id: string) {
  return fetchAPI<{ success: boolean }>(`/sessions/${id}`, { method: 'DELETE' });
}

// ─── Services ──────────────────────────────────────────────────
export function getServicesAPI() {
  return fetchAPI<{ services: any[] }>('/services');
}

export function createServiceAPI(data: any) {
  return fetchAPI<{ service: any }>('/services', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateServiceAPI(id: string, data: any) {
  return fetchAPI<{ service: any }>(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteServiceAPI(id: string) {
  return fetchAPI<{ success: boolean }>(`/services/${id}`, { method: 'DELETE' });
}

// ─── Notes ─────────────────────────────────────────────────────
export interface NoteFilters {
  patientId?: string;
  section?: string;
  relatedId?: string;
}

export function getNotesAPI(params?: NoteFilters) {
  return fetchAPI<{ notes: any[] }>(`/notes${buildQuery(params as any)}`);
}

export function createNoteAPI(data: any) {
  return fetchAPI<{ note: any }>('/notes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Alerts ────────────────────────────────────────────────────
export interface AlertFilters {
  patientId?: string;
  isRead?: boolean;
  alertType?: string;
}

export function getAlertsAPI(params?: AlertFilters) {
  const qp: Record<string, any> = {};
  if (params?.patientId) qp.patientId = params.patientId;
  if (params?.isRead !== undefined) qp.isRead = String(params.isRead);
  if (params?.alertType) qp.alertType = params.alertType;
  return fetchAPI<{ alerts: any[] }>(`/alerts${buildQuery(qp)}`);
}

export function createAlertAPI(data: any) {
  return fetchAPI<{ alert: any }>('/alerts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateAlertAPI(id: string, data: any) {
  return fetchAPI<{ alert: any }>(`/alerts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteAlertAPI(id: string) {
  return fetchAPI<{ success: boolean }>(`/alerts/${id}`, { method: 'DELETE' });
}

// ─── Reports ───────────────────────────────────────────────────
export function getDashboardAPI() {
  return fetchAPI<any>('/reports/dashboard');
}

export function getDailyReportAPI() {
  return fetchAPI<any>('/reports/daily');
}

export function getWeeklyReportAPI() {
  return fetchAPI<any>('/reports/weekly');
}

export function getMonthlyReportAPI() {
  return fetchAPI<any>('/reports/monthly');
}

// ─── Laser ─────────────────────────────────────────────────────
export function getLaserRecordsAPI(params?: { patientId?: string; status?: string; bodyArea?: string }) {
  return fetchAPI<{ records: any[]; total: number }>(`/laser${buildQuery(params as any)}`);
}

export function getLaserRecordAPI(id: string) {
  return fetchAPI<{ record: any }>(`/laser/${id}`);
}

export function createLaserRecordAPI(data: any) {
  return fetchAPI<{ record: any }>('/laser', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateLaserRecordAPI(id: string, data: any) {
  return fetchAPI<{ record: any }>(`/laser/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteLaserRecordAPI(id: string) {
  return fetchAPI<{ success: boolean }>(`/laser/${id}`, { method: 'DELETE' });
}

export function getLaserPackagesAPI() {
  return fetchAPI<{ packages: any[] }>('/laser/packages');
}

export function createLaserPackageAPI(data: any) {
  return fetchAPI<{ package: any }>('/laser/packages', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateLaserPackageAPI(id: string, data: any) {
  return fetchAPI<{ package: any }>(`/laser/packages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteLaserPackageAPI(id: string) {
  return fetchAPI<{ success: boolean }>(`/laser/packages/${id}`, { method: 'DELETE' });
}

// ─── Laser Sessions ─────────────────────────────────────────
export function getLaserSessionsAPI(laserRecordId: string) {
  return fetchAPI<{ sessions: any[] }>(`/laser/sessions${buildQuery({ laserRecordId })}`);
}

export function createLaserSessionAPI(data: any) {
  return fetchAPI<{ session: any; updatedRecord: any }>('/laser/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateLaserSessionAPI(id: string, data: any) {
  return fetchAPI<{ session: any }>(`/laser/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteLaserSessionAPI(id: string) {
  return fetchAPI<{ success: boolean }>(`/laser/sessions/${id}`, { method: 'DELETE' });
}

// ─── Laser Settings ─────────────────────────────────────────
export function getLaserSettingsAPI() {
  return fetchAPI<{ settings: Record<string, any>; rawSettings: any[] }>('/laser/settings');
}

export function updateLaserSettingsAPI(settings: Record<string, any>) {
  return fetchAPI<{ success: boolean; updated: string[] }>('/laser/settings', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  });
}

// ─── Laser Stats ────────────────────────────────────────────
export function getLaserStatsAPI(params?: { period?: string; dateFrom?: string; dateTo?: string }) {
  return fetchAPI<any>(`/laser/stats${buildQuery(params as any)}`);
}

// ─── Laser Notes ────────────────────────────────────────────
export function getLaserNotesAPI(laserRecordId: string) {
  return fetchAPI<{ notes: any[] }>(`/laser/notes${buildQuery({ laserRecordId })}`);
}

export function createLaserNoteAPI(data: { laserRecordId: string; content: string; isImportant?: boolean; createdBy?: string }) {
  return fetchAPI<{ note: any }>('/laser/notes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateLaserNoteAPI(id: string, data: { content?: string; isImportant?: boolean }) {
  return fetchAPI<{ note: any }>(`/laser/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteLaserNoteAPI(id: string) {
  return fetchAPI<{ success: boolean }>(`/laser/notes/${id}`, { method: 'DELETE' });
}

// ─── Appointments ────────────────────────────────────────
export function getAppointmentsAPI(params?: { date?: string; dateFrom?: string; dateTo?: string; status?: string; type?: string; patientId?: string }) {
  return fetchAPI<{ appointments: any[]; total: number }>(`/appointments${buildQuery(params as any)}`);
}

export function getAppointmentAPI(id: string) {
  return fetchAPI<{ appointment: any }>(`/appointments/${id}`);
}

export function createAppointmentAPI(data: any) {
  return fetchAPI<{ appointment: any }>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateAppointmentAPI(id: string, data: any) {
  return fetchAPI<{ appointment: any }>(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteAppointmentAPI(id: string) {
  return fetchAPI<{ success: boolean }>(`/appointments/${id}`, { method: 'DELETE' });
}

export function getAppointmentStatsAPI(params?: { dateFrom?: string; dateTo?: string }) {
  return fetchAPI<any>(`/appointments/stats${buildQuery(params as any)}`);
}

export function getAvailableSlotsAPI(date: string, duration?: number) {
  return fetchAPI<{ slots: any[] }>(`/appointments/slots${buildQuery({ date, duration })}`);
}

// ─── Finance ───────────────────────────────────────────────────
export function getTransactionsAPI(params?: { type?: string; category?: string; dateFrom?: string; dateTo?: string }) {
  return fetchAPI<{ transactions: any[]; total: number }>(`/finance${buildQuery(params as any)}`);
}

export function createTransactionAPI(data: any) {
  return fetchAPI<{ transaction: any }>('/finance', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateTransactionAPI(id: string, data: any) {
  return fetchAPI<{ transaction: any }>(`/finance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteTransactionAPI(id: string) {
  return fetchAPI<{ success: boolean }>(`/finance/${id}`, { method: 'DELETE' });
}

export function getFinanceSummaryAPI(params?: { dateFrom?: string; dateTo?: string }) {
  return fetchAPI<any>(`/finance/summary${buildQuery(params as any)}`);
}

// ─── Waiting Queue ─────────────────────────────────────────────
export function getWaitingQueueAPI(params?: { status?: string; date?: string }) {
  return fetchAPI<{ queue: any[] }>(`/waiting${buildQuery(params as any)}`);
}

export function addToWaitingQueueAPI(data: any) {
  return fetchAPI<{ queueItem: any }>('/waiting', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateWaitingQueueAPI(id: string, data: any) {
  return fetchAPI<{ queueItem: any }>(`/waiting/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteWaitingQueueAPI(id: string) {
  return fetchAPI<{ success: boolean }>(`/waiting/${id}`, { method: 'DELETE' });
}

// ─── WhatsApp ──────────────────────────────────────────────────
export function sendWhatsAppAPI(data: { patientId: string; message?: string; type?: string }) {
  return fetchAPI<{ url: string; phone: string; templates: any[] }>('/whatsapp', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getWhatsAppTemplatesAPI() {
  return fetchAPI<{ templates: any[] }>('/whatsapp');
}
