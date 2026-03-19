import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { Plus } from 'lucide-react';

interface Evaluation {
  id: string;
  employee: { firstName: string; lastName: string };
  evaluator: { firstName: string; lastName: string };
  type: string;
  status: string;
  score: number | null;
  period: string;
}

export default function PerformancePage() {
  const { t } = useTranslation();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/performance/evaluations');
      setEvaluations(res.data.data.data ?? res.data.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('performance.title')}</h2>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
          <Plus className="w-4 h-4" />
          {t('performance.createEvaluation')}
        </button>
      </div>

      <div className="overflow-x-auto bg-white border rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Employé</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Évaluateur</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Période</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('performance.score')}</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('leaves.status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {evaluations.map((ev) => (
              <tr key={ev.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{ev.employee?.lastName} {ev.employee?.firstName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{ev.evaluator?.lastName} {ev.evaluator?.firstName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{ev.type}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{ev.period}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{ev.score ?? '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${ev.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {ev.status}
                  </span>
                </td>
              </tr>
            ))}
            {evaluations.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
