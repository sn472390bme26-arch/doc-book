import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cross,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary py-12 px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Cross className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold text-white">MediToken</h1>
        </div>
        <p className="text-primary-foreground/80 text-lg max-w-md mx-auto">
          Smart appointment booking with real-time token management
        </p>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Tabs defaultValue="patient" className="w-full">
            <TabsList
              className="grid w-full grid-cols-3 mb-6"
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

            <TabsContent value="patient">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Patient Portal</CardTitle>
                  <CardDescription>
                    Book appointments and track your tokens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePatientLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient-name">Full Name</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
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
                    <div className="space-y-2">
                      <Label htmlFor="patient-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
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
                    <div className="space-y-2">
                      <Label htmlFor="patient-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
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
                      className="w-full"
                      disabled={loading}
                      data-ocid="login.submit_button"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login as Patient"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="doctor">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Doctor Portal</CardTitle>
                  <CardDescription>
                    Enter your unique access code to continue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDoctorLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor-code">Access Code</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="doctor-code"
                          className="pl-9 font-mono tracking-widest"
                          placeholder="DOC001"
                          value={doctorCode}
                          onChange={(e) => setDoctorCode(e.target.value)}
                          data-ocid="login.input"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Demo codes: DOC001, DOC002, DOC003
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                      data-ocid="login.submit_button"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Login as Doctor"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Admin Portal
                  </CardTitle>
                  <CardDescription>
                    System administration and management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-code">Admin Code</Label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="admin-code"
                          className="pl-9 font-mono tracking-widest"
                          placeholder="ADMIN-001"
                          value={adminCode}
                          onChange={(e) => setAdminCode(e.target.value)}
                          data-ocid="login.input"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Demo code: ADMIN-001
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border">
        &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
