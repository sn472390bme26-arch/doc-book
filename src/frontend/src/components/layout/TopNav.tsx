import { Button } from "@/components/ui/button";
import { BookOpen, Hospital, LogOut, User } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { DOCTORS } from "../../data/seed";
import { useRouter } from "../../router/RouterContext";

export default function TopNav() {
  const { user, logout } = useStore();
  const { navigate, route } = useRouter();

  const displayName =
    user?.role === "patient"
      ? (user as { name: string }).name
      : (DOCTORS.find((d) => d.code === (user as { code: string })?.code)
          ?.name ?? "Doctor");

  const isPatient = user?.role === "patient";
  const isDoctor = user?.role === "doctor";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-3 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-6">
        {/* Logo + Wordmark */}
        <button
          type="button"
          className="flex items-center gap-1.5 shrink-0"
          onClick={() =>
            navigate(
              isDoctor ? { path: "/doctor" } : { path: "/patient/hospitals" },
            )
          }
          data-ocid="nav.link"
        >
          <img
            src="/assets/uploads/final_logo_page-0001-019d2d83-8a36-752f-9b4e-dec5e9e187fd-1.jpg"
            alt="Doctor Booked Logo"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-sm sm:text-base hidden xs:inline">
            <span className="font-bold text-gray-900">Doctor</span>
            <span className="font-bold text-teal-500"> Booked</span>
          </span>
        </button>

        {/* Patient nav links */}
        {isPatient && (
          <nav className="flex items-center gap-0.5 sm:gap-1 ml-1 sm:ml-2">
            <button
              type="button"
              onClick={() => navigate({ path: "/patient/hospitals" })}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                route.path === "/patient/hospitals" ||
                route.path === "/patient/hospital"
                  ? "text-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-teal-600 hover:bg-teal-50"
              }`}
              data-ocid="nav.link"
            >
              <Hospital className="w-4 h-4 shrink-0" />
              <span>Hospitals</span>
            </button>
            <button
              type="button"
              onClick={() => navigate({ path: "/patient/tokens" })}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                route.path === "/patient/tokens" ||
                route.path === "/patient/track"
                  ? "text-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-teal-600 hover:bg-teal-50"
              }`}
              data-ocid="nav.link"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">My Bookings</span>
              <span className="sm:hidden">Bookings</span>
            </button>
          </nav>
        )}

        {/* Doctor nav tabs */}
        {isDoctor && (
          <nav className="flex items-center gap-1 ml-1 sm:ml-2">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-teal-100 text-teal-700 rounded-full transition-colors"
              data-ocid="nav.tab"
            >
              Dashboard
            </button>
          </nav>
        )}

        {/* Right side: user info + logout */}
        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-teal-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-none">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isPatient ? "Patient" : "Doctor"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 gap-1 sm:gap-1.5 px-2 sm:px-3"
            onClick={logout}
            data-ocid="nav.button"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
