import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, Briefcase, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/api';

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/reports/dashboard').then((r) => r.data),
  });

  const { data: deptDistribution } = useQuery({
    queryKey: ['dept-distribution'],
    queryFn: () => api.get('/reports/department-distribution').then((r) => r.data),
  });

  const COLORS = ['#062A5A', '#EA761D', '#4884BD', '#E87017', '#0A3D7A', '#F5921E'];

  const statCards = [
    { title: 'Employés actifs', value: stats?.activeEmployees ?? '-', icon: Users, color: 'text-[#062A5A]', bg: 'bg-[#062A5A]/10' },
    { title: 'Congés en attente', value: stats?.pendingLeaves ?? '-', icon: Calendar, color: 'text-[#EA761D]', bg: 'bg-[#EA761D]/10' },
    { title: 'Départements', value: stats?.departments ?? '-', icon: DollarSign, color: 'text-[#4884BD]', bg: 'bg-[#4884BD]/10' },
    { title: 'Postes ouverts', value: stats?.openPositions ?? '-', icon: Briefcase, color: 'text-[#E87017]', bg: 'bg-[#E87017]/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#062A5A]">Tableau de bord</h1>
        <p className="text-slate-500">Vue d'ensemble de votre entreprise</p>
      </div>

      {/* Cartes de stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
                <div className={`${card.bg} p-3 rounded-full`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Répartition par département</CardTitle>
          </CardHeader>
          <CardContent>
            {deptDistribution && deptDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deptDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                  >
                    {deptDistribution.map((_: unknown, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Indicateurs clés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#4884BD]/10 rounded-lg">
                <div>
                  <p className="text-sm text-[#4884BD]">Taux de rétention</p>
                  <p className="text-2xl font-bold text-[#062A5A]">95%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#4884BD]" />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#062A5A]/10 rounded-lg">
                <div>
                  <p className="text-sm text-[#062A5A]">Taux d'absentéisme</p>
                  <p className="text-2xl font-bold text-[#062A5A]">3.2%</p>
                </div>
                <TrendingDown className="h-8 w-8 text-[#062A5A]" />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#EA761D]/10 rounded-lg">
                <div>
                  <p className="text-sm text-[#EA761D]">Masse salariale mensuelle</p>
                  <p className="text-2xl font-bold text-[#E87017]">-</p>
                </div>
                <DollarSign className="h-8 w-8 text-[#EA761D]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
