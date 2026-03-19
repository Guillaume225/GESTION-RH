import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/components/layout/MainLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import EmployeesPage from '@/pages/employees/EmployeesPage';
import EmployeeDetailPage from '@/pages/employees/EmployeeDetailPage';
import LeavesPage from '@/pages/leaves/LeavesPage';
import PayrollPage from '@/pages/payroll/PayrollPage';
import RecruitmentPage from '@/pages/recruitment/RecruitmentPage';
import PerformancePage from '@/pages/performance/PerformancePage';
import TrainingPage from '@/pages/training/TrainingPage';
import DocumentsPage from '@/pages/documents/DocumentsPage';
import TimeTrackingPage from '@/pages/timeTracking/TimeTrackingPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import AdminPage from '@/pages/admin/AdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/:id" element={<EmployeeDetailPage />} />
            <Route path="leaves" element={<LeavesPage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="recruitment" element={<RecruitmentPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="training" element={<TrainingPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="time-tracking" element={<TimeTrackingPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
