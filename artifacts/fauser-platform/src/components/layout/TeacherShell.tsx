import { AppLayout } from "./AppLayout";
import { ReactNode } from "react";

/**
 * TeacherShell
 * The dedicated "operating system" for professors.
 * Focus: classes, teaching tools, fast actions for educators.
 */
export default function TeacherShell({ children }: { children: ReactNode }) {
  return (
    <div className="teacher-shell" data-role="teacher">
      <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-1 text-xs text-emerald-700 text-center hidden md:block">
        Portale Docenti — la tua didattica
      </div>
      <AppLayout portalName="Portale Docenti">{children}</AppLayout>
    </div>
  );
}
