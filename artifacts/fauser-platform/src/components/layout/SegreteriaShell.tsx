import { AppLayout } from "./AppLayout";
import { ReactNode } from "react";

/**
 * SegreteriaShell
 * Dedicated interface for Segreteria staff.
 * Focus: school operations, approvals, user & resource management.
 */
export default function SegreteriaShell({ children }: { children: ReactNode }) {
  return (
    <div className="segreteria-shell bg-slate-50" data-role="segreteria">
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-1 text-xs text-amber-700 text-center hidden md:block">
        Segreteria — gestione operativa della scuola
      </div>
      <AppLayout portalName="Segreteria">{children}</AppLayout>
    </div>
  );
}
