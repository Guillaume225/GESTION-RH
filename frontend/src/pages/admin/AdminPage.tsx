import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, History } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';

export default function AdminPage() {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['company-settings'],
    queryFn: () => api.get('/admin/settings').then((r) => r.data).catch(() => ({ data: null })),
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => api.get('/admin/audit-logs').then((r) => r.data).catch(() => ({ data: [] })),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data).catch(() => ({ data: [] })),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => api.put('/admin/settings', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['company-settings'] }),
  });

  const handleUpdateSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateSettingsMutation.mutate({
      companyName: fd.get('companyName'),
      siret: fd.get('siret'),
      address: fd.get('address'),
      phone: fd.get('phone'),
      email: fd.get('email'),
      workingHoursPerWeek: Number(fd.get('workingHoursPerWeek')),
      annualLeaveDays: Number(fd.get('annualLeaveDays')),
    });
  };

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administrateur',
    HR_MANAGER: 'Responsable RH',
    MANAGER: 'Manager',
    EMPLOYEE: 'Employé',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Administration</h1>
        <p className="text-muted-foreground">Paramètres, utilisateurs et journaux d'audit</p>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" /> Paramètres
          </TabsTrigger>
          <TabsTrigger value="users">
            <Shield className="mr-2 h-4 w-4" /> Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="audit">
            <History className="mr-2 h-4 w-4" /> Journal d'audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de l'entreprise</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSettings} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input id="companyName" name="companyName" defaultValue={settings?.data?.companyName || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET</Label>
                  <Input id="siret" name="siret" defaultValue={settings?.data?.siret || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input id="address" name="address" defaultValue={settings?.data?.address || ''} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" name="phone" defaultValue={settings?.data?.phone || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={settings?.data?.email || ''} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workingHoursPerWeek">Heures/semaine</Label>
                    <Input id="workingHoursPerWeek" name="workingHoursPerWeek" type="number" defaultValue={settings?.data?.workingHoursPerWeek || 35} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualLeaveDays">Congés annuels (jours)</Label>
                    <Input id="annualLeaveDays" name="annualLeaveDays" type="number" defaultValue={settings?.data?.annualLeaveDays || 25} />
                  </div>
                </div>
                <Button type="submit" disabled={updateSettingsMutation.isPending}>
                  Enregistrer
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs du système</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Actif</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.data?.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{roleLabels[user.role] || user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'success' : 'destructive'}>
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastLogin ? formatDate(user.lastLogin) : 'Jamais'}</TableCell>
                    </TableRow>
                  ))}
                  {(!users?.data || users.data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Aucun utilisateur
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Journal d'audit</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entité</TableHead>
                    <TableHead>Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs?.data?.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.createdAt)}</TableCell>
                      <TableCell>{log.user?.email || '-'}</TableCell>
                      <TableCell><Badge variant="secondary">{log.action}</Badge></TableCell>
                      <TableCell>{log.entityType} {log.entityId ? `#${log.entityId}` : ''}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {log.details || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!auditLogs?.data || auditLogs.data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Aucun log d'audit
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
