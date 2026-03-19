import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Target } from 'lucide-react';
import api from '@/lib/api';

export default function PerformancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['evaluations'],
    queryFn: () => api.get('/performance/evaluations').then((r) => r.data),
  });

  const typeLabels: Record<string, string> = {
    ANNUAL: 'Annuel',
    MID_YEAR: 'Mi-année',
    PROBATION: 'Période d\'essai',
  };

  const statusLabels: Record<string, { label: string; variant: 'warning' | 'success' | 'secondary' }> = {
    DRAFT: { label: 'Brouillon', variant: 'secondary' },
    IN_PROGRESS: { label: 'En cours', variant: 'warning' },
    COMPLETED: { label: 'Terminée', variant: 'success' },
    VALIDATED: { label: 'Validée', variant: 'success' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Évaluation des performances</h1>
          <p className="text-muted-foreground">Entretiens, objectifs et évaluations</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle évaluation
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : data?.data?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Évaluateur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((eval_: any) => (
                  <TableRow key={eval_.id}>
                    <TableCell className="font-medium">
                      {eval_.employee?.firstName} {eval_.employee?.lastName}
                    </TableCell>
                    <TableCell>{eval_.evaluator?.firstName} {eval_.evaluator?.lastName}</TableCell>
                    <TableCell>{typeLabels[eval_.type] || eval_.type}</TableCell>
                    <TableCell>{eval_.period}</TableCell>
                    <TableCell>
                      {eval_.overallRating ? (
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-blue-500" />
                          {eval_.overallRating}/5
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusLabels[eval_.status]?.variant || 'secondary'}>
                        {statusLabels[eval_.status]?.label || eval_.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">Aucune évaluation</p>
              <p>Commencez par créer une nouvelle évaluation</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
