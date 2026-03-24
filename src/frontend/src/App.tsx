import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TopNav from "./components/layout/TopNav";
import { StoreProvider } from "./context/StoreContext";
import { useStore } from "./context/StoreContext";
import LoginPage from "./pages/LoginPage";
import AdminPanel from "./pages/admin/AdminPanel";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import HospitalDoctorsPage from "./pages/patient/HospitalDoctorsPage";
import HospitalsPage from "./pages/patient/HospitalsPage";
import MyTokensPage from "./pages/patient/MyTokensPage";
import TokenTrackerPage from "./pages/patient/TokenTrackerPage";
import { RouterProvider, useRouter } from "./router/RouterContext";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useStore();
  const { route } = useRouter();

  function renderPage() {
    if (!user) return <LoginPage />;
    if (user.role === "admin") {
      return <AdminPanel />;
    }
    if (user.role === "doctor") {
      return <DoctorDashboard />;
    }
    // patient routes
    if (route.path === "/patient/hospitals") return <HospitalsPage />;
    if (route.path === "/patient/hospital")
      return <HospitalDoctorsPage id={(route as { id: string }).id} />;
    if (route.path === "/patient/tokens") return <MyTokensPage />;
    if (route.path === "/patient/track") {
      const r = route as { sessionId: string; tokenNumber: number };
      return (
        <TokenTrackerPage sessionId={r.sessionId} tokenNumber={r.tokenNumber} />
      );
    }
    return <HospitalsPage />;
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {user && !isAdmin && <TopNav />}
      <main className="flex-1">{renderPage()}</main>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider>
        <StoreProvider>
          <AppRoutes />
        </StoreProvider>
      </RouterProvider>
    </QueryClientProvider>
  );
}
