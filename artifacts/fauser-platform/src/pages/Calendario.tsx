import { useState } from "react";
import { useListEvents, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";

export default function Calendario() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // We fetch events for a broad range to populate the calendar
  // In a real app, this would be scoped to the current visible month
  const { data: events, isLoading } = useListEvents();

  const getEventColor = (type: string) => {
    switch(type) {
      case 'compito': return 'bg-orange-500';
      case 'esame': return 'bg-red-500';
      case 'vacanza': return 'bg-green-500';
      case 'evento_scolastico': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const getEventLabel = (type: string) => {
    switch(type) {
      case 'compito': return 'Compito in classe';
      case 'esame': return 'Esame / Verifica';
      case 'vacanza': return 'Vacanza';
      case 'evento_scolastico': return 'Evento Scolastico';
      default: return 'Altro';
    }
  };

  const selectedDateEvents = events?.filter(e => date && isSameDay(new Date(e.startDate), date)) || [];
  
  // Function to determine if a date has events for the calendar day styling
  const modifiers = {
    hasEvents: (d: Date) => events?.some(e => isSameDay(new Date(e.startDate), d)) || false,
    hasExams: (d: Date) => events?.some(e => e.type === 'esame' && isSameDay(new Date(e.startDate), d)) || false,
  };

  const modifiersStyles = {
    hasEvents: { fontWeight: 'bold' },
    hasExams: { color: 'white', backgroundColor: 'var(--destructive)' }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
        <p className="text-muted-foreground mt-1">Impegni, scadenze ed eventi scolastici.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_400px]">
        <Card className="order-2 md:order-1">
          <CardHeader>
            <CardTitle>
              {date ? format(date, "EEEE d MMMM yyyy", { locale: it }) : "Seleziona una data"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="flex gap-4 p-4 rounded-lg border bg-card">
                    <div className={`w-1.5 rounded-full ${getEventColor(event.type)} shrink-0`} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold">{event.title}</h4>
                        <Badge variant="outline" className="shrink-0">
                          {getEventLabel(event.type)}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {event.allDay ? 'Tutto il giorno' : format(new Date(event.startDate), "HH:mm")}
                            {event.endDate && !event.allDay && ` - ${format(new Date(event.endDate), "HH:mm")}`}
                          </span>
                        </div>
                        {event.description && (
                          <p className="mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <CalendarIcon className="h-12 w-12 opacity-20 mb-4" />
                <p>Nessun evento in programma per questa data.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="order-1 md:order-2 space-y-6">
          <Card>
            <CardContent className="p-3 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={it}
                className="rounded-md"
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Legenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Esami e Verifiche</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Compiti Assegnati</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Eventi Scolastici</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Vacanze / Chiusura</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
