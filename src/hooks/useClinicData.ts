'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSync } from './useSync';
import {
  getPatientsAPI,
  getVisitsAPI,
  getSessionsAPI,
  getServicesAPI,
  getAlertsAPI,
  getNotesAPI,
  getDashboardAPI,
  getDailyReportAPI,
  getWeeklyReportAPI,
  getMonthlyReportAPI,
  getLaserRecordsAPI,
  getLaserPackagesAPI,
  getTransactionsAPI,
  getFinanceSummaryAPI,
  getWaitingQueueAPI,
  type PatientFilters,
  type VisitFilters,
  type SessionFilters,
} from '@/lib/api';

interface ClinicDataState {
  // Dashboard
  dashboard: any | null;
  dashboardLoading: boolean;
  // Patients
  patients: any[];
  patientsTotal: number;
  patientsLoading: boolean;
  patientDetail: any | null;
  patientDetailLoading: boolean;
  // Visits
  visits: any[];
  visitsTotal: number;
  visitsLoading: boolean;
  // Sessions
  sessions: any[];
  sessionsTotal: number;
  sessionsLoading: boolean;
  // Services
  services: any[];
  servicesLoading: boolean;
  // Alerts
  alerts: any[];
  alertsLoading: boolean;
  // Notes
  notes: any[];
  notesLoading: boolean;
  // Reports
  dailyReport: any | null;
  weeklyReport: any | null;
  monthlyReport: any | null;
  reportsLoading: boolean;
  // Laser
  laserRecords: any[];
  laserRecordsTotal: number;
  laserRecordsLoading: boolean;
  laserPackages: any[];
  laserPackagesLoading: boolean;
  // Finance
  transactions: any[];
  transactionsTotal: number;
  transactionsLoading: boolean;
  financeSummary: any | null;
  // Waiting Queue
  waitingQueue: any[];
  waitingQueueLoading: boolean;
}

