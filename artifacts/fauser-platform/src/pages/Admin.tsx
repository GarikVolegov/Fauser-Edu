import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe, useListClasses, useListUsers, useListSubjects, useCreateClass } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Users, GraduationCap, BookOpen, Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { data: user } = useGetMe();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: classes = [] } = useListClasses();
  const { data: students = [] } = useListUsers({ role: "student" } as any);
  const { data: teachers = [] } = useListUsers({ role: "teacher" } as any);
  const { data: subjects = [] } = useListSubjects();

  const createClass = useCreateClass({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["classes"] });
        toast({ title: "Classe creata" });
        setNewClass({ anno: 1, sezione: "A", indirizzo: "Informatica" });
        setIsClassDialogOpen(false);
      }
    }
  });

  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({ anno: 1, sezione: "A", indirizzo: "Informatica" });
  const [studentSearch, setStudentSearch] = useState("");

  if (user && user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <ShieldCheck className="w-12 h-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Accesso Negato</h2>
            <p className="text-muted-foreground">Questa area è riservata esclusivamente agli amministratori della piattaforma.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredStudents = students.filter((s: any) => 
    s.firstName?.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.lastName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.primaryEmailAddress?.emailAddress?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <ShieldCheck className="h-8 w-8" /> Amministrazione
        </h1>
        <p className="text-muted-foreground mt-1">Pannello di controllo della piattaforma.</p>
      </div>

      <Tabs defaultValue="panoramica" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:max-w-2xl mb-8">
          <TabsTrigger value="panoramica">Panoramica</TabsTrigger>
          <TabsTrigger value="classi">Classi</TabsTrigger>
          <TabsTrigger value="studenti">Studenti</TabsTrigger>
          <TabsTrigger value="docenti">Docenti</TabsTrigger>
        </TabsList>
        
        <TabsContent value="panoramica" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-primary text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Studenti Iscritti</CardTitle>
                <GraduationCap className="h-4 w-4 opacity-70" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{students.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Docenti</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{teachers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Classi Attive</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{classes.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Materie</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{subjects.length}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classi" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Gestione Classi</h2>
            <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Nuova classe</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Aggiungi nuova classe</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Anno</Label>
                      <Input 
                        type="number" min="1" max="5" 
                        value={newClass.anno} 
                        onChange={e => setNewClass(p => ({ ...p, anno: parseInt(e.target.value) || 1 }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sezione</Label>
                      <Input 
                        value={newClass.sezione} 
                        onChange={e => setNewClass(p => ({ ...p, sezione: e.target.value.toUpperCase() }))} 
                        maxLength={2}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Indirizzo</Label>
                    <Select value={newClass.indirizzo} onValueChange={v => setNewClass(p => ({ ...p, indirizzo: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Informatica">Informatica e Telecomunicazioni</SelectItem>
                        <SelectItem value="Logistica">Trasporti e Logistica</SelectItem>
                        <SelectItem value="Aeronautica">Costruzioni Aeronautiche</SelectItem>
                        <SelectItem value="Elettronica">Elettronica ed Elettrotecnica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={() => createClass.mutate({ data: { anno: newClass.anno, sezione: newClass.sezione, indirizzo: newClass.indirizzo } as any })}
                    disabled={createClass.isPending || !newClass.sezione}
                    className="mt-2"
                  >
                    Salva classe
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Classe</TableHead>
                  <TableHead>Indirizzo</TableHead>
                  <TableHead className="text-right">Azione</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-bold text-lg">{c.year}{c.section}</TableCell>
                    <TableCell>{c.indirizzo}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Dettagli</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="studenti" className="space-y-6">
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cerca studente..." 
                className="pl-10"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
              />
            </div>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cognome</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.slice(0, 50).map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.firstName}</TableCell>
                    <TableCell className="font-medium">{s.lastName}</TableCell>
                    <TableCell className="text-muted-foreground">{s.primaryEmailAddress?.emailAddress}</TableCell>
                  </TableRow>
                ))}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Nessuno studente trovato.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="docenti" className="space-y-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cognome</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.firstName}</TableCell>
                    <TableCell className="font-medium">{t.lastName}</TableCell>
                    <TableCell className="text-muted-foreground">{t.primaryEmailAddress?.emailAddress}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
