import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetMe } from "@workspace/api-client-react";

const ROLES = [
  { value: "student", label: "👨‍🎓 Studente" },
  { value: "teacher", label: "👨‍🏫 Professore" },
  { value: "segreteria", label: "🗂️ Segreteria" },
  { value: "admin", label: "🛠️ Tecnici / Admin" },
] as const;

export function DevRoleSwitcher() {
  const { data: me } = useGetMe();
  const queryClient = useQueryClient();
  const [isSwitching, setIsSwitching] = useState(false);

  // Only show in development (when no real Clerk key or NODE_ENV=development)
  const isDev =
    !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
    import.meta.env.DEV ||
    import.meta.env.MODE === "development";

  if (!isDev) return null;

  const currentRole = me?.role ?? "student";

  const switchRole = async (newRole: string) => {
    if (newRole === currentRole) return;

    setIsSwitching(true);
    try {
      // Direct fetch because in dev the mock auth works without token
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        console.error("Failed to switch role", await res.text());
        return;
      }

      // Invalidate so RoleWorkspace, nav, dashboards re-render with new role
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      // Navigate to the role's home so you immediately see the new interface
      // (no full reload needed thanks to React state)
      window.location.href = "/dashboard";
    } catch (e) {
      console.error("Role switch error", e);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-zinc-900 text-white text-xs rounded-2xl px-3 py-2 shadow-2xl border border-white/10 flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-emerald-400 text-[10px] px-1.5 py-0.5 bg-emerald-500/20 rounded">DEV</span>
        <span className="text-white/50">Ruolo:</span>
      </div>
      <Select
        value={currentRole}
        onValueChange={switchRole}
        disabled={isSwitching}
      >
        <SelectTrigger className="h-7 w-[170px] bg-white/5 border-white/20 text-white text-xs hover:bg-white/10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="text-xs">
          {ROLES.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 px-2 text-[10px] text-white/60 hover:text-white hover:bg-white/10"
        onClick={() => window.location.reload()}
        disabled={isSwitching}
      >
        ↻
      </Button>
    </div>
  );
}
