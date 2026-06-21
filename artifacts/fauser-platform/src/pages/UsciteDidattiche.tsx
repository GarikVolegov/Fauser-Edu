import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Card, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Users, Euro } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { motion } from "framer-motion";

export default function UsciteDidattiche() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ["field-trips"],
    queryFn: async () => {
      const token = await getToken();
      const r = await fetch("/api/field-trips", { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return [];
      return r.json();
    }
  });

  const joinTrip = useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      const r = await fetch(`/api/field-trips/${id}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["field-trips"] })
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "published": return <Badge className="bg-green-500 hover:bg-green-600 text-white">Confermata</Badge>;
      case "cancelled": return <Badge variant="destructive">Annullata</Badge>;
      default: return <Badge variant="secondary">In programmazione</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Uscite Didattiche</h1>
          <p className="text-muted-foreground mt-1">Visualizza e partecipa alle uscite programmate.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : trips.length === 0 ? (
        <Card className="flex flex-col items-center justify-center h-48 text-center p-6 border-dashed">
          <MapPin className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <CardTitle className="text-lg">Nessuna uscita programmata</CardTitle>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {trips.map((trip: any, idx: number) => (
            <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="h-full flex flex-col hover-elevate overflow-hidden">
                <div className="h-32 bg-muted relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <h3 className="text-xl font-bold text-white leading-tight">{trip.title}</h3>
                  </div>
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(trip.status)}
                  </div>
                </div>
                <CardContent className="pt-6 flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate" title={trip.destination}>{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                      <span>{trip.date ? format(new Date(trip.date), "d MMM yyyy", { locale: it }) : "Da definire"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Euro className="h-4 w-4 text-primary shrink-0" />
                      <span>{trip.budget ? `€${trip.budget}` : "Gratuito"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 text-primary shrink-0" />
                      <span>{trip.participantCount || 0} iscritti</span>
                    </div>
                  </div>
                  {trip.description && (
                    <div className="pt-4 border-t text-sm text-foreground/80 line-clamp-3">
                      {trip.description}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/10 border-t pt-4">
                  <div className="w-full flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                      Docente: {trip.teacherName}
                    </div>
                    {trip.status === "published" && !trip.myStatus ? (
                      <Button onClick={() => joinTrip.mutate(trip.id)} disabled={joinTrip.isPending}>
                        Partecipa
                      </Button>
                    ) : trip.myStatus ? (
                      <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
                        Iscrizione {trip.myStatus === 'pending' ? 'in attesa' : 'confermata'}
                      </Badge>
                    ) : null}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}