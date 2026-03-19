import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { Clock, Play, Square } from 'lucide-react';

interface TimeEntry {
  id: string;
  employee: { firstName: string; lastName: string };
  date: string;
  clockIn: string;
  clockOut: string | null;
  totalHours: number | null;
  overtimeHours: number;
}

export default function TimeTrackingPage() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/time-tracking');
      setEntries(res.data.data.data ?? res.data.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('timeTracking.title')}</h2>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
            <Play className="w-4 h-4" />
            {t('timeTracking.clockIn')}
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
            <Square className="w-4 h-4" />
            {t('timeTracking.clockOut')}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Employé</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Arrivée</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Départ</th>
              <th className="px-4 py-3 text-xs font-medium text-right text-gray-500 uppercase">{t('timeTracking.totalHours')}</th>
              <th className="px-4 py-3 text-xs font-medium text-right text-gray-500 uppercase">{t('timeTracking.overtime')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{e.employee?.lastName} {e.employee?.firstName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(e.date).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(e.clockIn).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {e.clockOut ? new Date(e.clockOut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : (
                    <span className="inline-flex items-center gap-1 text-green-600"><Clock className="w-3 h-3" /> En cours</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">{e.totalHours?.toFixed(1) ?? '-'}h</td>
                <td className="px-4 py-3 text-sm text-right text-orange-600">{e.overtimeHours > 0 ? `+${e.overtimeHours.toFixed(1)}h` : '-'}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
