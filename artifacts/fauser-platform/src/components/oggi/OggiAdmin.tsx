import { AlertCircle } from "lucide-react";
import { OggiCard } from "./OggiCard";

export default function OggiAdmin({ data }: { data: any }) {
  const pending = data.pendingTotal ?? 0;
  return (
    <OggiCard
      title="Da evadere"
      icon={<AlertCircle className="h-4 w-4 text-primary" />}
      cta={{ label: "Pannello Admin", href: "/admin" }}
    >
      <div className="text-3xl font-bold">{pending}</div>
      <p className="text-xs text-muted-foreground">richieste/giustificazioni in sospeso</p>
    </OggiCard>
  );
}
