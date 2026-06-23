import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/useApi";
import { useGetMe } from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Award, GraduationCap, Users } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";

interface Competency {
  id: number;
  name: string;
  description?: string;
  subjectName: string;
}
interface StudentCompetency {
  competencyId: number;
  level: number;
}
interface GroupedComp extends Competency {
  studentLevel: number;
}

export default function Portfolio() {
  const { data: user } = useGetMe();
  const api = useApi();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const isTeacher = user?.role === "admin" || user?.role === "teacher";

  const studentIdToFetch = isTeacher ? selectedStudentId : user?.id?.toString();

  const { data: competencies = [], isError: competenciesError } = useQuery<
    Competency[]
  >({
    queryKey: ["competencies"],
    queryFn: () => api<Competency[]>("/api/competencies"),
  });

  const {
    data: studentComps = [],
    isLoading,
    isError: studentCompsError,
  } = useQuery<StudentCompetency[]>({
    queryKey: ["student-competencies", studentIdToFetch],
    enabled: !!studentIdToFetch,
    queryFn: () =>
      api<StudentCompetency[]>(
        `/api/student-competencies?studentId=${studentIdToFetch}`,
      ),
  });

  const getLevelBadge = (level: number) => {
    switch (level) {
      case 3:
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            Avanzato
          </Badge>
        );
      case 2:
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
            Intermedio
          </Badge>
        );
      case 1:
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
            Base
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Non valutato
          </Badge>
        );
    }
  };

  const grouped = competencies.reduce<Record<string, GroupedComp[]>>(
    (acc, comp) => {
      if (!acc[comp.subjectName]) acc[comp.subjectName] = [];
      const sc = studentComps.find((s) => s.competencyId === comp.id);
      acc[comp.subjectName].push({ ...comp, studentLevel: sc?.level || 0 });
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Portfolio Competenze
          </h1>
          <p className="text-muted-foreground mt-1">
            Traccia lo sviluppo delle competenze acquisite.
          </p>
        </div>
        <RoleGuard allowedRoles={["teacher", "admin"]}>
          {isTeacher && (
            <div className="flex gap-4 items-center">
              <Select
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Seleziona studente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Mario Rossi</SelectItem>
                  <SelectItem value="2">Giulia Bianchi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </RoleGuard>
      </div>

      {!studentIdToFetch && isTeacher ? (
        <Card className="flex flex-col items-center justify-center h-64 text-center p-6 border-dashed">
          <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <CardTitle className="text-xl">Seleziona uno studente</CardTitle>
          <CardDescription>
            Scegli uno studente dal menu per visualizzare e valutare il suo
            portfolio.
          </CardDescription>
        </Card>
      ) : isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : competenciesError || studentCompsError ? (
        <Card className="flex flex-col items-center justify-center h-48 text-center p-6 border-dashed">
          <Award className="h-10 w-10 text-destructive mb-4" />
          <CardTitle className="text-lg text-destructive">
            Errore di caricamento
          </CardTitle>
          <CardDescription>
            Impossibile caricare il portfolio. Riprova più tardi.
          </CardDescription>
        </Card>
      ) : Object.keys(grouped).length === 0 ? (
        <Card className="flex flex-col items-center justify-center h-48 text-center p-6 border-dashed">
          <Award className="h-10 w-10 text-muted-foreground mb-4" />
          <CardTitle className="text-lg">Nessuna competenza definita</CardTitle>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([subject, comps], idx) => {
            const avgLevel =
              comps.reduce((acc, c) => acc + c.studentLevel, 0) /
              (comps.length || 1);
            const progress = (avgLevel / 3) * 100;

            return (
              <motion.div
                key={subject}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />{" "}
                        {subject}
                      </CardTitle>
                      <span className="text-sm font-medium">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {comps.map((c) => (
                        <div
                          key={c.id}
                          className="p-4 rounded-lg border bg-card hover:bg-muted/10 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <h4 className="font-semibold">{c.name}</h4>
                              {getLevelBadge(c.studentLevel)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              {c.description}
                            </p>
                          </div>
                          <RoleGuard allowedRoles={["teacher", "admin"]}>
                            {isTeacher && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-auto"
                              >
                                Valuta Competenza
                              </Button>
                            )}
                          </RoleGuard>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
