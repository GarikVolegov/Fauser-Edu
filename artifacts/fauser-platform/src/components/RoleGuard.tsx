import { ReactNode } from "react";
import { useGetMe } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: Array<"student" | "teacher" | "segreteria" | "admin">;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * RoleGuard
 * Protects UI sections or entire pages.
 * Use inside a shell or page:
 *   <RoleGuard allowedRoles={["teacher", "admin"]}>
 *     <TeacherOnlyTools />
 *   </RoleGuard>
 */
export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { data: me, isLoading } = useGetMe();

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Caricamento...</div>;
  }

  const role = me?.role;

  if (role && allowedRoles.includes(role as any)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="max-w-sm border-destructive/30">
        <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
          <ShieldAlert className="h-10 w-10 text-destructive" />
          <div>
            <p className="font-semibold">Accesso non consentito</p>
            <p className="text-sm text-muted-foreground mt-1">
              Questa sezione è riservata ai ruoli: {allowedRoles.join(", ")}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
