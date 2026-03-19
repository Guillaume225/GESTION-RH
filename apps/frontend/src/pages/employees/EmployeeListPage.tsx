import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@erp-rh/utils';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: { name: string } | null;
  position: { title: string } | null;
  status: string;
  hireDate: string;
}

export default function EmployeeListPage() {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await api.get('/employees', { params: { page, limit, search } });
      setEmployees(res.data.data.data);
      setTotal(res.data.data.total);
    } catch { /* ignore */ }
  }, [page, search]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const totalPages = Math.ceil(total / limit);

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-gray-100 text-gray-700',
    ON_LEAVE: 'bg-yellow-100 text-yellow-700',
    TERMINATED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('employees.title')}</h2>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
          <Plus className="w-4 h-4" />
          {t('employees.addEmployee')}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
        <input
          type="text"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="overflow-x-auto bg-white border rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('employees.lastName')}</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('employees.firstName')}</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('employees.department')}</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('employees.position')}</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('employees.hireDate')}</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('employees.status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3 text-sm text-gray-600">{emp.employeeId}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{emp.lastName}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{emp.firstName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{emp.department?.name ?? '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{emp.position?.title ?? '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(new Date(emp.hireDate))}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[emp.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  {t('common.noData')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {total} résultat{total > 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
