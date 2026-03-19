import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, GraduationCap, Users, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';
import api from '@/lib/api';

export default function TrainingPage() {
  const [showDialog, setShowDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['trainings'],
    queryFn: () => api.get('/trainings').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/trainings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      setShowDialog(false);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      title: fd.get('title'),
      description: fd.get('description'),
      provider: fd.get('provider'),
      type: fd.get('type'),
      duration: Number(fd.get('duration')),
      maxParticipants: Number(fd.get('maxParticipants')) || null,
      startDate: fd.get('startDate') || null,
    });
  };

  const statusLabels: Record<string, { label: string; variant: 'warning' | 'success' | 'secondary' | 'destructive' }> = {
    PLANNED: { label: 'Planifiée', variant: 'secondary' },
    IN_PROGRESS: { label: 'En cours', variant: 'warning' },
    COMPLETED: { label: 'Terminée', variant: 'success' },
    CANCELLED: { label: 'Annulée', variant: 'destructive' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Formation et développement</h1>
          <p className="text-muted-foreground">Catalogue de formations et inscriptions</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle formation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.data?.map((training: any) => (
          <Card key={training.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{training.title}</CardTitle>
                <Badge variant={statusLabels[training.status]?.variant || 'secondary'}>
                  {statusLabels[training.status]?.label || training.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {training.description || 'Pas de description'}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {training.duration && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> {training.duration}h
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {training._count?.enrollments || 0}
                  {training.maxParticipants && `/${training.maxParticipants}`}
                </span>
                {training.provider && <span>{training.provider}</span>}
              </div>
            </CardContent>
          </Card>
        ))}

        {(!data?.data || data.data.length === 0) && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium">Aucune formation</p>
            <p>Commencez par créer une nouvelle formation</p>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle formation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input id="title" name="title" required placeholder="Ex: Formation React avancé" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" name="description" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Organisme</Label>
                <Input id="provider" name="provider" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input id="type" name="type" placeholder="INTERNAL, EXTERNAL, ONLINE" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (h)</Label>
                <Input id="duration" name="duration" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max participants</Label>
                <Input id="maxParticipants" name="maxParticipants" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Date début</Label>
                <Input id="startDate" name="startDate" type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending}>Créer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
