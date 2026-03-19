import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';

const leaveTypeLabels: Record<string, string> = {
  PAID_LEAVE: 'Congés payés',
  RTT: 'RTT',
  SICK_LEAVE: 'Maladie',
  UNPAID_LEAVE: 'Sans solde',
  MATERNITY: 'Maternité',
  PATERNITY: 'Paternité',
  OTHER: 'Autre',
};

const statusVariants: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  APPROVED_MANAGER: 'warning',
  REJECTED: 'destructive',
  CANCELLED: 'secondary',
};

export default function LeavesPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['leaves', page],
    queryFn: () => api.get('/leaves', { params: { page, limit: 20 } }).then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/leaves/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.put(`/leaves/${id}/reject`, { reason: 'Refusé par le gestionnaire' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/leaves', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      setShowDialog(false);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      type: formData.get('type'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      reason: formData.get('reason'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des congés</h1>
          <p className="text-muted-foreground">Demandes de congés et absences</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle demande
        </Button>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Du</TableHead>
                  <TableHead>Au</TableHead>
                  <TableHead>Jours</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((leave: any) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">
                      {leave.employee?.firstName} {leave.employee?.lastName}
                    </TableCell>
                    <TableCell>{leaveTypeLabels[leave.type] || leave.type}</TableCell>
                    <TableCell>{formatDate(leave.startDate)}</TableCell>
                    <TableCell>{formatDate(leave.endDate)}</TableCell>
                    <TableCell>{leave.totalDays}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[leave.status] || 'secondary'}>
                        {leave.status === 'PENDING' ? 'En attente' :
                         leave.status === 'APPROVED' ? 'Approuvé' :
                         leave.status === 'REJECTED' ? 'Refusé' : leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {leave.status === 'PENDING' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="text-green-600" onClick={() => approveMutation.mutate(leave.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => rejectMutation.mutate(leave.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle demande de congé</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Type de congé</Label>
              <Select name="type" required>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(leaveTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input id="endDate" name="endDate" type="date" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motif</Label>
              <Input id="reason" name="reason" placeholder="Motif de la demande..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Envoi...' : 'Soumettre'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