export function useClinicData() {
  const { connected, connectionInfo, lastSyncTime, on } = useSync();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPollRef = useRef<number>(Date.now());

  const [state, setState] = useState<ClinicDataState>({
    dashboard: null,
    dashboardLoading: false,
    patients: [],
    patientsTotal: 0,
    patientsLoading: false,
    patientDetail: null,
    patientDetailLoading: false,
    visits: [],
    visitsTotal: 0,
    visitsLoading: false,
    sessions: [],
    sessionsTotal: 0,
    sessionsLoading: false,
    services: [],
    servicesLoading: false,
    alerts: [],
    alertsLoading: false,
    notes: [],
    notesLoading: false,
    dailyReport: null,
    weeklyReport: null,
    monthlyReport: null,
    reportsLoading: false,
    laserRecords: [],
    laserRecordsTotal: 0,
    laserRecordsLoading: false,
    laserPackages: [],
    laserPackagesLoading: false,
    transactions: [],
    transactionsTotal: 0,
    transactionsLoading: false,
    financeSummary: null,
    waitingQueue: [],
    waitingQueueLoading: false,
  });

  const update = useCallback((partial: Partial<ClinicDataState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  // ─── Fetch functions ────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    update({ dashboardLoading: true });
    try {
      const data = await getDashboardAPI();
      update({ dashboard: data, dashboardLoading: false });
    } catch {
      update({ dashboardLoading: false });
    }
  }, [update]);

  const fetchPatients = useCallback(async (params?: PatientFilters) => {
    update({ patientsLoading: true });
    try {
      const data = await getPatientsAPI(params);
      update({ patients: data.patients, patientsTotal: data.total, patientsLoading: false });
    } catch {
      update({ patientsLoading: false });
    }
  }, [update]);

  const fetchPatientDetail = useCallback(async (id: string) => {
    update({ patientDetailLoading: true });
    try {
      const res = await fetch(`/api/patients/${id}`);
      const json = await res.json();
      update({ patientDetail: json.patient, patientDetailLoading: false });
    } catch {
      update({ patientDetailLoading: false });
    }
  }, [update]);

  const fetchVisits = useCallback(async (params?: VisitFilters) => {
    update({ visitsLoading: true });
    try {
      const data = await getVisitsAPI(params);
      update({ visits: data.visits, visitsTotal: data.total, visitsLoading: false });
    } catch {
      update({ visitsLoading: false });
    }
  }, [update]);

  const fetchSessions = useCallback(async (params?: SessionFilters) => {
    update({ sessionsLoading: true });
    try {
      const data = await getSessionsAPI(params);
      update({ sessions: data.sessions, sessionsTotal: data.total, sessionsLoading: false });
    } catch {
      update({ sessionsLoading: false });
    }
  }, [update]);

  const fetchServices = useCallback(async () => {
    update({ servicesLoading: true });
    try {
      const data = await getServicesAPI();
      update({ services: data.services, servicesLoading: false });
    } catch {
      update({ servicesLoading: false });
    }
  }, [update]);

  const fetchAlerts = useCallback(async (params?: { patientId?: string; isRead?: boolean; alertType?: string }) => {
    update({ alertsLoading: true });
    try {
      const data = await getAlertsAPI(params);
      update({ alerts: data.alerts, alertsLoading: false });
    } catch {
      update({ alertsLoading: false });
    }
  }, [update]);

  const fetchNotes = useCallback(async (params?: { patientId?: string; section?: string; relatedId?: string }) => {
    update({ notesLoading: true });
    try {
      const data = await getNotesAPI(params);
      update({ notes: data.notes, notesLoading: false });
    } catch {
      update({ notesLoading: false });
    }
  }, [update]);

  const fetchDailyReport = useCallback(async () => {
    update({ reportsLoading: true });
    try {
      const data = await getDailyReportAPI();
      update({ dailyReport: data, reportsLoading: false });
    } catch {
      update({ reportsLoading: false });
    }
  }, [update]);

  const fetchWeeklyReport = useCallback(async () => {
    update({ reportsLoading: true });
    try {
      const data = await getWeeklyReportAPI();
      update({ weeklyReport: data, reportsLoading: false });
    } catch {
      update({ reportsLoading: false });
    }
  }, [update]);

  const fetchMonthlyReport = useCallback(async () => {
    update({ reportsLoading: true });
    try {
      const data = await getMonthlyReportAPI();
      update({ monthlyReport: data, reportsLoading: false });
    } catch {
      update({ reportsLoading: false });
    }
  }, [update]);

  // ─── Laser ──────────────────────────────────────────────────
  const fetchLaserRecords = useCallback(async (params?: { patientId?: string; status?: string; bodyArea?: string }) => {
    update({ laserRecordsLoading: true });
    try {
      const data = await getLaserRecordsAPI(params);
      update({ laserRecords: data.records, laserRecordsTotal: data.total, laserRecordsLoading: false });
    } catch {
      update({ laserRecordsLoading: false });
    }
  }, [update]);

  const fetchLaserPackages = useCallback(async () => {
    update({ laserPackagesLoading: true });
    try {
      const data = await getLaserPackagesAPI();
      update({ laserPackages: data.packages, laserPackagesLoading: false });
    } catch {
      update({ laserPackagesLoading: false });
    }
  }, [update]);

  // ─── Finance ────────────────────────────────────────────────
  const fetchTransactions = useCallback(async (params?: { type?: string; category?: string; dateFrom?: string; dateTo?: string }) => {
    update({ transactionsLoading: true });
    try {
      const data = await getTransactionsAPI(params);
      update({ transactions: data.transactions, transactionsTotal: data.total, transactionsLoading: false });
    } catch {
      update({ transactionsLoading: false });
    }
  }, [update]);

  const fetchFinanceSummary = useCallback(async (params?: { dateFrom?: string; dateTo?: string }) => {
    try {
      const data = await getFinanceSummaryAPI(params);
      update({ financeSummary: data });
    } catch {
      // silent
    }
  }, [update]);

  // ─── Waiting Queue ──────────────────────────────────────────
  const fetchWaitingQueue = useCallback(async (params?: { status?: string; date?: string }) => {
    update({ waitingQueueLoading: true });
    try {
      const data = await getWaitingQueueAPI(params);
      update({ waitingQueue: data.queue, waitingQueueLoading: false });
    } catch {
      update({ waitingQueueLoading: false });
    }
  }, [update]);

  // ─── Listen to sync events for auto-refresh ────────────────
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    unsubs.push(on('patient:created', () => { fetchPatients(); fetchDashboard(); }));
    unsubs.push(on('patient:updated', () => { fetchPatients(); fetchDashboard(); }));
    unsubs.push(on('patient:deleted', () => { fetchPatients(); fetchDashboard(); }));
    unsubs.push(on('visit:created', () => { fetchVisits(); fetchDashboard(); }));
    unsubs.push(on('visit:updated', () => { fetchVisits(); fetchDashboard(); }));
    unsubs.push(on('visit:deleted', () => { fetchVisits(); fetchDashboard(); }));
    unsubs.push(on('session:created', () => { fetchSessions(); fetchDashboard(); }));
    unsubs.push(on('session:updated', () => { fetchSessions(); fetchDashboard(); }));
    unsubs.push(on('session:deleted', () => { fetchSessions(); fetchDashboard(); }));
    unsubs.push(on('alert:new', () => { fetchAlerts(); fetchDashboard(); }));
    unsubs.push(on('alert:updated', () => { fetchAlerts(); fetchDashboard(); }));
    unsubs.push(on('alert:deleted', () => { fetchAlerts(); fetchDashboard(); }));
    unsubs.push(on('note:new', () => { fetchNotes(); }));
    unsubs.push(on('service:created', () => { fetchServices(); }));
    unsubs.push(on('service:updated', () => { fetchServices(); }));
    unsubs.push(on('service:deleted', () => { fetchServices(); }));

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [on, fetchPatients, fetchVisits, fetchSessions, fetchDashboard, fetchAlerts, fetchNotes, fetchServices]);

  // ─── Polling fallback when WebSocket is disconnected ───────
  useEffect(() => {
    if (connected) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    pollingIntervalRef.current = setInterval(async () => {
      const now = Date.now();
      if (now - lastPollRef.current < 5000) return;
      lastPollRef.current = now;

      try {
        const [dashData, alertsData] = await Promise.allSettled([
          getDashboardAPI(),
          getAlertsAPI({ isRead: false }),
        ]);
        if (dashData.status === 'fulfilled') {
          update({ dashboard: dashData.value });
        }
        if (alertsData.status === 'fulfilled') {
          update({ alerts: alertsData.value.alerts });
        }
      } catch {
        // Silent fail
      }
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [connected, update]);

  return {
    ...state,
    connected,
    connectionInfo: connectionInfo || '',
    lastSyncTime,
    fetchDashboard,
    fetchPatients,
    fetchPatientDetail,
    fetchVisits,
    fetchSessions,
    fetchServices,
    fetchAlerts,
    fetchNotes,
    fetchDailyReport,
    fetchWeeklyReport,
    fetchMonthlyReport,
    fetchLaserRecords,
    fetchLaserPackages,
    fetchTransactions,
    fetchFinanceSummary,
    fetchWaitingQueue,
  };
}
