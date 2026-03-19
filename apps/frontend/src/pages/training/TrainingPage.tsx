import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { Plus, Users } from 'lucide-react';
import { formatDate } from '@erp-rh/utils';

interface Training {
  id: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  status: string;
  _count?: { enrollments: number };
}

export default function TrainingPage() {
  const { t } = useTranslation();
  const [trainings, setTrainings] = useState<Training[]>([]);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/trainings');
      setTrainings(res.data.data.data ?? res.data.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('training.title')}</h2>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
          <Plus className="w-4 h-4" />
          {t('common.create')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trainings.map((tr) => (
          <div key={tr.id} className="p-5 bg-white border rounded-xl">
            <h3 className="font-semibold text-gray-900">{tr.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{tr.type}</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              {tr._count?.enrollments ?? 0} / {tr.maxParticipants}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {formatDate(new Date(tr.startDate))} → {formatDate(new Date(tr.endDate))}
            </p>
            <div className="mt-4">
              <button className="w-full py-2 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50">
                {t('training.enroll')}
              </button>
            </div>
          </div>
        ))}
        {trainings.length === 0 && (
          <p className="col-span-full py-8 text-center text-gray-400">{t('common.noData')}</p>
        )}
      </div>
    </div>
  );
}
