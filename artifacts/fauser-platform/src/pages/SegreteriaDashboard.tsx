import { useGetMe, useListUsers, useListClasses } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, AlertCircle, Calendar, Building2 } from "lucide-react";
import { Link, Redirect } from "wouter";
import { RoleGuard } from "@/components/RoleGuard";

export default function SegreteriaDashboard() {
  const { data: me } = useGetMe();
  const { data: students = [] } = useListUsers({ role: "student" } as any);
  const { data: teachers = [] } = useListUsers({ role: "teacher" } as any);
  const { data: classes = [] } = useListClasses();

  if (me && me.role !== "segreteria") {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Segreteria</h1>
        <p className="text-muted-foreground mt-1">
          Benvenuto nella gestione operativa di ITT G. Fauser. Ciao, {me?.firstName}.
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
              <Users className="h-5 w-5" /> Studenti (primi 5)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {students.slice(0, 5).map((s: any) => (
              <div key={s.id} className="flex justify-between border-b last:border-0 py-1">
                <span>{s.firstName} {s.lastName}</span>
                <span className="text-muted-foreground text-xs">{s.email}</span>
              </div>
            ))}
            {students.length > 5 && <Link href="/admin" className="text-primary text-xs">Vedi tutti in Gestione →</Link>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Docenti (primi 5)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {teachers.slice(0, 5).map((t: any) => (
              <div key={t.id} className="flex justify-between border-b last:border-0 py-1">
                <span>{t.firstName} {t.lastName}</span>
                <span className="text-muted-foreground text-xs">{t.email}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="text-xs text-muted-foreground">
        Per gestione completa utenti e classi, usa le sezioni dedicate (Analytics, Certificati, Aule). La sezione Admin è riservata ai tecnici.
      </div>

      <div className="text-sm text-muted-foreground">
        Navigazione laterale: Utenti & Classi, Orario Globale, Uscite, Sondaggi, Comunicazioni istituzionali.
      </div>
    </div>
  );
}
