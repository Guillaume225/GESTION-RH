import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { Plus } from 'lucide-react';

interface JobOffer {
  id: string;
  title: string;
  department: { name: string } | null;
  contractType: string;
  status: string;
  publishedAt: string | null;
  _count?: { candidates: number };
}

export default function RecruitmentPage() {
  const { t } = useTranslation();
  const [offers, setOffers] = useState<JobOffer[]>([]);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/recruitment/offers');
      setOffers(res.data.data.data ?? res.data.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    PUBLISHED: 'bg-blue-100 text-blue-700',
    CLOSED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('recruitment.title')}</h2>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
          <Plus className="w-4 h-4" />
          {t('recruitment.createOffer')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <div key={offer.id} className="p-5 bg-white border rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900">{offer.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[offer.status] ?? 'bg-gray-100'}`}>
                {offer.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">{offer.department?.name ?? '-'}</p>
            <p className="mt-1 text-sm text-gray-500">{offer.contractType}</p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">
                {offer._count?.candidates ?? 0} {t('recruitment.candidates').toLowerCase()}
              </span>
            </div>
          </div>
        ))}
        {offers.length === 0 && (
          <p className="col-span-full py-8 text-center text-gray-400">{t('common.noData')}</p>
        )}
      </div>
    </div>
  );
}
