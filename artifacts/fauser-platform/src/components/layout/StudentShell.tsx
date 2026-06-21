import { AppLayout } from "./AppLayout";
import { ReactNode } from "react";

/**
 * StudentShell
 * The "operating system" interface for students.
 * Personal academic workspace.
 */
export default function StudentShell({ children }: { children: ReactNode }) {
  return (
    <div className="student-shell" data-role="student">
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-1 text-xs text-blue-700 text-center hidden md:block">
        Portale Studenti — il tuo percorso scolastico
      </div>
      <AppLayout portalName="Portale Studenti">{children}</AppLayout>
    </div>
  );
}
