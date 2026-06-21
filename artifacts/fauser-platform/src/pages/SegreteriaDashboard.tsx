import { useState } from "react";
import { useGetMe, useListUsers, useListClasses } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, FileText, AlertCircle, Calendar, Building2, Search } from "lucide-react";
import { Link, Redirect } from "wouter";
import { RoleGuard } from "@/components/RoleGuard";

export default function SegreteriaDashboard() {
  const { data: me } = useGetMe();
  const { data: studentsRaw = [] } = useListUsers({ role: "student" } as any);
  const { data: teachersRaw = [] } = useListUsers({ role: "teacher" } as any);
  const { data: classes = [] } = useListClasses();

  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");
  const [studentClassFilter, setStudentClassFilter] = useState("");

  const students = studentsRaw.filter((s: any) => {
    const matchesSearch = `${s.firstName} ${s.lastName} ${s.email || ""}`.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesClass = !studentClassFilter || String(s.classId) === studentClassFilter;
    return matchesSearch && matchesClass;
  });
  const teachers = teachersRaw.filter((t: any) =>
    `${t.firstName} ${t.lastName} ${t.email || ""}`.toLowerCase().includes(teacherSearch.toLowerCase())
  );
  const filteredClasses = classes.filter((c: any) =>
    `${c.anno || ""}${c.sezione || ""} ${c.indirizzo || ""}`.toLowerCase().includes(classSearch.toLowerCase())
  );

  if (me && me.role !== "segreteria") {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Segreteria</h1>
        <p className="text-muted-foreground mt-1">
          Benvenuto nella gestione operativa di ITT G. Fauser. Ciao, {me?.firstName}. Qui puoi consultare e gestire in modo leggero utenti e classi.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Studenti</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Totali</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Docenti</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">Organico</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classi</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">Attive</p>
          </CardContent>
        </Card>

        <RoleGuard allowedRoles={["segreteria", "admin"]}>
          <Link href="/giustificazioni">
            <Card className="cursor-pointer hover:shadow transition h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <AlertCircle className="h-4 w-4" /> Giustificazioni
                </CardTitle>
                <CardDescription>Approva in sospeso</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </RoleGuard>

        <Link href="/aule">
          <Card className="cursor-pointer hover:shadow transition h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" /> Aule & Orario
              </CardTitle>
              <CardDescription>Gestione spazi</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div>
        <div className="text-sm font-medium mb-2 text-muted-foreground">Azioni rapide</div>
        <div className="flex flex-wrap gap-2">
          <Link href="/giustificazioni">
            <Button variant="secondary" size="sm" className="gap-1">
              <AlertCircle className="h-4 w-4" /> Gestisci Giustificazioni
            </Button>
          </Link>
          <Link href="/certificati">
            <Button variant="secondary" size="sm" className="gap-1">
              <FileText className="h-4 w-4" /> Emetti Certificati
            </Button>
          </Link>
          <Link href="/aule">
            <Button variant="secondary" size="sm" className="gap-1">
              <Calendar className="h-4 w-4" /> Gestione Aule
            </Button>
          </Link>
          <Link href="/analytics">
            <Button variant="secondary" size="sm" className="gap-1">
              <Users className="h-4 w-4" /> Vedi Analytics
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/certificati">
          <Card className="cursor-pointer hover:shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText /> Certificati
              </CardTitle>
              <CardDescription>Emissione e archivio certificati</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/analytics">
          <Card className="cursor-pointer hover:shadow">
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Statistiche generali della scuola</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Studenti
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca studenti..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={studentClassFilter} onValueChange={setStudentClassFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tutte le classi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tutte le classi</SelectItem>
                  {classes.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.anno}{c.sezione}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length > 0 ? (
                    students.slice(0, 12).map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{s.email}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Nessun risultato</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {students.length > 12 && <p className="text-xs text-muted-foreground mt-2">Mostrati i primi 12 risultati.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Docenti
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca docenti..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.length > 0 ? (
                    teachers.slice(0, 12).map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.firstName} {t.lastName}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{t.email}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Nessun risultato</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {teachers.length > 12 && <p className="text-xs text-muted-foreground mt-2">Mostrati i primi 12 risultati.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Classi
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca classi..."
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Classe</TableHead>
                  <TableHead>Indirizzo</TableHead>
                  <TableHead className="text-right">ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.length > 0 ? (
                  filteredClasses.slice(0, 10).map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.anno}{c.sezione}</TableCell>
                      <TableCell>{c.indirizzo || "-"}</TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs">{c.id}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Nessun risultato</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Vista leggera per segreteria. Gestione completa classi riservata ad Admin.</p>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        Questa è la vista operativa leggera per segreteria. Per operazioni tecniche o creazione avanzata classi/utenti privilegiati, usa la sezione Admin.
      </div>
    </div>
  );
}
