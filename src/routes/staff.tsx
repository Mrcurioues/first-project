import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Mail,
  Users,
  Stethoscope,
  ClipboardList,
  LogOut,
  Activity,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/staff")({
  head: () => ({ meta: [{ title: "Staff Dashboard — Smile Dental" }, { name: "robots", content: "noindex" }] }),
  component: StaffLayout,
});

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/staff", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/staff/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/staff/patient-tracker", label: "Patients Tracker", icon: Activity },
  { to: "/staff/messages", label: "Messages", icon: Mail },
  { to: "/staff/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/staff/patients", label: "Patients", icon: Users },
  { to: "/staff/treatments", label: "Treatment Plans", icon: ClipboardList },
];

function StaffLayout() {
  const { user, isStaff, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/staff/login", search: { redirect: path } as any });
  }, [user, loading, navigate, path]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!user) return null;

  if (!isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-card border border-border rounded-2xl p-8 shadow-soft">
          <h1 className="text-xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account ({user.email}) is signed in but not assigned a staff role yet. Ask an admin to grant you access.
          </p>
          <Button className="mt-5" onClick={() => signOut()}>Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[240px_1fr] bg-muted/30">
      <aside className="border-r border-border bg-card flex flex-col">
        <div className="px-5 py-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-warm flex items-center justify-center text-primary-foreground text-xs font-bold">SD</div>
            <div>
              <div className="font-display font-bold text-accent leading-tight">Smile Dental</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Staff Portal</div>
            </div>
          </Link>
        </div>
        <nav className="p-3 flex-1 space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to as any}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</div>
          <Button variant="outline" size="sm" className="w-full" onClick={() => signOut()}>
            <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="p-6 lg:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}