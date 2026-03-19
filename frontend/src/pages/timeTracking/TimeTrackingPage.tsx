import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, LogIn, LogOut, Timer } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';

export default function TimeTrackingPage() {
  const queryClient = useQueryClient();

  const { data: entries } = useQuery({
    queryKey: ['time-entries'],
    queryFn: () => api.get('/time-tracking').then((r) => r.data),
  });

  const { data: summary } = useQuery({
    queryKey: ['time-summary'],
    queryFn: () => api.get('/time-tracking/weekly-summary').then((r) => r.data),
  });

  const clockInMutation = useMutation({
    mutationFn: () => api.post('/time-tracking/clock-in'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['time-entries'] }),
  });

  const clockOutMutation = useMutation({
    mutationFn: () => api.post('/time-tracking/clock-out'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['time-summary'] });
    },
  });

  const hasOpenEntry = entries?.data?.some((e: any) => !e.clockOut);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Suivi du temps</h1>
          <p className="text-muted-foreground">Pointage et résumé hebdomadaire</p>
        </div>
        <div className="flex gap-2">
          {hasOpenEntry ? (
            <Button onClick={() => clockOutMutation.mutate()} variant="destructive" disabled={clockOutMutation.isPending}>
              <LogOut className="mr-2 h-4 w-4" /> Pointer la sortie
            </Button>
          ) : (
            <Button onClick={() => clockInMutation.mutate()} disabled={clockInMutation.isPending}>
              <LogIn className="mr-2 h-4 w-4" /> Pointer l'entrée
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heures cette semaine</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.data?.totalHours?.toFixed(1) || '0'}h
            </div>
            <p className="text-xs text-muted-foreground">sur 35h contractuelles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heures supplémentaires</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.data?.overtime?.toFixed(1) || '0'}h
            </div>
            <p className="text-xs text-muted-foreground">cette semaine</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={hasOpenEntry ? 'success' : 'secondary'} className="text-base">
              {hasOpenEntry ? 'En poste' : 'Hors poste'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique de pointage</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Entrée</TableHead>
                <TableHead>Sortie</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Heures sup.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries?.data?.map((entry: any) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{new Date(entry.clockIn).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                  <TableCell>
                    {entry.clockOut
                      ? new Date(entry.clockOut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      : <Badge variant="warning">En cours</Badge>}
                  </TableCell>
                  <TableCell>{entry.hoursWorked ? `${entry.hoursWorked.toFixed(1)}h` : '-'}</TableCell>
                  <TableCell>{entry.overtime ? `${entry.overtime.toFixed(1)}h` : '-'}</TableCell>
                </TableRow>
              ))}
              {(!entries?.data || entries.data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aucun pointage enregistré
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
