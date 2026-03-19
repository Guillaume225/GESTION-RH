import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';
import api from '@/lib/api';

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', page, search],
    queryFn: () => api.get('/employees', { params: { page, limit: 20, search } }).then((r) => r.data),
  });

  const statusMap: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'secondary' }> = {
    ACTIVE: { label: 'Actif', variant: 'success' },
    INACTIVE: { label: 'Inactif', variant: 'secondary' },
    ON_LEAVE: { label: 'En congé', variant: 'warning' },
    TERMINATED: { label: 'Terminé', variant: 'destructive' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des employés</h1>
          <p className="text-muted-foreground">Gérez les profils de vos employés</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nouvel employé
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un employé..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N°</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Date d'embauche</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.map((emp: any) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-mono text-sm">{emp.employeeNumber}</TableCell>
                      <TableCell className="font-medium">{emp.firstName} {emp.lastName}</TableCell>
                      <TableCell>{emp.position?.title}</TableCell>
                      <TableCell>{emp.department?.name}</TableCell>
                      <TableCell>{formatDate(emp.hireDate)}</TableCell>
                      <TableCell>
                        <Badge variant={statusMap[emp.status]?.variant || 'secondary'}>
                          {statusMap[emp.status]?.label || emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link to={`/employees/${emp.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data?.pagination && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    {data.pagination.total} employé(s) trouvé(s)
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1}>
                      Précédent
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= data.pagination.totalPages}>
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
