import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "../context/StoreContext";
import { ADMIN_CODE, ADMIN_PASSWORD } from "../data/seed";
import { useRouter } from "../router/RouterContext";

export default function LoginPage() {
  const { login, doctors, getPatientCredentials, savePatientCredential } =
    useStore();
  const { navigate } = useRouter();

  // Patient form mode
  const [patientMode, setPatientMode] = useState<"login" | "signup">("signup");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPassword, setPatientPassword] = useState("");
  const [patientName, setPatientName] = useState("");

  const [doctorCode, setDoctorCode] = useState("");
  const [doctorPassword, setDoctorPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function switchPatientMode(mode: "login" | "signup") {
    setPatientMode(mode);
    setPatientEmail("");
    setPatientPassword("");
    setPatientName("");
  }

  function handlePatientLogin(e: React.FormEvent) {
    e.preventDefault();
    const email = patientEmail.trim().toLowerCase();
    const password = patientPassword;

    if (patientMode === "login") {
      if (!email || !password) {
        toast.error("Please fill all fields");
        return;
      }
      const credentials = getPatientCredentials();
      const existing = credentials[email];
      if (!existing) {
        toast.error("No account found with this email. Please sign up first.");
        return;
      }
      if (existing.password !== password) {
        toast.error("Incorrect password.");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        login({
          id: `p_${email}`,
          email,
          name: existing.name,
          role: "patient",
        });
        setLoading(false);
        navigate({ path: "/patient/hospitals" });
      }, 800);
    } else {
      // Sign Up
      const name = patientName.trim();
      if (!name || !email || !password) {
        toast.error("Please fill all fields");
        return;
      }
      const credentials = getPatientCredentials();

      if (credentials[email]) {
        toast.error(
          "An account with this email already exists. Please log in.",
        );
        return;
      }
      savePatientCredential(email, name, password);
      setLoading(true);
      setTimeout(() => {
        login({
          id: `p_${email}`,
          email,
          name,
          role: "patient",
        });
        setLoading(false);
        navigate({ path: "/patient/hospitals" });
      }, 800);
    }
  }

  function handlePatientLoginOnly(e: React.FormEvent) {
    e.preventDefault();
    const email = patientEmail.trim().toLowerCase();
    const password = patientPassword;
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    const credentials = getPatientCredentials();
    const existing = credentials[email];
    if (!existing) {
      toast.error("No account found with this email. Please sign up first.");
      return;
    }
    if (existing.password !== password) {
      toast.error("Incorrect password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login({
        id: `p_${email}`,
        email,
        name: existing.name,
        role: "patient",
      });
      setLoading(false);
      navigate({ path: "/patient/hospitals" });
    }, 800);
  }

  function handleDoctorLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!doctorCode) {
      toast.error("Please enter your doctor code");
      return;
    }
    if (!doctorPassword) {
      toast.error("Please enter your phone number as password");
      return;
    }
    const doctor = doctors.find(
      (d) => d.code && d.code.toUpperCase() === doctorCode.trim().toUpperCase(),
    );
    if (!doctor) {
      toast.error("Invalid access code. Please check with your admin.");
      return;
    }
    const registeredPhone =
      (doctor as any).phone || (doctor as any).contactPhone || "";
    if (!registeredPhone) {
      toast.error("No phone number set for this doctor. Contact admin.");
      return;
    }
    if (doctorPassword.trim() !== registeredPhone.trim()) {
      toast.error("Incorrect password. Use your registered phone number.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login({
        id: `doc_${doctor.code}`,
        code: doctor.code!,
        role: "doctor",
        doctorId: doctor.id,
      });
      setLoading(false);
      navigate({ path: "/doctor" });
    }, 800);
  }

  function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!adminCode || !adminPassword) {
      toast.error("Please enter admin code and password");
      return;
    }
    if (adminCode.toUpperCase() !== ADMIN_CODE) {
      toast.error("Invalid admin code");
      return;
    }
    if (adminPassword !== ADMIN_PASSWORD) {
      toast.error("Invalid admin password");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login({ id: "admin", role: "admin" });
      setLoading(false);
      navigate({ path: "/admin" });
    }, 800);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="text-base">
            <span className="font-bold text-gray-900">Doctor</span>
            <span className="font-bold text-teal-500"> Booked</span>
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-4xl">
          <Tabs defaultValue="patient" className="w-full">
            <TabsList
              className="grid w-full max-w-sm mx-auto grid-cols-3 mb-6 sm:mb-8"
              data-ocid="login.tab"
            >
              <TabsTrigger value="patient" data-ocid="login.tab">
                Patient
              </TabsTrigger>
              <TabsTrigger value="doctor" data-ocid="login.tab">
                Doctor
              </TabsTrigger>
              <TabsTrigger value="admin" data-ocid="login.tab">
                Admin
              </TabsTrigger>
            </TabsList>

            {/* Patient tab */}
            <TabsContent value="patient">
              <div className="flex flex-col sm:flex-row max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                {/* Left panel — hidden on mobile */}
                <div className="hidden sm:flex sm:w-2/5 bg-gradient-to-b from-teal-200 to-teal-500 items-end pb-10 px-8 min-h-[280px]">
                  <div>
                    <h2 className="text-2xl font-bold text-white leading-tight mb-2">
                      Your Health,
                      <br />
                      Prioritized.
                    </h2>
                    <p className="text-teal-50 text-sm leading-relaxed">
                      Book appointments, track your token, and skip the waiting
                      room stress.
                    </p>
                  </div>
                </div>
                {/* Mobile top banner */}
                <div className="sm:hidden bg-gradient-to-r from-teal-400 to-teal-600 px-6 py-5">
                  <h2 className="text-lg font-bold text-white">
                    Patient Portal
                  </h2>
                  <p className="text-teal-50 text-xs mt-0.5">
                    Book appointments &amp; track your token
                  </p>
                </div>
                {/* Right panel / Form */}
                <div className="flex-1 bg-white p-6 sm:p-8">
                  <div className="mb-5 hidden sm:block">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                      <Activity className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Patient Portal
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {patientMode === "signup"
                        ? "Create your account"
                        : "Welcome back"}
                    </p>
                  </div>

                  {patientMode === "signup" ? (
                    /* ── SIGN UP FORM ── */
                    <form onSubmit={handlePatientLogin} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="patient-name" className="text-gray-700">
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <Input
                            id="patient-name"
                            className="pl-9"
                            placeholder="Your full name"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            data-ocid="login.input"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="patient-email"
                          className="text-gray-700"
                        >
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <Input
                            id="patient-email"
                            type="email"
                            className="pl-9"
                            placeholder="your@email.com"
                            value={patientEmail}
                            onChange={(e) => setPatientEmail(e.target.value)}
                            data-ocid="login.input"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="patient-password"
                          className="text-gray-700"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <Input
                            id="patient-password"
                            type="password"
                            className="pl-9"
                            placeholder="Create a password"
                            value={patientPassword}
                            onChange={(e) => setPatientPassword(e.target.value)}
                            data-ocid="login.input"
                          />
                        </div>
                      </div>

                      {/* Sign Up button */}
                      <Button
                        type="submit"
                        className="w-full bg-teal-500 hover:bg-teal-600 rounded-full h-11"
                        disabled={loading}
                        data-ocid="login.submit_button"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Sign Up"
                        )}
                      </Button>

                      {/* Already have account link */}
                      <p className="text-xs text-center text-gray-500">
                        Already have an account?{" "}
                        <button
                          type="button"
                          className="text-teal-600 hover:underline font-medium"
                          onClick={() => switchPatientMode("login")}
                          data-ocid="login.link"
                        >
                          Log in
                        </button>
                      </p>

                      {/* OR divider */}
                      <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 font-medium">
                          OR
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      {/* Standalone Login button */}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-full h-11 border-teal-400 text-teal-600 hover:bg-teal-50"
                        onClick={() => switchPatientMode("login")}
                        data-ocid="login.secondary_button"
                      >
                        Login
                      </Button>
                    </form>
                  ) : (
                    /* ── LOGIN FORM ── */
                    <form
                      onSubmit={handlePatientLoginOnly}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="patient-email-login"
                          className="text-gray-700"
                        >
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <Input
                            id="patient-email-login"
                            type="email"
                            className="pl-9"
                            placeholder="your@email.com"
                            value={patientEmail}
                            onChange={(e) => setPatientEmail(e.target.value)}
                            data-ocid="login.input"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="patient-password-login"
                          className="text-gray-700"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <Input
                            id="patient-password-login"
                            type="password"
                            className="pl-9"
                            placeholder="Enter your password"
                            value={patientPassword}
                            onChange={(e) => setPatientPassword(e.target.value)}
                            data-ocid="login.input"
                          />
                        </div>
                      </div>

                      {/* Login button */}
                      <Button
                        type="submit"
                        className="w-full bg-teal-500 hover:bg-teal-600 rounded-full h-11"
                        disabled={loading}
                        data-ocid="login.submit_button"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Login"
                        )}
                      </Button>

                      {/* Sign up link */}
                      <p className="text-xs text-center text-gray-500">
                        Don&apos;t have an account?{" "}
                        <button
                          type="button"
                          className="text-teal-600 hover:underline font-medium"
                          onClick={() => switchPatientMode("signup")}
                          data-ocid="login.link"
                        >
                          Sign up
                        </button>
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Doctor tab */}
            <TabsContent value="doctor">
              <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Stethoscope className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Doctor Login
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 text-center">
                    Enter your assigned login credentials
                  </p>
                </div>
                <form onSubmit={handleDoctorLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="doctor-code" className="text-gray-700">
                      Doctor Login Code
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <Input
                        id="doctor-code"
                        className="pl-9 font-mono tracking-widest"
                        placeholder="DOC-00001"
                        value={doctorCode}
                        onChange={(e) => setDoctorCode(e.target.value)}
                        data-ocid="login.input"
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      Your unique code assigned by the admin
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="doctor-phone" className="text-gray-700">
                      Phone Number (Password)
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <Input
                        id="doctor-phone"
                        type="password"
                        className="pl-9"
                        placeholder="Enter your registered phone number"
                        value={doctorPassword}
                        onChange={(e) => setDoctorPassword(e.target.value)}
                        data-ocid="login.input"
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      Your password is the phone number registered by the admin
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 rounded-full h-11"
                    disabled={loading}
                    data-ocid="login.submit_button"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Access Dashboard"
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* Admin tab */}
            <TabsContent value="admin">
              <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Admin Portal
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 text-center">
                    System administration &amp; management
                  </p>
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-code" className="text-gray-700">
                      Admin Code
                    </Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <Input
                        id="admin-code"
                        className="pl-9 font-mono tracking-widest"
                        placeholder="ADMIN-001"
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        data-ocid="login.input"
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      Demo code: ADMIN-001
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-password" className="text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <Input
                        id="admin-password"
                        type={showAdminPassword ? "text" : "password"}
                        className="pl-9 pr-9"
                        placeholder="Enter admin password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        data-ocid="login.admin_password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowAdminPassword((v) => !v)}
                        tabIndex={-1}
                      >
                        {showAdminPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-full h-11"
                    disabled={loading}
                    data-ocid="login.submit_button"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Login as Admin"
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline hover:text-gray-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
