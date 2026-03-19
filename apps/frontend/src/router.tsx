import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout, { RequireAuth, RequireGuest } from '@/layouts/AuthLayout';

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const EmployeeListPage = lazy(() => import('@/pages/employees/EmployeeListPage'));
const LeaveListPage = lazy(() => import('@/pages/leaves/LeaveListPage'));
const PayrollPage = lazy(() => import('@/pages/payroll/PayrollPage'));
const RecruitmentPage = lazy(() => import('@/pages/recruitment/RecruitmentPage'));
const PerformancePage = lazy(() => import('@/pages/performance/PerformancePage'));
const TrainingPage = lazy(() => import('@/pages/training/TrainingPage'));
const DocumentPage = lazy(() => import('@/pages/documents/DocumentPage'));
const TimeTrackingPage = lazy(() => import('@/pages/time-tracking/TimeTrackingPage'));
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'));

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-200 rounded-full animate-spin border-t-primary-600" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: (
      <RequireGuest>
        <AuthLayout />
      </RequireGuest>
    ),
    children: [
      {
        path: '/login',
        element: <LazyPage><LoginPage /></LazyPage>,
      },
    ],
  },
  {
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { path: '/dashboard', element: <LazyPage><DashboardPage /></LazyPage> },
      { path: '/employees', element: <LazyPage><EmployeeListPage /></LazyPage> },
      { path: '/leaves', element: <LazyPage><LeaveListPage /></LazyPage> },
      { path: '/payroll', element: <LazyPage><PayrollPage /></LazyPage> },
      { path: '/recruitment', element: <LazyPage><RecruitmentPage /></LazyPage> },
      { path: '/performance', element: <LazyPage><PerformancePage /></LazyPage> },
      { path: '/training', element: <LazyPage><TrainingPage /></LazyPage> },
      { path: '/documents', element: <LazyPage><DocumentPage /></LazyPage> },
      { path: '/time-tracking', element: <LazyPage><TimeTrackingPage /></LazyPage> },
      { path: '/reports', element: <LazyPage><ReportsPage /></LazyPage> },
    ],
  },
]);
