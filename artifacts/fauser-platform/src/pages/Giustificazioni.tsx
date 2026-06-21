import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { useGetMe, useListAttendance } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { FileCheck2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type JustificationType = {
  id: number;
  attendanceId: number;
  studentId: number;
  reason: string;
  status: string;
  reviewedBy?: number;
  reviewedAt?: string;
  createdAt: string;
  studentName?: string;
  attendanceDate?: string;
  reviewerName?: string;
};

export default function Giustificazioni() {
  const { data: user } = useGetMe();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const studentId = user?.role === "student" ? user.id : undefined;

  const { data: attendance = [], isLoading: loadingAtt } = useListAttendance({
    studentId: studentId,
  });

  const { data: justifications = [], isLoading: loadingJust } = useQuery({
    queryKey: ["justifications", studentId],
    enabled: !!studentId || user?.role === "teacher" || user?.role === "admin",
    queryFn: async () => {
      const token = await getToken();
      const url = studentId
        ? `/api/justifications?studentId=${studentId}`
        : "/api/justifications";
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return [];
      return r.json() as Promise<JustificationType[]>;
    },
  });

  const createJustification = useMutation({
    mutationFn: async (data: {
      attendanceId: number;
      studentId: number;
      reason: string;
    }) => {
      const token = await getToken();
      const r = await fetch("/api/justifications", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error("Errore durante l'invio");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["justifications"] });
      toast({
        title: "Giustificazione inviata",
        description: "La giustificazione è in attesa di approvazione.",
      });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (data: {
      id: number;
      status: "approved" | "rejected";
    }) => {
      const token = await getToken();
      const r = await fetch(`/api/justifications/${data.id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["justifications"] });
      toast({ title: "Stato aggiornato" });
    },
  });

  const absences = attendance.filter(
    (a) => a.status === "assente" || a.status === "ritardo",
  );
  const justifiedAttendanceIds = new Set(
    justifications.map((j: JustificationType) => j.attendanceId),
  );
  const toJustify = absences.filter((a) => !justifiedAttendanceIds.has(a.id));

  const [reasonMap, setReasonMap] = useState<Record<number, string>>({});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Giustificazioni</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci le tue assenze e i ritardi.
        </p>
      </div>

      <Tabs
        defaultValue={user?.role === "student" ? "da-giustificare" : "storico"}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          {user?.role === "student" && (
            <TabsTrigger value="da-giustificare">Da giustificare</TabsTrigger>
          )}
          <TabsTrigger value="storico">
            {user?.role === "student" ? "Storico" : "Tutte le giustificazioni"}
          </TabsTrigger>
        </TabsList>

        {user?.role === "student" && (
          <TabsContent value="da-giustificare" className="mt-6 space-y-4">
            {toJustify.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
                <FileCheck2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">
                  Nessuna assenza da giustificare
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Hai giustificato tutte le tue assenze.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {toJustify.map((att) => (
                  <Card
                    key={att.id}
                    className="overflow-hidden border-l-4 border-l-destructive"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">
                              {format(new Date(att.date), "dd MMMM yyyy", {
                                locale: it,
                              })}
                            </span>
                            <Badge
                              variant={
                                att.status === "assente"
                                  ? "destructive"
                                  : "default"
                              }
                              className={
                                att.status === "ritardo" ? "bg-amber-500" : ""
                              }
                            >
                              {att.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Inserisci il motivo per questa assenza/ritardo.
                          </p>
                        </div>
                        <div className="flex-1 max-w-md space-y-2">
                          <Textarea
                            placeholder="Motivo (es. Motivi di salute, visita medica...)"
                            value={reasonMap[att.id] || ""}
                            onChange={(e) =>
                              setReasonMap((p) => ({
                                ...p,
                                [att.id]: e.target.value,
                              }))
                            }
                            className="resize-none"
                            rows={2}
                          />
                          <Button
                            className="w-full"
                            disabled={
                              !reasonMap[att.id] ||
                              reasonMap[att.id].length < 5 ||
                              createJustification.isPending
                            }
                            onClick={() => {
                              if (user?.id) {
                                createJustification.mutate({
                                  attendanceId: att.id,
                                  studentId: user.id,
                                  reason: reasonMap[att.id],
                                });
                              }
                            }}
                          >
                            Invia giustificazione
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        <TabsContent value="storico" className="mt-6 space-y-4">
          {justifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
              <FileCheck2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Nessuna giustificazione</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Non ci sono giustificazioni nello storico.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {justifications.map((just: JustificationType) => (
                <Card key={just.id}>
                  <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {just.attendanceDate
                            ? format(
                                new Date(just.attendanceDate),
                                "dd MMMM yyyy",
                                { locale: it },
                              )
                            : "Data sconosciuta"}
                        </span>
                        {just.status === "pending" && (
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-800 border-amber-200"
                          >
                            <Clock className="w-3 h-3 mr-1" /> In attesa
                          </Badge>
                        )}
                        {just.status === "approved" && (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 border-green-200"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Approvata
                          </Badge>
                        )}
                        {just.status === "rejected" && (
                          <Badge
                            variant="outline"
                            className="bg-red-100 text-red-800 border-red-200"
                          >
                            <AlertCircle className="w-3 h-3 mr-1" /> Rifiutata
                          </Badge>
                        )}
                      </div>
                      {user?.role !== "student" && just.studentName && (
                        <p className="text-sm font-medium">
                          Studente: {just.studentName}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md italic">
                        "{just.reason}"
                      </p>
                      {just.reviewedAt && (
                        <p className="text-xs text-muted-foreground">
                          Revisionata il{" "}
                          {format(new Date(just.reviewedAt), "dd/MM/yyyy")}{" "}
                          {just.reviewerName && `da ${just.reviewerName}`}
                        </p>
                      )}
                    </div>

                    {user?.role !== "student" && just.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="border-green-200 text-green-700 hover:bg-green-50"
                          onClick={() =>
                            updateStatus.mutate({
                              id: just.id,
                              status: "approved",
                            })
                          }
                          disabled={updateStatus.isPending}
                        >
                          Approva
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() =>
                            updateStatus.mutate({
                              id: just.id,
                              status: "rejected",
                            })
                          }
                          disabled={updateStatus.isPending}
                        >
                          Rifiuta
                        </Button>
                      </div>
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
