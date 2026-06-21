import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { useGetMe, useListClasses } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function Orario() {
  const { data: user } = useGetMe();
  const { getToken } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string | undefined>(
    user?.classId?.toString(),
  );

  const { data: classes } = useListClasses();

  const { data: schedule, isLoading } = useQuery({
    queryKey: ["schedule", selectedClass],
    enabled: !!selectedClass,
    queryFn: async () => {
      const token = await getToken();
      const r = await fetch(`/api/schedule?classId=${selectedClass}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return [];
      return r.json();
    },
  });

  const days = [
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
  ];
  const hours = [
    "8:00",
    "9:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Orario delle Lezioni
          </h1>
          <p className="text-muted-foreground mt-1">
            Consulta l'orario settimanale.
          </p>
        </div>
        {user?.role === "admin" || user?.role === "teacher" ? (
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleziona classe" />
            </SelectTrigger>
            <SelectContent>
              {classes?.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {(c as any).anno}
                  {(c as any).sezione}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-center border-b border-r">Ora</th>
                {days.map((d) => (
                  <th key={d} className="px-4 py-3 text-center border-b">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((h, i) => (
                <tr
                  key={h}
                  className="border-b last:border-0 hover:bg-muted/10"
                >
                  <td className="px-4 py-3 font-medium text-center border-r bg-muted/20 w-24">
                    {h}
                    <br />
                    <span className="text-[10px] text-muted-foreground">
                      {i + 1}ª ora
                    </span>
                  </td>
                  {days.map((d, j) => {
                    const item = schedule?.find(
                      (s: any) => s.dayOfWeek === j + 1 && s.hour === i + 1,
                    );
                    return (
                      <td
                        key={`${i}-${j}`}
                        className="px-4 py-3 text-center border-r last:border-r-0 h-20 min-w-[120px]"
                      >
                        {isLoading ? (
                          <Skeleton className="h-full w-full" />
                        ) : item ? (
                          <div className="flex flex-col items-center justify-center h-full p-2 rounded-md bg-primary/10 border border-primary/20">
                            <span className="font-bold text-primary">
                              {item.subjectName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.teacherName}
                            </span>
                            <span className="text-xs">{item.room}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
