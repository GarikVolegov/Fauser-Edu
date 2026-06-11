import { useState } from "react";
import { 
  useGetGradesSummary, 
  useListGrades, 
  useGetAttendanceSummary, 
  useListAttendance,
  useGetMe
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export default function Registro() {
  const { data: user } = useGetMe();
  const studentId = user?.role === 'student' ? user.id : undefined;

  const { data: gradesSummary, isLoading: loadingSummary } = useGetGradesSummary({ studentId });
  const { data: grades, isLoading: loadingGrades } = useListGrades({ studentId });
  const { data: attendanceSummary, isLoading: loadingAttSummary } = useGetAttendanceSummary({ studentId });
  const { data: attendance, isLoading: loadingAtt } = useListAttendance({ studentId });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registro Elettronico</h1>
        <p className="text-muted-foreground mt-1">Consulta i tuoi voti e le presenze scolastiche.</p>
      </div>

      <Tabs defaultValue="voti" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="voti">Voti</TabsTrigger>
          <TabsTrigger value="presenze">Presenze</TabsTrigger>
        </TabsList>
        
        <TabsContent value="voti" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Media Generale</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSummary ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-3xl font-bold">
                    {gradesSummary && gradesSummary.length > 0 
                      ? (gradesSummary.reduce((acc, curr) => acc + curr.average, 0) / gradesSummary.length).toFixed(1) 
                      : "-"}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Materie Insufficienti</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSummary ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-3xl font-bold text-destructive">
                    {gradesSummary?.filter(s => s.average < 6).length || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Totale Valutazioni</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSummary ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-3xl font-bold">
                    {gradesSummary?.reduce((acc, curr) => acc + curr.count, 0) || 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Riepilogo per Materia</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : gradesSummary && gradesSummary.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Materia</TableHead>
                      <TableHead className="text-center">Voti</TableHead>
                      <TableHead className="text-center">Min / Max</TableHead>
                      <TableHead className="text-right">Media</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradesSummary.map((subject) => (
                      <TableRow key={subject.subjectId}>
                        <TableCell className="font-medium">{subject.subjectName}</TableCell>
                        <TableCell className="text-center">{subject.count}</TableCell>
                        <TableCell className="text-center text-muted-foreground text-sm">
                          {subject.min} / {subject.max}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          <span className={subject.average >= 6 ? "text-green-600" : "text-destructive"}>
                            {subject.average.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">Nessun riepilogo disponibile.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ultimi Voti</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingGrades ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : grades && grades.length > 0 ? (
                <div className="space-y-3">
                  {grades.slice(0, 10).map((grade) => (
                    <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{grade.subjectName}</span>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {grade.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex gap-2">
                          <span>{format(new Date(grade.date), "dd MMMM yyyy", { locale: it })}</span>
                          {grade.description && (
                            <>
                              <span>•</span>
                              <span>{grade.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${grade.value >= 6 ? 'text-green-600' : 'text-destructive'}`}>
                        {grade.value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Nessun voto registrato.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="presenze" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Frequenza</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAttSummary ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-3xl font-bold text-primary">
                    {attendanceSummary?.percentualePresenza || 100}%
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Assenze</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAttSummary ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-3xl font-bold text-destructive">
                    {attendanceSummary?.assenti || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ritardi</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAttSummary ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-3xl font-bold text-amber-500">
                    {attendanceSummary?.ritardi || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Uscite Anticipate</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAttSummary ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-3xl font-bold text-orange-500">
                    {attendanceSummary?.usciteAnticipate || 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dettaglio Assenze e Ritardi</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAtt ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : attendance && attendance.filter(a => a.status !== 'presente').length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.filter(a => a.status !== 'presente').map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {format(new Date(record.date), "dd MMMM yyyy", { locale: it })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            record.status === 'assente' ? 'destructive' : 
                            record.status === 'ritardo' ? 'default' : 'secondary'
                          } className={record.status === 'ritardo' ? 'bg-amber-500 hover:bg-amber-600' : ''}>
                            {record.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.note || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                  Nessuna assenza o ritardo da mostrare. Ottimo lavoro!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
