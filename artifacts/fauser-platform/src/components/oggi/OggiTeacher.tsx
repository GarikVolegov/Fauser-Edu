import { CalendarCheck2, ClipboardList, Clock } from "lucide-react";
import { OggiCard } from "./OggiCard";

export default function OggiTeacher({ data }: { data: any }) {
  const lessons = data.todayLessons ?? [];
  const assignments = data.assignmentsDue ?? [];
  const next = data.nextAppointment ?? null;

  return (
    <>
      <OggiCard title="Lezioni di oggi" icon={<Clock className="h-4 w-4 text-primary" />}>
        {lessons.length === 0 ? (
          <span className="text-muted-foreground">Nessuna lezione oggi 🎉</span>
        ) : (
          <ul className="space-y-2">
            {lessons.map((l: any) => (
              <li key={l.scheduleId} className="flex items-center justify-between gap-2">
                <span>
                  <span className="font-medium">{l.hour}ª · {l.className}</span>{" "}
                  <span className="text-muted-foreground">{l.subjectName}{l.room ? ` · ${l.room}` : ""}</span>
                </span>
                <a
                  href={`/registro?classId=${l.classId}&tab=presenze`}
                  className={`text-xs rounded px-2 py-1 ${l.attendanceTaken ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}
                >
                  {l.attendanceTaken ? "Appello fatto" : "Fai l'appello"}
                </a>
              </li>
            ))}
          </ul>
        )}
      </OggiCard>

      <OggiCard
        title="Compiti in scadenza"
        icon={<ClipboardList className="h-4 w-4 text-primary" />}
        cta={{ label: "Registro", href: "/registro" }}
      >
        {assignments.length === 0 ? (
          <span className="text-muted-foreground">Nessun compito in scadenza.</span>
        ) : (
          <ul className="space-y-1">
            {assignments.slice(0, 4).map((a: any) => (
              <li key={a.id} className="flex justify-between">
                <span className="truncate">{a.title} · {a.className}</span>
                <span className="text-muted-foreground text-xs">{a.dueDate}</span>
              </li>
            ))}
          </ul>
        )}
      </OggiCard>

      <OggiCard
        title="Prossimo colloquio"
        icon={<CalendarCheck2 className="h-4 w-4 text-primary" />}
        cta={{ label: "Colloqui", href: "/colloqui" }}
      >
        {next ? (
          <span>{next.date} · {next.timeSlot} — {next.studentName}</span>
        ) : (
          <span className="text-muted-foreground">Nessun colloquio in programma.</span>
        )}
      </OggiCard>
    </>
  );
}
