import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
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
import { ADMIN_CODE, DOCTORS } from "../data/seed";
import { useRouter } from "../router/RouterContext";

export default function LoginPage() {
  const { login } = useStore();
  const { navigate } = useRouter();

  const [patientEmail, setPatientEmail] = useState("");
  const [patientPassword, setPatientPassword] = useState("");
  const [patientName, setPatientName] = useState("");
  const [doctorCode, setDoctorCode] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);

  function handlePatientLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!patientEmail || !patientPassword || !patientName) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login({
        id: `p_${patientEmail}`,
        email: patientEmail,
        name: patientName,
        role: "patient",
      });
      setLoading(false);
      navigate({ path: "/patient/hospitals" });
    }, 800);
  }

  function handleDoctorLogin(e: React.FormEvent) {
    e.preventDefault();
    const doctor = DOCTORS.find((d) => d.code === doctorCode.toUpperCase());
    if (!doctor) {
      toast.error("Invalid access code. Try DOC001, DOC002, or DOC003");
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
    if (!adminCode) {
      toast.error("Please enter admin code");
      return;
    }
    if (adminCode.toUpperCase() !== ADMIN_CODE) {
      toast.error("Invalid admin code");
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
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="text-base">
            <span className="font-bold text-gray-900">Doctor</span>
            <span className="font-bold text-teal-500"> Booked</span>
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          <Tabs defaultValue="patient" className="w-full">
            <TabsList
              className="grid w-full max-w-sm mx-auto grid-cols-3 mb-8"
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
              <div className="flex max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                {/* Left panel */}
                <div className="w-1/2 bg-gradient-to-b from-teal-200 to-teal-500 flex items-end pb-10 px-8">
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
                {/* Right panel */}
                <div className="w-1/2 bg-white p-8">
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                      <Activity className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Patient Portal
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Sign in to book and track appointments
                    </p>
                  </div>
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
                      <Label htmlFor="patient-email" className="text-gray-700">
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
                          placeholder="Enter password"
                          value={patientPassword}
                          onChange={(e) => setPatientPassword(e.target.value)}
                          data-ocid="login.input"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-teal-500 hover:bg-teal-600 rounded-full h-10"
                      disabled={loading}
                      data-ocid="login.submit_button"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In & Continue"
                      )}
                    </Button>
                    <p className="text-xs text-gray-400 text-center">
                      By signing in, you agree to our Terms of Service.
                    </p>
                  </form>
                </div>
              </div>
            </TabsContent>

            {/* Doctor tab */}
            <TabsContent value="doctor">
              <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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
                        placeholder="DOC001"
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
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <Input
                        id="doctor-phone"
                        type="password"
                        className="pl-9"
                        placeholder="Enter phone number"
                        data-ocid="login.input"
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                    Demo codes: DOC001, DOC002, DOC003
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 rounded-full h-10"
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
              <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Admin Portal
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 text-center">
                    System administration & management
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
                  <Button
                    type="submit"
                    className="w-full rounded-full h-10"
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
