import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { Upload, FileText, Trash2 } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  fileSize: number | null;
  createdAt: string;
  employee: { firstName: string; lastName: string } | null;
}

export default function DocumentPage() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.data.data ?? res.data.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('documents.title')}</h2>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
          <Upload className="w-4 h-4" />
          {t('documents.upload')}
        </button>
      </div>

      <div className="overflow-x-auto bg-white border rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Nom</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('documents.type')}</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Employé</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('documents.size')}</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{doc.type}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {doc.employee ? `${doc.employee.lastName} ${doc.employee.firstName}` : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatSize(doc.fileSize)}</td>
                <td className="px-4 py-3">
                  <button className="p-1 text-red-500 rounded hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
