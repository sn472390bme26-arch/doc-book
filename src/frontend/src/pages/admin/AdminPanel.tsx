import {
  Activity,
  BookOpen,
  Building2,
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  Users,
} from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { useRouter } from "../../router/RouterContext";
import AdminBookings from "./AdminBookings";
import AdminDashboard from "./AdminDashboard";
import AdminDoctors from "./AdminDoctors";
import AdminHospitals from "./AdminHospitals";
import AdminPatients from "./AdminPatients";
import AdminSessions from "./AdminSessions";

const NAV_ITEMS = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/hospitals", label: "Hospitals", icon: Building2 },
  { path: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { path: "/admin/patients", label: "Patients", icon: Users },
  { path: "/admin/sessions", label: "Sessions", icon: CalendarCheck },
  { path: "/admin/bookings", label: "Bookings", icon: BookOpen },
] as const;

export default function AdminPanel() {
  const { logout } = useStore();
  const { route, navigate } = useRouter();

  function renderContent() {
    switch (route.path) {
      case "/admin/hospitals":
        return <AdminHospitals />;
      case "/admin/doctors":
        return <AdminDoctors />;
      case "/admin/patients":
        return <AdminPatients />;
      case "/admin/sessions":
        return <AdminSessions />;
      case "/admin/bookings":
        return <AdminBookings />;
      default:
        return <AdminDashboard />;
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-admin-sidebar text-admin-sidebar-fg flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">MediToken</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">
                Admin Console
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1" data-ocid="admin.panel">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = route.path === path;
            return (
              <button
                key={path}
                type="button"
                onClick={() =>
                  navigate({ path } as Parameters<typeof navigate>[0])
                }
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:bg-white/8 hover:text-white/90"
                }`}
                data-ocid="admin.link"
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white transition-colors"
            data-ocid="admin.button"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  );
}
