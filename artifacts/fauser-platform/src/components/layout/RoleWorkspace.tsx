import { useGetMe } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { AppLayout } from "./AppLayout";
import StudentShell from "./StudentShell";
import TeacherShell from "./TeacherShell";
import SegreteriaShell from "./SegreteriaShell";
import AdminShell from "./AdminShell";

/**
 * RoleWorkspace
 * Central component that selects the correct "shell" (distinct user interface)
 * based on the user's role from the DB (via /me).
 * This delivers the "separate interfaces" for student / prof / segreteria / tecnici.
 */
export function RoleWorkspace({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading } = useGetMe();
  const { isLoaded: clerkLoaded } = useUser();

  if (!clerkLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const role = me?.role ?? "student";

  // Choose the dedicated shell / interface for full immersion
  switch (role) {
    case "teacher":
      return <TeacherShell>{children}</TeacherShell>;
    case "segreteria":
      return <SegreteriaShell>{children}</SegreteriaShell>;
    case "admin":
      return <AdminShell>{children}</AdminShell>;
    case "student":
    default:
      return <StudentShell>{children}</StudentShell>;
  }
}

// Re-export for convenience
export { AppLayout };
