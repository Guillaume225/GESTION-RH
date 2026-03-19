import { Bell, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Bienvenue, {user?.employee?.firstName || user?.email}
        </h2>
        <p className="text-sm text-slate-500">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
            3
          </span>
        </Button>

        <div className="flex items-center gap-2 pl-3 border-l">
          <div className="h-8 w-8 rounded-full bg-[#062A5A] text-white flex items-center justify-center text-sm font-medium">
            <User size={16} />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.email}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Déconnexion">
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
}
