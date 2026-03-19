import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function ReportsPage() {
  const { data: dashboard } = useQuery({
    queryKey: ['reports-dashboard'],
    queryFn: () => api.get('/reports/dashboard').then((r) => r.data),
  });

  const { data: turnover } = useQuery({
    queryKey: ['reports-turnover'],
    queryFn: () => api.get('/reports/turnover').then((r) => r.data),
  });

  const { data: absenteeism } = useQuery({
    queryKey: ['reports-absenteeism'],
    queryFn: () => api.get('/reports/absenteeism').then((r) => r.data),
  });

  const { data: payroll } = useQuery({
    queryKey: ['reports-payroll'],
    queryFn: () => api.get('/reports/payroll').then((r) => r.data),
  });

  const { data: agePyramid } = useQuery({
    queryKey: ['reports-age-pyramid'],
    queryFn: () => api.get('/reports/age-pyramid').then((r) => r.data),
  });

  const { data: deptDistribution } = useQuery({
    queryKey: ['reports-dept-distribution'],
    queryFn: () => api.get('/reports/department-distribution').then((r) => r.data),
  });

  const stats = dashboard?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rapports et analyses</h1>
        <p className="text-muted-foreground">Tableaux de bord et indicateurs RH</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total employés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de rotation</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{turnover?.data?.rate?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'absentéisme</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absenteeism?.data?.rate?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Masse salariale</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(payroll?.data?.totalGross || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distribution">
        <TabsList>
          <TabsTrigger value="distribution">Répartition</TabsTrigger>
          <TabsTrigger value="age">Pyramide des âges</TabsTrigger>
          <TabsTrigger value="payroll">Masse salariale</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par département</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptDistribution?.data || []}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {(deptDistribution?.data || []).map((_: any, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="age" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pyramide des âges</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agePyramid?.data || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="range" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Résumé de la masse salariale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total brut</p>
                  <p className="text-2xl font-bold">{formatCurrency(payroll?.data?.totalGross || 0)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total net</p>
                  <p className="text-2xl font-bold">{formatCurrency(payroll?.data?.totalNet || 0)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Charges patronales</p>
                  <p className="text-2xl font-bold">{formatCurrency(payroll?.data?.totalCharges || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
