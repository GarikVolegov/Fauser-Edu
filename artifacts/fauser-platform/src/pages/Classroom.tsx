import {
  useListAssignments,
  useListMaterials,
  useGetMe,
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isAfter } from "date-fns";
import { it } from "date-fns/locale";
import { BookOpen, CalendarIcon, Download, FileText, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function Classroom() {
  const { data: user } = useGetMe();
  const classId = user?.classId || undefined;

  const { data: assignments, isLoading: loadingAssignments } =
    useListAssignments({ classId });
  const { data: materials, isLoading: loadingMaterials } = useListMaterials({
    classId,
  });

  const isTeacher = user?.role === "teacher";

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classroom</h1>
          <p className="text-muted-foreground mt-1">
            Compiti assegnati e materiali didattici per le tue classi.
          </p>
        </div>

        {isTeacher && (
          <div className="flex gap-2">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Compito
            </Button>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Carica Materiale
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="compiti" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="compiti">Compiti</TabsTrigger>
          <TabsTrigger value="materiali">Materiali Didattici</TabsTrigger>
        </TabsList>

        <TabsContent value="compiti" className="mt-6">
          {loadingAssignments ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : assignments && assignments.length > 0 ? (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {assignments.map((assignment) => {
                const isUpcoming = isAfter(
                  new Date(assignment.dueDate),
                  new Date(),
                );

                return (
                  <motion.div variants={item} key={assignment.id}>
                    <Card
                      className={`h-full flex flex-col ${isUpcoming ? "border-primary/20 bg-primary/5" : ""}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="bg-background">
                            {assignment.subjectName}
                          </Badge>
                          <Badge variant={isUpcoming ? "default" : "secondary"}>
                            {isUpcoming ? "In scadenza" : "Scaduto"}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight">
                          {assignment.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 pb-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {assignment.description ||
                            "Nessuna descrizione fornita."}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0 border-t bg-muted/20 px-6 py-3 flex justify-between items-center text-xs text-muted-foreground mt-auto">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span
                            className={
                              isUpcoming ? "text-primary font-medium" : ""
                            }
                          >
                            {format(
                              new Date(assignment.dueDate),
                              "dd MMM yyyy",
                              { locale: it },
                            )}
                          </span>
                        </div>
                        {assignment.attachmentUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                Nessun compito assegnato
              </h3>
              <p className="text-muted-foreground">
                Non ci sono compiti da mostrare per le tue classi.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="materiali" className="mt-6">
          {loadingMaterials ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : materials && materials.length > 0 ? (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {materials.map((material) => (
                <motion.div variants={item} key={material.id}>
                  <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:border-primary/30 transition-colors group">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">
                          {material.title}
                        </h4>
                        <Badge
                          variant="secondary"
                          className="text-[10px] shrink-0"
                        >
                          {material.subjectName}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {material.description || "Materiale didattico"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:block text-xs text-muted-foreground text-right mr-4">
                        <div>
                          {format(new Date(material.createdAt), "dd MMM yyyy", {
                            locale: it,
                          })}
                        </div>
                        {material.fileSize && (
                          <div>
                            {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Scarica</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl">
              <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                Nessun materiale
              </h3>
              <p className="text-muted-foreground">
                Non ci sono materiali didattici condivisi per le tue classi.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
