import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { useGetMe, useListUsers } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { CalendarCheck2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AppointmentType = {
  id: number;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  date: string;
  timeSlot: string;
  status: string;
  notes?: string;
  createdAt: string;
};

export default function Colloqui() {
  const { data: user } = useGetMe();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [date, setDate] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const { data: teachers = [] } = useListUsers({ role: "teacher" } as any);

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const token = await getToken();
      const param =
        user?.role === "teacher"
          ? `teacherId=${user?.id}`
          : `studentId=${user?.id}`;
      const r = await fetch(`/api/appointments?${param}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return [];
      return r.json() as Promise<AppointmentType[]>;
    },
    enabled: !!user?.id,
  });

  const { data: teacherAppointments = [] } = useQuery({
    queryKey: ["appointments", selectedTeacher, date],
    queryFn: async () => {
      const token = await getToken();
      const r = await fetch(
        `/api/appointments?teacherId=${selectedTeacher}&date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!r.ok) return [];
      return r.json() as Promise<AppointmentType[]>;
    },
    enabled: !!selectedTeacher && !!date,
  });

  const createAppointment = useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      const r = await fetch("/api/appointments", {
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
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Colloquio prenotato",
        description: "In attesa di conferma del docente.",
      });
      setSelectedTeacher(null);
      setDate("");
      setTimeSlot("");
      setNotes("");
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (data: {
      id: number;
      status: "confirmed" | "cancelled";
    }) => {
      const token = await getToken();
      const r = await fetch(`/api/appointments/${data.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: data.status }),
      });
      if (!r.ok) throw new Error("Errore");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Stato aggiornato" });
    },
  });

  const timeSlots = ["14:30", "15:00", "15:30", "16:00", "16:30"];
  const occupiedSlots = new Set(
    teacherAppointments
      .filter((a) => a.status !== "cancelled")
      .map((a) => a.timeSlot),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Colloqui</h1>
        <p className="text-muted-foreground mt-1">
          Prenota e gestisci i colloqui con i docenti.
        </p>
      </div>

      <Tabs defaultValue="miei-colloqui" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          {user?.role === "student" && (
            <TabsTrigger value="prenota">Prenota</TabsTrigger>
          )}
          <TabsTrigger value="miei-colloqui">I miei colloqui</TabsTrigger>
        </TabsList>

        {user?.role === "student" && (
          <TabsContent value="prenota" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prenota un colloquio</CardTitle>
                <CardDescription>
                  Seleziona un docente, una data e un orario.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedTeacher ? (
                  <div className="space-y-4">
                    <Label>1. Seleziona Docente</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {teachers.map((t: any) => (
                        <Card
                          key={t.id}
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => setSelectedTeacher(t.id)}
                        >
                          <CardContent className="p-4 flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {t.firstName?.charAt(0)}
                                {t.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">
                                {t.firstName} {t.lastName}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-md">
                    <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {teachers
                              .find((t: any) => t.id === selectedTeacher)
                              ?.firstName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {
                            teachers.find((t: any) => t.id === selectedTeacher)
                              ?.firstName
                          }{" "}
                          {
                            teachers.find((t: any) => t.id === selectedTeacher)
                              ?.lastName
                          }
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTeacher(null)}
                      >
                        Cambia
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>2. Seleziona Data</Label>
                      <Input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>

                    {date && (
                      <div className="space-y-2">
                        <Label>3. Seleziona Orario</Label>
                        <div className="flex flex-wrap gap-2">
                          {timeSlots.map((slot) => {
                            const isOccupied = occupiedSlots.has(slot);
                            return (
                              <Button
                                key={slot}
                                type="button"
                                variant={
                                  timeSlot === slot ? "default" : "outline"
                                }
                                className={
                                  isOccupied
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }
                                disabled={isOccupied}
                                onClick={() => setTimeSlot(slot)}
                              >
                                {slot}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Note per il docente (opzionale)</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Argomenti da trattare..."
                      />
                    </div>

                    <Button
                      className="w-full"
                      disabled={
                        !date || !timeSlot || createAppointment.isPending
                      }
                      onClick={() => {
                        createAppointment.mutate({
                          teacherId: selectedTeacher,
                          studentId: user?.id,
                          date,
                          timeSlot,
                          notes,
                          status: "requested",
                        });
                      }}
                    >
                      Conferma prenotazione
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="miei-colloqui" className="mt-6 space-y-4">
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
              <CalendarCheck2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Nessun colloquio</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Non hai colloqui in programma.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {appointments.map((app) => (
                <Card
                  key={app.id}
                  className={app.status === "cancelled" ? "opacity-60" : ""}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">
                        {format(new Date(app.date), "dd/MM/yyyy")} alle{" "}
                        {app.timeSlot}
                      </CardTitle>
                      {app.status === "requested" && (
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-800 border-amber-200"
                        >
                          In attesa
                        </Badge>
                      )}
                      {app.status === "confirmed" && (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 border-green-200"
                        >
                          Confermato
                        </Badge>
                      )}
                      {app.status === "cancelled" && (
                        <Badge
                          variant="outline"
                          className="line-through text-muted-foreground"
                        >
                          Annullato
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {user?.role === "teacher"
                        ? `Studente: ${app.studentName}`
                        : `Docente: ${app.teacherName}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {app.notes && (
                      <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded line-clamp-2">
                        {app.notes}
                      </p>
                    )}

                    {user?.role === "teacher" && app.status === "requested" && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-green-200 text-green-700 hover:bg-green-50"
                          onClick={() =>
                            updateStatus.mutate({
                              id: app.id,
                              status: "confirmed",
                            })
                          }
                          disabled={updateStatus.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" /> Conferma
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() =>
                            updateStatus.mutate({
                              id: app.id,
                              status: "cancelled",
                            })
                          }
                          disabled={updateStatus.isPending}
                        >
                          <X className="w-4 h-4 mr-1" /> Annulla
                        </Button>
                      </div>
                    )}
                    {user?.role === "student" && app.status === "requested" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-4 border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() =>
                          updateStatus.mutate({
                            id: app.id,
                            status: "cancelled",
                          })
                        }
                        disabled={updateStatus.isPending}
                      >
                        Annulla richiesta
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
