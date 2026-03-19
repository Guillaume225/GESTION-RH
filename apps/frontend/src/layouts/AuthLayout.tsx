import { Navigate, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md mx-4">
        <Outlet />
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('erp-rh-auth');
  let isAuthenticated = false;
  try {
    if (token) {
      const parsed = JSON.parse(token);
      isAuthenticated = parsed.state?.isAuthenticated ?? false;
    }
  } catch {
    isAuthenticated = false;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function RequireGuest({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('erp-rh-auth');
  let isAuthenticated = false;
  try {
    if (token) {
      const parsed = JSON.parse(token);
      isAuthenticated = parsed.state?.isAuthenticated ?? false;
    }
  } catch {
    isAuthenticated = false;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
