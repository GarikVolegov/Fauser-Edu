import { useGetMe, useGetDashboardToday } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import OggiTeacher from "./OggiTeacher";
import OggiSegreteria from "./OggiSegreteria";
import OggiAdmin from "./OggiAdmin";

export default function OggiFeed() {
  const { data: me } = useGetMe();
  const { data, isLoading, isError } = useGetDashboardToday();
  const role = me?.role ?? "student";

  if (role === "student") return null; // student keeps its existing dashboard

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Oggi, {format(new Date(), "EEEE d MMMM", { locale: it })}
        </h2>
        <p className="text-sm text-muted-foreground">Le tue azioni di oggi.</p>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Non è stato possibile caricare il riepilogo di oggi. Riprova più tardi.
        </div>
      )}

      {!isLoading && !isError && data && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {role === "teacher" && <OggiTeacher data={data} />}
          {role === "segreteria" && <OggiSegreteria data={data} />}
          {role === "admin" && <OggiAdmin data={data} />}
        </div>
      )}
    </section>
  );
}
