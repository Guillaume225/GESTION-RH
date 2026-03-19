import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate, formatCurrency } from '@/lib/utils';
import api from '@/lib/api';

export default function EmployeeDetailPage() {
  const { id } = useParams();

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => api.get(`/employees/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) return <div className="text-center py-8">Chargement...</div>;
  if (!employee) return <div className="text-center py-8">Employé non trouvé</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h1>
          <p className="text-muted-foreground">{employee.position?.title} — {employee.department?.name}</p>
        </div>
        <Badge variant={employee.status === 'ACTIVE' ? 'success' : 'secondary'}>
          {employee.status}
        </Badge>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="leaves">Congés</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-lg">Informations personnelles</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="N° Employé" value={employee.employeeNumber} />
                <InfoRow label="Email" value={employee.user?.email} />
                <InfoRow label="Téléphone" value={employee.phone || '-'} />
                <InfoRow label="Date de naissance" value={employee.dateOfBirth ? formatDate(employee.dateOfBirth) : '-'} />
                <InfoRow label="Adresse" value={employee.address || '-'} />
                <InfoRow label="Ville" value={`${employee.zipCode || ''} ${employee.city || ''}`.trim() || '-'} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Informations professionnelles</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Poste" value={employee.position?.title} />
                <InfoRow label="Département" value={employee.department?.name} />
                <InfoRow label="Manager" value={employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : '-'} />
                <InfoRow label="Date d'embauche" value={formatDate(employee.hireDate)} />
                <InfoRow label="Type de contrat" value={employee.contractType || '-'} />
                <InfoRow label="Salaire annuel" value={employee.baseSalary ? formatCurrency(employee.baseSalary) : '-'} />
              </CardContent>
            </Card>
          </div>

          {employee.leaveBalances?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Soldes de congés</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {employee.leaveBalances.map((balance: any) => (
                    <div key={balance.id} className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">{balance.type.replace('_', ' ')}</p>
                      <p className="text-2xl font-bold">{balance.remaining} <span className="text-sm font-normal text-muted-foreground">/ {balance.allocated}</span></p>
                      <p className="text-xs text-muted-foreground">Utilisés: {balance.used} | En attente: {balance.pending}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="pt-6">
              {employee.documents?.length > 0 ? (
                <div className="space-y-2">
                  {employee.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.type} — {formatDate(doc.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucun document</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves">
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground py-8">
              Section congés — voir le module Congés pour plus de détails
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              {employee.positionHistory?.length > 0 ? (
                <div className="space-y-3">
                  {employee.positionHistory.map((h: any) => (
                    <div key={h.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <div>
                        <p className="font-medium">{h.positionTitle} — {h.department}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(h.startDate)} → {h.endDate ? formatDate(h.endDate) : 'Actuel'}
                          {h.reason && ` (${h.reason})`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucun historique</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
