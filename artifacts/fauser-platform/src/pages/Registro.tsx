import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import {
  useGetGradesSummary,
  useListGrades,
  useGetAttendanceSummary,
  useListAttendance,
  useGetMe,
  useListUsers,
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { ShieldAlert, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Registro() {
  const { data: user } = useGetMe();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const studentId = user?.role === "student" ? user.id : undefined;

  const { data: gradesSummary, isLoading: loadingSummary } =
    useGetGradesSummary({ studentId });
  const { data: grades, isLoading: loadingGrades } = useListGrades({
    studentId,
  });
  const { data: attendanceSummary, isLoading: loadingAttSummary } =
    useGetAttendanceSummary({ studentId });
  const { data: attendance, isLoading: loadingAtt } = useListAttendance({
    studentId,
  });

  // Behavior notes logic
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    studentId: "",
    type: "nota",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });
  const { data: students = [] } = useListUsers({ role: "student" } as any);

  const { data: behaviorNotes = [], isLoading: loadingNotes } = useQuery({
    queryKey: ["behaviorNotes", studentId],
    queryFn: async () => {
      const token = await getToken();
      const url = studentId
        ? `/api/behavior-notes?studentId=${studentId}`
        : "/api/behavior-notes";
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return [];
      return r.json();
    },
  });

  const createNote = useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      const r = await fetch("/api/behavior-notes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error("Errore");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["behaviorNotes"] });
      toast({ title: "Nota aggiunta" });
      setIsNoteDialogOpen(false);
      setNewNote({
        studentId: "",
        type: "nota",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
      });
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Registro Elettronico
        </h1>
        <p className="text-muted-foreground mt-1">
          Consulta i tuoi voti e le presenze scolastiche.
        </p>
      </div>

      <Tabs defaultValue="voti" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="voti">Voti</TabsTrigger>
          <TabsTrigger value="presenze">Presenze</TabsTrigger>
          <TabsTrigger value="note" className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Note
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voti" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Media Generale
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSummary ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold">
                    {gradesSummary && gradesSummary.length > 0
                      ? (
                          gradesSummary.reduce(
                            (acc, curr) => acc + curr.average,
                            0,
                          ) / gradesSummary.length
                        ).toFixed(1)
                      : "-"}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Materie Insufficienti
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSummary ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold text-destructive">
                    {gradesSummary?.filter((s) => s.average < 6).length || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Totale Valutazioni
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSummary ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold">
                    {gradesSummary?.reduce(
                      (acc, curr) => acc + curr.count,
                      0,
                    ) || 0}
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
                        <TableCell className="font-medium">
                          {subject.subjectName}
                        </TableCell>
                        <TableCell className="text-center">
                          {subject.count}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground text-sm">
                          {subject.min} / {subject.max}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          <span
                            className={
                              subject.average >= 6
                                ? "text-green-600"
                                : "text-destructive"
                            }
                          >
                            {subject.average.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Nessun riepilogo disponibile.
                </p>
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
                    <div
                      key={grade.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {grade.subjectName}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase"
                          >
                            {grade.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex gap-2">
                          <span>
                            {format(new Date(grade.date), "dd MMMM yyyy", {
                              locale: it,
                            })}
                          </span>
                          {grade.description && (
                            <>
                              <span>•</span>
                              <span>{grade.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div
                        className={`text-2xl font-bold ${grade.value >= 6 ? "text-green-600" : "text-destructive"}`}
                      >
                        {grade.value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Nessun voto registrato.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presenze" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Frequenza
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAttSummary ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold text-primary">
                    {attendanceSummary?.percentualePresenza || 100}%
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Assenze
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAttSummary ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold text-destructive">
                    {attendanceSummary?.assenti || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ritardi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAttSummary ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold text-amber-500">
                    {attendanceSummary?.ritardi || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Uscite Anticipate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAttSummary ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
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
              ) : attendance &&
                attendance.filter((a) => a.status !== "presente").length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance
                      .filter((a) => a.status !== "presente")
                      .map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {format(new Date(record.date), "dd MMMM yyyy", {
                              locale: it,
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.status === "assente"
                                  ? "destructive"
                                  : record.status === "ritardo"
                                    ? "default"
                                    : "secondary"
                              }
                              className={
                                record.status === "ritardo"
                                  ? "bg-amber-500 hover:bg-amber-600"
                                  : ""
                              }
                            >
                              {record.status.replace("_", " ")}
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

        <TabsContent value="note" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              Note Disciplinari e Riconoscimenti
            </h2>
            {user?.role === "teacher" && (
              <Dialog
                open={isNoteDialogOpen}
                onOpenChange={setIsNoteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Aggiungi nota
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Aggiungi nota disciplinare</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Studente</Label>
                      <Select
                        value={newNote.studentId}
                        onValueChange={(v) =>
                          setNewNote((p) => ({ ...p, studentId: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona studente" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((s: any) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.firstName} {s.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={newNote.type}
                        onValueChange={(v) =>
                          setNewNote((p) => ({ ...p, type: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nota">
                            Nota disciplinare
                          </SelectItem>
                          <SelectItem value="sospensione">
                            Sospensione
                          </SelectItem>
                          <SelectItem value="lode">
                            Lode/Nota di merito
                          </SelectItem>
                          <SelectItem value="altro">Altro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={newNote.date}
                        onChange={(e) =>
                          setNewNote((p) => ({ ...p, date: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrizione</Label>
                      <Textarea
                        value={newNote.description}
                        onChange={(e) =>
                          setNewNote((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={() =>
                        createNote.mutate({
                          studentId: parseInt(newNote.studentId),
                          teacherId: user.id,
                          type: newNote.type,
                          description: newNote.description,
                          date: newNote.date,
                        })
                      }
                      disabled={
                        !newNote.studentId ||
                        !newNote.description ||
                        createNote.isPending
                      }
                    >
                      Salva nota
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Card>
            <CardContent className="p-6">
              {loadingNotes ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : behaviorNotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nessuna nota registrata.
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">
                  {behaviorNotes.map((note: any) => {
                    const isPositive = note.type === "lode";
                    const isSevere = note.type === "sospensione";
                    const isWarning = note.type === "nota";

                    return (
                      <div
                        key={note.id}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${
                            isPositive
                              ? "bg-green-500"
                              : isSevere
                                ? "bg-destructive"
                                : isWarning
                                  ? "bg-amber-500"
                                  : "bg-muted-foreground"
                          }`}
                        >
                          <ShieldAlert className="w-4 h-4 text-white" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-card shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant={isSevere ? "destructive" : "outline"}
                              className={
                                isPositive
                                  ? "bg-green-100 text-green-800"
                                  : isWarning
                                    ? "bg-amber-100 text-amber-800"
                                    : ""
                              }
                            >
                              {note.type.toUpperCase()}
                            </Badge>
                            <time className="text-xs text-muted-foreground font-medium">
                              {format(new Date(note.date), "dd/MM/yyyy")}
                            </time>
                          </div>
                          {user?.role === "teacher" && (
                            <div className="text-sm font-semibold mb-1">
                              Studente: {note.studentName}
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground mb-2">
                            {note.description}
                          </p>
                          <div className="text-xs text-muted-foreground text-right mt-2 pt-2 border-t">
                            Docente: {note.teacherName}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
