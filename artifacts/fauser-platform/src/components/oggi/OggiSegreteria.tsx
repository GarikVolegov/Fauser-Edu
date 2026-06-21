import { AlertCircle, UserX, Building2 } from "lucide-react";
import { OggiCard } from "./OggiCard";

export default function OggiSegreteria({ data }: { data: any }) {
  const just = data.pendingJustifications ?? [];
  const absences = data.todayAbsences ?? [];
  const rooms = data.roomsToday ?? [];

  return (
    <>
      <OggiCard
        title="Giustificazioni in sospeso"
        icon={<AlertCircle className="h-4 w-4 text-primary" />}
        cta={{ label: "Apri", href: "/giustificazioni" }}
      >
        {just.length === 0 ? (
          <span className="text-muted-foreground">Nessuna giustificazione in sospeso.</span>
        ) : (
          <ul className="space-y-1">
            {just.slice(0, 5).map((j: any) => (
              <li key={j.id} className="flex justify-between">
                <span className="truncate">{j.studentName} · {j.className}</span>
                <span className="text-muted-foreground text-xs truncate max-w-[8rem]">{j.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </OggiCard>

      <OggiCard title="Assenze di oggi" icon={<UserX className="h-4 w-4 text-primary" />}>
        {absences.length === 0 ? (
          <span className="text-muted-foreground">Nessuna assenza registrata oggi.</span>
        ) : (
          <ul className="space-y-1">
            {absences.slice(0, 6).map((a: any) => (
              <li key={a.studentId}>{a.studentName} · {a.className}</li>
            ))}
          </ul>
        )}
      </OggiCard>

      <OggiCard
        title="Aule di oggi"
        icon={<Building2 className="h-4 w-4 text-primary" />}
        cta={{ label: "Aule", href: "/aule" }}
      >
        {rooms.length === 0 ? (
          <span className="text-muted-foreground">Nessuna aula occupata oggi.</span>
        ) : (
          <ul className="space-y-1">
            {rooms.slice(0, 6).map((r: any) => (
              <li key={r.room} className="flex justify-between">
                <span>{r.room} · {r.slots} ore</span>
                {r.conflict && <span className="text-xs text-red-600">conflitto</span>}
              </li>
            ))}
          </ul>
        )}
      </OggiCard>
    </>
  );
}
