import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { formatCurrency } from '@erp-rh/utils';

interface Payslip {
  id: string;
  employee: { firstName: string; lastName: string };
  month: number;
  year: number;
  grossSalary: number;
  netSalary: number;
  totalDeductions: number;
  status: string;
}

export default function PayrollPage() {
  const { t } = useTranslation();
  const [payslips, setPayslips] = useState<Payslip[]>([]);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/payroll');
      setPayslips(res.data.data.data ?? res.data.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('payroll.title')}</h2>
        <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
          {t('payroll.generate')}
        </button>
      </div>

      <div className="overflow-x-auto bg-white border rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Employé</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('payroll.period')}</th>
              <th className="px-4 py-3 text-xs font-medium text-right text-gray-500 uppercase">{t('payroll.grossSalary')}</th>
              <th className="px-4 py-3 text-xs font-medium text-right text-gray-500 uppercase">{t('payroll.deductions')}</th>
              <th className="px-4 py-3 text-xs font-medium text-right text-gray-500 uppercase">{t('payroll.netSalary')}</th>
              <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">{t('leaves.status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payslips.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.employee?.lastName} {p.employee?.firstName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{String(p.month).padStart(2, '0')}/{p.year}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(p.grossSalary)}</td>
                <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(p.totalDeductions)}</td>
                <td className="px-4 py-3 text-sm font-medium text-right text-green-700">{formatCurrency(p.netSalary)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${p.status === 'VALIDATED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.status === 'VALIDATED' ? t('payroll.validated') : t('payroll.draft')}
                  </span>
                </td>
              </tr>
            ))}
            {payslips.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
