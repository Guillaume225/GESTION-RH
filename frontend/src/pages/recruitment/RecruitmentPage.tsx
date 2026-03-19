import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users, Eye } from 'lucide-react';
import api from '@/lib/api';

const statusLabels: Record<string, string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publiée',
  CLOSED: 'Fermée',
  FILLED: 'Pourvue',
};

export default function RecruitmentPage() {
  const [showDialog, setShowDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['job-offers'],
    queryFn: () => api.get('/recruitment/offers').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/recruitment/offers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-offers'] });
      setShowDialog(false);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      title: fd.get('title'),
      description: fd.get('description'),
      location: fd.get('location'),
      contractType: fd.get('contractType'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recrutement</h1>
          <p className="text-muted-foreground">Gérez vos offres d'emploi et candidatures</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle offre
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.data?.map((offer: any) => (
          <Card key={offer.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{offer.title}</CardTitle>
                <Badge variant={offer.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                  {statusLabels[offer.status] || offer.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {offer.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {offer._count?.candidates || 0} candidat(s)
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {offer.location && <span>{offer.location}</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle offre d'emploi</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du poste</Label>
              <Input id="title" name="title" required placeholder="Ex: Développeur Full Stack" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                required
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Description du poste..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Lieu</Label>
                <Input id="location" name="location" placeholder="Paris" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractType">Type de contrat</Label>
                <Input id="contractType" name="contractType" placeholder="CDI" />
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
