import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { useGetMe } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleGuard } from "@/components/RoleGuard";
import {
  Building2,
  Monitor,
  Beaker,
  Wrench,
  Calendar as CalIcon,
} from "lucide-react";
import { format, addDays, startOfWeek, subWeeks, addWeeks } from "date-fns";
import { it } from "date-fns/locale";

export default function Aule() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: me } = useGetMe();
  const [currentDate, setCurrentDate] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const token = await getToken();
      const r = await fetch("/api/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return [];
      return r.json();
    },
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: [
      "room-bookings",
      selectedRoom?.id,
      format(currentDate, "yyyy-MM-dd"),
    ],
    enabled: !!selectedRoom?.id,
    queryFn: async () => {
      const token = await getToken();
      const d = format(currentDate, "yyyy-MM-dd");
      const r = await fetch(
        `/api/room-bookings?roomId=${selectedRoom.id}&date=${d}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!r.ok) return [];
      return r.json();
    },
  });

  const getRoomIcon = (type: string) => {
    switch (type) {
      case "laboratorio_info":
        return <Monitor className="h-5 w-5 text-blue-500" />;
      case "laboratorio_chimica":
        return <Beaker className="h-5 w-5 text-green-500" />;
      case "officina":
        return <Wrench className="h-5 w-5 text-amber-500" />;
      default:
        return <Building2 className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const weekDays = Array.from({ length: 6 }).map((_, i) =>
    addDays(currentDate, i),
  );
  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
  ];

  return (
    <div className="space-y-4">
      <RoleGuard allowedRoles={["segreteria", "admin"]}>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
          Modalità gestione aule e spazi - riservata a segreteria e tecnici.
        </div>
      </RoleGuard>
    <div className="flex h-[calc(100vh-8rem)] bg-card border rounded-lg overflow-hidden shadow-sm">
      {/* Rooms List */}
      <div className="w-80 border-r flex flex-col bg-muted/10">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Spazi & Aule
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Seleziona uno spazio per vederne la disponibilità.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {roomsLoading
            ? [1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))
            : rooms.map((room: any) => (
                <Card
                  key={room.id}
                  className={`cursor-pointer transition-all hover-elevate ${selectedRoom?.id === room.id ? "border-primary ring-1 ring-primary/20 bg-primary/5" : ""}`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="mt-1 shrink-0 p-2 bg-background rounded-md border shadow-sm">
                      {getRoomIcon(room.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{room.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-xs font-normal bg-background"
                        >
                          Capienza: {room.capacity}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 flex flex-col bg-background overflow-hidden">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b flex justify-between items-center bg-card">
              <div>
                <h2 className="font-bold text-xl">{selectedRoom.name}</h2>
                <div className="text-sm text-muted-foreground">
                  {selectedRoom.equipment || "Nessuna dotazione specificata"}
                </div>
              </div>
              <div className="flex items-center gap-4 bg-muted p-1 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                >
                  &lt;
                </Button>
                <div className="font-medium text-sm w-40 text-center flex items-center justify-center gap-2">
                  <CalIcon className="h-4 w-4 text-muted-foreground" />
                  {format(currentDate, "d MMM", { locale: it })} -{" "}
                  {format(addDays(currentDate, 5), "d MMM yyyy", {
                    locale: it,
                  })}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                >
                  &gt;
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-7 border-b border-l border-t rounded-t-md bg-muted/30">
                  <div className="p-3 font-medium text-center border-r text-sm text-muted-foreground bg-muted/50">
                    Ora
                  </div>
                  {weekDays.map((d) => (
                    <div
                      key={d.toString()}
                      className="p-3 font-medium text-center border-r"
                    >
                      <div className="capitalize">
                        {format(d, "EEEE", { locale: it })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(d, "d MMM")}
                      </div>
                    </div>
                  ))}
                </div>

                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="grid grid-cols-7 border-b border-l"
                  >
                    <div className="p-3 text-sm text-center border-r bg-muted/20 font-medium text-muted-foreground flex items-center justify-center">
                      {time}
                    </div>
                    {weekDays.map((d) => {
                      // Fake random bookings for visual until API is wired fully
                      const isBooked = Math.random() > 0.8;
                      return (
                        <div
                          key={d.toString()}
                          className="border-r min-h-[80px] p-1 bg-background"
                        >
                          {isBooked ? (
                            <div className="h-full bg-primary/10 border border-primary/20 rounded-md p-2 flex flex-col justify-center">
                              <span className="text-xs font-bold text-primary truncate">
                                Prof. Rossi
                              </span>
                              <span className="text-[10px] text-muted-foreground truncate">
                                Lezione pratica
                              </span>
                            </div>
                          ) : (
                            <div className="h-full rounded-md hover:bg-muted/50 transition-colors cursor-pointer group flex items-center justify-center">
                              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                + Prenota
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Building2 className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg">Seleziona un'aula per prenotarla</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
