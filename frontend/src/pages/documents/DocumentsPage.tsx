import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, Trash2, Download, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';
import api from '@/lib/api';

export default function DocumentsPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['documents', search],
    queryFn: () => api.get('/documents', { params: { search: search || undefined } }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    api.post('/documents', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowDialog(false);
    });
  };

  const typeLabels: Record<string, string> = {
    CONTRACT: 'Contrat',
    PAYSLIP: 'Bulletin de paie',
    CERTIFICATE: 'Attestation',
    ID_DOCUMENT: 'Pièce d\'identité',
    MEDICAL: 'Médical',
    OTHER: 'Autre',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion documentaire</h1>
          <p className="text-muted-foreground">Documents et fichiers des employés</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un document..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Employé</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.map((doc: any) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {doc.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{typeLabels[doc.type] || doc.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {doc.employee
                      ? `${doc.employee.firstName} ${doc.employee.lastName}`
                      : '-'}
                  </TableCell>
                  <TableCell>{formatDate(doc.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {doc.filePath && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.filePath} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Supprimer ce document ?')) deleteMutation.mutate(doc.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aucun document trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du document</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select id="type" name="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="CONTRACT">Contrat</option>
                <option value="PAYSLIP">Bulletin de paie</option>
                <option value="CERTIFICATE">Attestation</option>
                <option value="ID_DOCUMENT">Pièce d'identité</option>
                <option value="MEDICAL">Médical</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeId">ID Employé</Label>
              <Input id="employeeId" name="employeeId" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Fichier</Label>
              <Input id="file" name="file" type="file" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
              <Button type="submit">Ajouter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
