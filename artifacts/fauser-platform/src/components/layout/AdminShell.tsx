import { AppLayout } from "./AppLayout";
import { ReactNode } from "react";

/**
 * AdminShell
 * Interface reserved for Tecnici / technical administrators.
 * Full access to the Admin panel and system tools.
 */
export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell" data-role="admin">
      <div className="bg-rose-50 border-b border-rose-100 px-4 py-1 text-xs text-rose-700 text-center hidden md:block">
        Amministrazione Tecnici — accesso riservato
      </div>
      <AppLayout portalName="Amministrazione Tecnici">{children}</AppLayout>
    </div>
  );
}
