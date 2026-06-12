import { Link, useLocation } from "wouter";
import { useUser, useClerk, useAuth } from "@clerk/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  CalendarDays, 
  Bell, 
  MessageSquare,
  LogOut, 
  Menu,
  Clock,
  FileCheck2,
  CalendarCheck2,
  Library,
  Users2,
  UserCircle,
  ShieldCheck,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

const timeAgo = (dateStr: string) => {
  const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
  if (diff < 60) return `${diff} min fa`;
  if (diff < 1440) return `${Math.floor(diff/60)} ore fa`;
  return `${Math.floor(diff/1440)} gg fa`;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/registro", label: "Registro", icon: BookOpen },
  { href: "/classroom", label: "Classroom", icon: GraduationCap },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/comunicazioni", label: "Comunicazioni", icon: Bell },
  { href: "/messaggi", label: "Messaggi", icon: MessageSquare },
  { href: "/orario", label: "Orario", icon: Clock },
  { href: "/giustificazioni", label: "Giustificazioni", icon: FileCheck2 },
  { href: "/colloqui", label: "Colloqui", icon: CalendarCheck2 },
  { href: "/libreria", label: "Libreria", icon: Library },
  { href: "/tutoraggio", label: "Tutoraggio", icon: Users2 },
  { href: "/profilo", label: "Profilo", icon: UserCircle }
];

  export function AppLayout({ children }: { children: React.ReactNode }) {
    const [location] = useLocation();
    const { user } = useUser();
    const { signOut } = useClerk();
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
  
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  
    const { data: notifications = [], refetch: refetchNotifs } = useQuery({
      queryKey: ["notifications"],
      queryFn: async () => {
        const token = await getToken();
        const r = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!r.ok) return [];
        return r.json() as Promise<Array<{id:number;title:string;message:string;read:boolean;createdAt:string;type:string}>>;
      },
      refetchInterval: 30000,
      enabled: !!user?.id
    });
    
    const unreadCount = notifications.filter(n => !n.read).length;
  
    const markAllRead = useMutation({
      mutationFn: async () => {
        const token = await getToken();
        await fetch("/api/notifications/read-all", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      },
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notifications"] }); }
    });
  
    const markRead = useMutation({
      mutationFn: async (id: number) => {
        const token = await getToken();
        await fetch(`/api/notifications/${id}/read`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      },
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notifications"] }); }
    });

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
            location === item.href
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}
      {user?.publicMetadata?.role === 'admin' && (
        <Link
          href="/admin"
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors mt-4 ${
            location === "/admin"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-5 w-5" />
          Admin
        </Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <img src={`${basePath}/logo.svg`} alt="Logo" className="h-8 w-8" />
          <span className="font-bold text-primary">G.Fauser</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
            <div className="p-4 border-b flex items-center gap-3">
              <img src={`${basePath}/logo.svg`} alt="Logo" className="h-8 w-8" />
              <div className="font-bold text-xl text-primary tracking-tight">ITT G.Fauser</div>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <NavLinks />
            </nav>
            <div className="p-4 border-t bg-muted/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <div className="font-medium truncate">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground" 
                onClick={() => signOut({ redirectUrl: basePath || "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Esci
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
        <div className="p-6 border-b flex items-center gap-3">
          <img src={`${basePath}/logo.svg`} alt="Logo" className="h-10 w-10" />
          <div className="font-bold text-xl text-primary tracking-tight">ITT G.Fauser</div>
        </div>
        
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavLinks />
          </nav>
  
          <div className="p-4 border-t bg-muted/10">
            <div className="flex justify-end mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between p-4 border-b">
                    <span className="font-semibold">Notifiche</span>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={() => markAllRead.mutate()}>
                        <Check className="mr-1 h-3 w-3" /> Segna tutte lette
                      </Button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Nessuna notifica.</div>
                    ) : (
                      notifications.slice(0, 8).map(n => (
                        <div 
                          key={n.id} 
                          className={`p-4 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                          onClick={() => !n.read && markRead.mutate(n.id)}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className={`text-sm ${!n.read ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>{n.title}</span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <div className="font-medium truncate text-sm">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" 
              onClick={() => signOut({ redirectUrl: basePath || "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Esci
            </Button>
          </div>
        </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
