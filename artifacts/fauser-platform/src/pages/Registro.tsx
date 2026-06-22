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
  useListSubjects,
  useListClasses,
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
import { RoleGuard } from "@/components/RoleGuard";
import { useApi } from "@/lib/useApi";

interface BehaviorNote {
  id: number;
  studentId: number;
  type: string;
  description: string;
  date: string;
  studentName?: string;
  teacherName?: string;
}

export default function Registro() {
  const { data: user } = useGetMe();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const api = useApi();
  const studentId = user?.role === "student" ? user.id : undefined;

  // Teacher add grade dialog state
  const [isAddGradeOpen, setIsAddGradeOpen] = useState(false);
  const [newGrade, setNewGrade] = useState({
    studentId: "",
    subjectId: "",
    value: "",
    type: "orale",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Deep-link params (e.g. from OggiTeacher "Fai l'appello")
  const deepLinkParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const initialTab = deepLinkParams.get("tab") ?? "voti";
  const initialClassId = deepLinkParams.get("classId") ?? "";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Quick attendance (teacher) state
  const [quickAtt, setQuickAtt] = useState({
    classId: initialClassId,
    studentId: "",
    date: new Date().toISOString().split("T")[0],
    status: "presente",
    note: "",
  });

  const { data: subjects = [] } = useListSubjects();
  const { data: classes = [] } = useListClasses();

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

  const {
    data: behaviorNotes = [],
    isLoading: loadingNotes,
    isError: notesError,
  } = useQuery<BehaviorNote[]>({
    queryKey: ["behaviorNotes", studentId],
    queryFn: () =>
      api<BehaviorNote[]>(
        studentId
          ? `/api/behavior-notes?studentId=${studentId}`
          : "/api/behavior-notes",
      ),
  });

  const createNote = useMutation({
    mutationFn: (data: {
      studentId: number;
      teacherId: number;
      type: string;
      description: string;
      date: string;
    }) => api("/api/behavior-notes", { method: "POST", body: data }),
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
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiungere la nota.",
        variant: "destructive",
      });
    },
  });

  const createGradeMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      const r = await fetch("/api/grades", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || "Errore nel salvataggio del voto");
      }
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      queryClient.invalidateQueries({ queryKey: ["gradesSummary"] });
      toast({ title: "Voto aggiunto" });
      setIsAddGradeOpen(false);
      setNewGrade({
        studentId: "",
        subjectId: "",
        value: "",
        type: "orale",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
    },
    onError: (err: any) => {
      toast({
        title: "Errore",
        description: err.message || "Impossibile aggiungere il voto",
        variant: "destructive" as any,
      });
    },
  });

  // Quick attendance mutation (re-uses pattern from this file)
  const createAttendanceMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      const r = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || "Errore nel salvataggio");
      }
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceSummary"] });
      toast({ title: "Presenza registrata" });
      setQuickAtt((prev) => ({
        ...prev,
        studentId: "",
        // keep classId and date for rapid multi-marks
      }));
    },
    onError: (err: any) => {
      toast({
        title: "Errore",
        description: err.message || "Impossibile registrare",
        variant: "destructive" as any,
      });
    },
  });

  // Helper for quick marks from student list (uses selected class or student's classId)
  const quickMark = (
    studentId: number | string,
    status: string,
    note?: string,
  ) => {
    const student = students.find(
      (s: any) => String(s.id) === String(studentId),
    );
    const classIdStr =
      quickAtt.classId || (student?.classId ? String(student.classId) : "");
    if (!classIdStr) {
      toast({
        title: "Seleziona una classe",
        description:
          "Scegli la classe dal selettore per segnare presenze rapide.",
      });
      return;
    }
    createAttendanceMutation.mutate({
      studentId: parseInt(String(studentId)),
      classId: parseInt(classIdStr),
      date: new Date().toISOString().split("T")[0],
      status,
      note: note || null,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Registro Elettronico
        </h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === "teacher" ||
          user?.role === "segreteria" ||
          user?.role === "admin"
            ? "Gestione voti, presenze e note per le classi."
            : "Consulta i tuoi voti e le presenze scolastiche."}
        </p>
      </div>

      <RoleGuard allowedRoles={["teacher"]}>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-700 flex items-center justify-between">
          Modalità docente: puoi inserire voti, presenze e note di
          comportamento.
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab("presenze")}
            >
              Segna presenze
            </Button>
            <Button size="sm" onClick={() => setIsAddGradeOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Aggiungi voto
            </Button>
          </div>
        </div>
      </RoleGuard>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
          {user?.role === "teacher" && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-700">
              Modalità docente: segna presenze rapide qui sotto (o consulta
              riepilogo).
            </div>
          )}

          <RoleGuard allowedRoles={["teacher"]}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Segna Presenza Rapida
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <Label>Classe</Label>
                    <Select
                      value={quickAtt.classId}
                      onValueChange={(v) =>
                        setQuickAtt((p) => ({ ...p, classId: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c: any) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {(c as any).anno}
                            {(c as any).sezione || ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Studente</Label>
                    <Select
                      value={quickAtt.studentId}
                      onValueChange={(v) =>
                        setQuickAtt((p) => ({ ...p, studentId: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona studente" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s: any) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.firstName} {s.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={quickAtt.date}
                      onChange={(e) =>
                        setQuickAtt((p) => ({ ...p, date: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Stato</Label>
                    <Select
                      value={quickAtt.status}
                      onValueChange={(v) =>
                        setQuickAtt((p) => ({ ...p, status: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presente">Presente</SelectItem>
                        <SelectItem value="assente">Assente</SelectItem>
                        <SelectItem value="ritardo">Ritardo</SelectItem>
                        <SelectItem value="uscita_anticipata">
                          Uscita anticipata
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-1 flex items-end">
                    <Button
                      className="w-full"
                      onClick={() => {
                        if (!quickAtt.studentId || !quickAtt.classId) return;
                        createAttendanceMutation.mutate({
                          studentId: parseInt(quickAtt.studentId),
                          classId: parseInt(quickAtt.classId),
                          date: quickAtt.date,
                          status: quickAtt.status,
                          note: quickAtt.note || null,
                        });
                      }}
                      disabled={
                        !quickAtt.studentId ||
                        !quickAtt.classId ||
                        createAttendanceMutation?.isPending
                      }
                    >
                      Segna presenza
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Note (opzionale)</Label>
                  <Input
                    value={quickAtt.note}
                    onChange={(e) =>
                      setQuickAtt((p) => ({ ...p, note: e.target.value }))
                    }
                    placeholder="Motivo ritardo / uscita..."
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Usa anche la lista studenti in Note o aggiungi voti nel tab
                  Voti. (classId dallo studente non sempre presente; seleziona
                  classe.)
                </div>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Lista studenti con quick actions - arricchimento per prof */}
          <RoleGuard allowedRoles={["teacher"]}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Lista studenti — Segna presenze rapide
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Classe selezionata:{" "}
                  {quickAtt.classId ? `#${quickAtt.classId}` : "nessuna"} — usa
                  il selettore sopra. Clicca per marcare oggi.{" "}
                  {quickAtt.classId ? "(filtrata per classe)" : ""}
                </p>
              </CardHeader>
              <CardContent>
                {(() => {
                  const filtered = quickAtt.classId
                    ? students.filter(
                        (s: any) =>
                          String(s.classId || "") === quickAtt.classId,
                      )
                    : students;
                  if (filtered.length === 0) {
                    return (
                      <p className="text-sm text-muted-foreground">
                        Nessuno studente disponibile per la classe selezionata.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
                      {filtered.slice(0, 20).map((s: any) => {
                        const studentClass = s.classId
                          ? ` (cl. ${s.classId})`
                          : "";
                        const isPending = createAttendanceMutation.isPending;
                        return (
                          <div
                            key={s.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border rounded-md p-2 hover:bg-muted/30"
                          >
                            <div className="text-sm font-medium">
                              {s.firstName} {s.lastName}
                              <span className="text-muted-foreground ml-1 text-xs">
                                {studentClass}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                disabled={isPending}
                                onClick={() => quickMark(s.id, "presente")}
                              >
                                ✓ Pres.
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                disabled={isPending}
                                onClick={() => quickMark(s.id, "assente")}
                              >
                                ✗ Ass.
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                disabled={isPending}
                                onClick={() => quickMark(s.id, "ritardo")}
                              >
                                ⏱ Rit.
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                disabled={isPending}
                                onClick={() =>
                                  quickMark(s.id, "uscita_anticipata")
                                }
                              >
                                🚪 Usc.
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      {filtered.length > 20 && (
                        <div className="text-[10px] text-muted-foreground text-center pt-1">
                          Mostrati i primi 20. Usa il form sopra per altri.
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </RoleGuard>

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
            <RoleGuard allowedRoles={["teacher", "admin"]}>
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
            </RoleGuard>
          </div>

          <Card>
            <CardContent className="p-6">
              {loadingNotes ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : notesError ? (
                <div className="text-center py-8 text-destructive">
                  Impossibile caricare le note. Riprova più tardi.
                </div>
              ) : behaviorNotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nessuna nota registrata.
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">
                  {behaviorNotes.map((note: BehaviorNote) => {
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

      {/* Add Grade Dialog for Teachers */}
      <Dialog open={isAddGradeOpen} onOpenChange={setIsAddGradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Voto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Studente</Label>
              <Select
                value={newGrade.studentId}
                onValueChange={(v) =>
                  setNewGrade((g) => ({ ...g, studentId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona studente" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s: any) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.firstName} {s.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Materia</Label>
              <Select
                value={newGrade.subjectId}
                onValueChange={(v) =>
                  setNewGrade((g) => ({ ...g, subjectId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona materia" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s: any) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Voto</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={newGrade.value}
                  onChange={(e) =>
                    setNewGrade((g) => ({ ...g, value: e.target.value }))
                  }
                  placeholder="es. 7.5"
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select
                  value={newGrade.type}
                  onValueChange={(v) => setNewGrade((g) => ({ ...g, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orale">Orale</SelectItem>
                    <SelectItem value="scritto">Scritto</SelectItem>
                    <SelectItem value="pratico">Pratico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={newGrade.date}
                onChange={(e) =>
                  setNewGrade((g) => ({ ...g, date: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Descrizione (opzionale)</Label>
              <Textarea
                value={newGrade.description}
                onChange={(e) =>
                  setNewGrade((g) => ({ ...g, description: e.target.value }))
                }
                placeholder="Commento sul voto..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddGradeOpen(false)}>
              Annulla
            </Button>
            <Button
              onClick={() =>
                createGradeMutation.mutate({
                  studentId: parseInt(newGrade.studentId),
                  subjectId: parseInt(newGrade.subjectId),
                  value: parseFloat(newGrade.value),
                  type: newGrade.type,
                  description: newGrade.description || null,
                  date: newGrade.date,
                })
              }
              disabled={
                !newGrade.studentId ||
                !newGrade.subjectId ||
                !newGrade.value ||
                createGradeMutation.isPending
              }
            >
              Salva voto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
