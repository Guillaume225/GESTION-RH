import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, FileText, PlayCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';

export default function PayrollPage() {
  const [year] = useState(new Date().getFullYear());
  const [month] = useState(new Date().getMonth() + 1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['payslips', year, month],
    queryFn: () => api.get('/payroll', { params: { year, month } }).then((r) => r.data),
  });

  const generateBulk = useMutation({
    mutationFn: () => api.post('/payroll/generate-bulk', { year, month }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payslips'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion de la paie</h1>
          <p className="text-muted-foreground">Fiches de paie — {String(month).padStart(2, '0')}/{year}</p>
        </div>
        <Button onClick={() => generateBulk.mutate()} disabled={generateBulk.isPending}>
          <PlayCircle className="mr-2 h-4 w-4" />
          {generateBulk.isPending ? 'Génération...' : 'Générer les fiches'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Masse salariale brute</p>
              <p className="text-xl font-bold">
                {data?.data?.reduce((s: number, p: any) => s + p.grossSalary, 0) ? formatCurrency(data.data.reduce((s: number, p: any) => s + p.grossSalary, 0)) : '-'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Masse salariale nette</p>
              <p className="text-xl font-bold">
                {data?.data?.reduce((s: number, p: any) => s + p.netSalary, 0) ? formatCurrency(data.data.reduce((s: number, p: any) => s + p.netSalary, 0)) : '-'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-purple-50 p-3 rounded-full">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fiches générées</p>
              <p className="text-xl font-bold">{data?.pagination?.total ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Brut</TableHead>
                  <TableHead>Déductions</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((payslip: any) => (
                  <TableRow key={payslip.id}>
                    <TableCell className="font-medium">
                      {payslip.employee?.firstName} {payslip.employee?.lastName}
                    </TableCell>
                    <TableCell>{payslip.period}</TableCell>
                    <TableCell>{formatCurrency(payslip.grossSalary)}</TableCell>
                    <TableCell className="text-red-600">{formatCurrency(payslip.totalDeductions)}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(payslip.netSalary)}</TableCell>
                    <TableCell>
                      <Badge variant={payslip.status === 'VALIDATED' ? 'success' : payslip.status === 'PAID' ? 'success' : 'warning'}>
                        {payslip.status === 'DRAFT' ? 'Brouillon' : payslip.status === 'VALIDATED' ? 'Validé' : payslip.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
