import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  CalendarDays, 
  Bell, 
  LogOut, 
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/registro", label: "Registro", icon: BookOpen },
  { href: "/classroom", label: "Classroom", icon: GraduationCap },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/comunicazioni", label: "Comunicazioni", icon: Bell },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <a
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              location === item.href
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </a>
        </Link>
      ))}
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
