import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { Plus } from 'lucide-react';
import { formatDate } from '@erp-rh/utils';

interface LeaveRequest {
  id: string;
  employee: { firstName: string; lastName: string };
  type: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  reason: string;
}

export default function LeaveListPage() {
  const { t } = useTranslation();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await api.get('/leaves');
      setLeaves(res.data.data.data ?? res.data.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const statusStyle: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('leaves.title')}</h2>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
          <Plus className="w-4 h-4" />
          {t('leaves.requestLeave')}
        </button>
      </div>

      <div className="overflow-x-auto bg-white border rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Employé</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('leaves.type')}</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('leaves.startDate')}</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('leaves.endDate')}</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Jours</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('leaves.status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaves.map((leave) => (
              <tr key={leave.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {leave.employee?.lastName} {leave.employee?.firstName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{leave.type}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(new Date(leave.startDate))}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(new Date(leave.endDate))}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{leave.totalDays}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle[leave.status] ?? 'bg-gray-100'}`}>
                    {leave.status}
                  </span>
                </td>
              </tr>
            ))}
            {leaves.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t('common.noData')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
