import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ReportsPage() {
  const { t } = useTranslation();
  const [deptData, setDeptData] = useState<{ name: string; count: number }[]>([]);
  const [turnover, setTurnover] = useState<{ month: string; rate: number }[]>([]);
  const [agePyramid, setAgePyramid] = useState<{ range: string; count: number }[]>([]);

  useEffect(() => {
    api.get('/reports/departments').then(r => setDeptData(r.data.data)).catch(() => {});
    api.get('/reports/turnover').then(r => setTurnover(r.data.data)).catch(() => {});
    api.get('/reports/age-pyramid').then(r => setAgePyramid(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-5 bg-white border rounded-xl">
          <h3 className="mb-4 font-semibold text-gray-900">{t('dashboard.departmentDistribution')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={deptData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 bg-white border rounded-xl">
          <h3 className="mb-4 font-semibold text-gray-900">{t('reports.turnover')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={turnover}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 bg-white border rounded-xl lg:col-span-2">
          <h3 className="mb-4 font-semibold text-gray-900">{t('reports.agePyramid')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agePyramid} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="range" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
