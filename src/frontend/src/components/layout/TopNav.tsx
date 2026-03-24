import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, Cross, LogOut, User } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { DOCTORS } from "../../data/seed";
import { useRouter } from "../../router/RouterContext";

export default function TopNav() {
  const { user, logout, bookings } = useStore();
  const { navigate } = useRouter();

  const displayName =
    user?.role === "patient"
      ? (user as { name: string }).name
      : (DOCTORS.find((d) => d.code === (user as { code: string })?.code)
          ?.name ?? "Doctor");

  const pendingNotifs =
    user?.role === "patient"
      ? bookings.filter((b) => b.patientId === (user as { id: string }).id)
          .length
      : 0;

  function handleLogout() {
    logout();
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <button
          type="button"
          className="flex items-center gap-2 shrink-0"
          onClick={() =>
            navigate(
              user?.role === "doctor"
                ? { path: "/doctor" }
                : { path: "/patient/hospitals" },
            )
          }
          data-ocid="nav.link"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Cross
              className="w-4 h-4 text-primary-foreground"
              strokeWidth={2.5}
            />
          </div>
          <span className="text-lg font-bold text-foreground">MediToken</span>
        </button>

        {user?.role === "patient" && (
          <nav className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigate({ path: "/patient/hospitals" })}
              className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent transition-colors"
              data-ocid="nav.link"
            >
              Hospitals
            </button>
            <button
              type="button"
              onClick={() => navigate({ path: "/patient/tokens" })}
              className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent transition-colors"
              data-ocid="nav.link"
            >
              My Tokens
            </button>
          </nav>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {user?.role === "patient" && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              data-ocid="nav.link"
            >
              <Bell className="w-5 h-5" />
              {pendingNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-status-red text-white text-[10px] flex items-center justify-center">
                  {pendingNotifs}
                </span>
              )}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                data-ocid="nav.dropdown_menu"
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
                data-ocid="nav.button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center gap-6">
          {user?.role === "patient" ? (
            <>
              <button
                type="button"
                onClick={() => navigate({ path: "/patient/hospitals" })}
                className="text-xs font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                data-ocid="nav.link"
              >
                Find a Hospital
              </button>
              <button
                type="button"
                onClick={() => navigate({ path: "/patient/tokens" })}
                className="text-xs font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                data-ocid="nav.link"
              >
                My Appointments
              </button>
            </>
          ) : (
            <>
              <span className="text-xs font-medium text-primary-foreground/80">
                Doctor Portal
              </span>
              <span className="text-xs text-primary-foreground/60">
                Manage tokens & profile
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
