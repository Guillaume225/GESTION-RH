import { Link, useLocation } from 'react-router-dom';
import {
  Users, Calendar, DollarSign, Briefcase, Target,
  GraduationCap, FileText, Clock, BarChart3, Settings,
  LayoutDashboard, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { name: 'Employés', href: '/employees', icon: Users },
  { name: 'Congés', href: '/leaves', icon: Calendar },
  { name: 'Paie', href: '/payroll', icon: DollarSign },
  { name: 'Recrutement', href: '/recruitment', icon: Briefcase },
  { name: 'Performance', href: '/performance', icon: Target },
  { name: 'Formation', href: '/training', icon: GraduationCap },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Temps de travail', href: '/time-tracking', icon: Clock },
  { name: 'Rapports', href: '/reports', icon: BarChart3 },
  { name: 'Administration', href: '/admin', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col bg-[#062A5A] text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-[#4884BD]/30">
        {!collapsed && (
          <Link to="/" className="text-xl font-bold text-[#EA761D]">
            ERP RH
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-[#4884BD]/30"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-[#EA761D] text-white'
                      : 'text-slate-300 hover:bg-[#4884BD]/20 hover:text-white'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon size={20} className="shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
