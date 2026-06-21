import { useGetMe, useListAssignments, useListClasses } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, CalendarCheck2, ClipboardList, Clock } from "lucide-react";
import { Link, Redirect } from "wouter";

export default function TeacherDashboard() {
  const { data: me } = useGetMe();
  const { data: assignments = [] } = useListAssignments();
  const { data: classes = [] } = useListClasses();

  if (me && me.role !== "teacher") {
    return <Redirect to="/dashboard" />;
  }

  const myClasses = classes.filter((c: any) => c.teacherId === me?.id);
  const pending = assignments.filter((a: any) => new Date(a.dueDate) >= new Date()).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Docente</h1>
        <p className="text-muted-foreground mt-1">
          Benvenuto, prof. {me?.firstName}. Ecco il tuo riepilogo didattico.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/registro">
          <Card className="cursor-pointer hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Registro</CardTitle>
                <CardDescription>Inserisci voti e presenze</CardDescription>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{pending} compiti in scadenza</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/colloqui">
          <Card className="cursor-pointer hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Colloqui</CardTitle>
                <CardDescription>Gestisci appuntamenti</CardDescription>
              </div>
              <CalendarCheck2 className="h-8 w-8 text-primary" />
            </CardHeader>
          </Card>
        </Link>

        <Link href="/quiz">
          <Card className="cursor-pointer hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quiz</CardTitle>
                <CardDescription>Crea e monitora</CardDescription>
              </div>
              <ClipboardList className="h-8 w-8 text-primary" />
            </CardHeader>
          </Card>
        </Link>

        <Link href="/comunicazioni">
          <Card className="cursor-pointer hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Comunicazioni</CardTitle>
                <CardDescription>Annunci alle classi</CardDescription>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div>
        <div className="text-sm font-medium mb-2 text-muted-foreground">Azioni rapide</div>
        <div className="flex flex-wrap gap-2">
          <Link href="/registro">
            <Button variant="secondary" size="sm" className="gap-1">
              <BookOpen className="h-4 w-4" /> Apri Registro (Presenze)
            </Button>
          </Link>
          <Link href="/quiz">
            <Button variant="secondary" size="sm" className="gap-1">
              <ClipboardList className="h-4 w-4" /> Crea Quiz veloce
            </Button>
          </Link>
          <Link href="/comunicazioni">
            <Button variant="secondary" size="sm" className="gap-1">
              <Users className="h-4 w-4" /> Invia comunicazione
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Prossime scadenze
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {pending > 0
              ? `${pending} assegnazioni in arrivo. Vai al Registro per gestire.`
              : "Nessuna scadenza imminente."}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Le mie classi</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {myClasses.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {myClasses.slice(0, 4).map((c: any) => (
                  <li key={c.id}>{c.name || `${c.anno}${c.sezione}`}</li>
                ))}
              </ul>
            ) : (
              <div className="text-muted-foreground">Nessuna classe assegnata al momento.</div>
            )}
            <div className="mt-3">
              <Link href="/registro" className="text-primary underline text-sm">Vai al Registro →</Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-sm text-muted-foreground">
        Usa la sidebar per Orario, Materiali, Note comportamento e Forum delle tue classi.
      </div>
    </div>
  );
}
