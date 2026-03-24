import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Save,
  User,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "../../context/StoreContext";
import {
  HOSPITALS,
  SESSION_TIMES,
  getAvailableDates,
  makeSessionId,
} from "../../data/seed";
import type { PrioritySlotState, SessionType, TokenStatus } from "../../types";

const TOKEN_CLASSES: Record<string, string> = {
  white: "token-white cursor-pointer hover:opacity-80",
  red: "token-red cursor-pointer hover:opacity-80",
  orange: "token-orange cursor-pointer animate-pulse",
  yellow: "token-yellow cursor-pointer animate-pulse-ring",
  green: "token-green",
  unvisited:
    "bg-muted border-2 border-muted-foreground/20 text-muted-foreground",
};

const PRIORITY_STATUS_CLASSES: Record<string, string> = {
  waiting:
    "bg-blue-100 text-blue-700 border-blue-200 cursor-pointer hover:opacity-80",
  ongoing: "bg-orange-100 text-orange-700 border-orange-200 cursor-pointer",
  completed: "bg-green-100 text-green-700 border-green-200 cursor-pointer",
};

export default function DoctorDashboard() {
  const {
    user,
    doctors,
    updateDoctor,
    getOrCreateTokenState,
    regulateToken,
    completeCurrentToken,
    closeSession,
    setPrioritySlot,
    cancelSession,
    isSessionCancelled,
  } = useStore();

  const doctorUser = user as { doctorId: string; code: string };
  const doctor = doctors.find((d) => d.id === doctorUser.doctorId)!;

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: doctor?.name ?? "",
    specialty: doctor?.specialty ?? "",
    bio: doctor?.bio ?? "",
    price: String(doctor?.price ?? 0),
    tokensPerSession: String(doctor?.tokensPerSession ?? 20),
    sessions: doctor?.sessions ?? ([] as SessionType[]),
  });

  // Token regulator state
  const today = new Date().toISOString().split("T")[0];
  const [regDate, setRegDate] = useState(today);
  const [regSession, setRegSession] = useState<SessionType>(
    doctor?.sessions[0] ?? "morning",
  );
  const [priorityDialog, setPriorityDialog] = useState<{
    open: boolean;
    index: number;
    slot: PrioritySlotState | null;
  }>({ open: false, index: 0, slot: null });

  const availableDates = useMemo(() => getAvailableDates(), []);

  const sessionId = doctor ? makeSessionId(doctor.id, regDate, regSession) : "";
  const tokenState = doctor
    ? getOrCreateTokenState(sessionId, doctor.id, regDate, regSession)
    : null;
  const statuses = tokenState?.tokenStatuses ?? {};
  const currentToken = tokenState?.currentToken ?? null;
  const isClosed = tokenState?.isClosed ?? false;
  const cancelled = doctor
    ? isSessionCancelled(doctor.id, regDate, regSession)
    : false;

  function handleSaveProfile() {
    updateDoctor(doctor.id, {
      name: profileForm.name,
      specialty: profileForm.specialty,
      bio: profileForm.bio,
      price: Number(profileForm.price),
      tokensPerSession: Number(profileForm.tokensPerSession),
      sessions: profileForm.sessions,
    });
    toast.success("Profile updated successfully");
  }

  function toggleSession(s: SessionType) {
    setProfileForm((prev) => ({
      ...prev,
      sessions: prev.sessions.includes(s)
        ? prev.sessions.filter((x) => x !== s)
        : [...prev.sessions, s],
    }));
  }

  function handleTokenClick(tokenNum: number) {
    if (isClosed) return;
    const st = statuses[tokenNum] as TokenStatus;
    if (st !== "red" && st !== "yellow") return;
    regulateToken(sessionId, tokenNum);
    toast.success(`Token #${tokenNum} is now being seen`);
  }

  function handleCompleteToken() {
    completeCurrentToken(sessionId);
    toast.success("Token completed, moving to next");
  }

  function handleCloseSession() {
    closeSession(sessionId);
    toast.success(
      "Session closed. Refunds will be processed for unvisited tokens.",
    );
  }

  function handleCancelSession() {
    cancelSession(doctor.id, regDate, regSession);
    toast.success("Session cancelled. Patients will be notified.");
  }

  function openPriorityDialog(slotIndex: number) {
    const existing = tokenState?.prioritySlots?.[slotIndex] ?? {
      label: `Priority Slot P${slotIndex}`,
      status: "waiting" as const,
    };
    setPriorityDialog({ open: true, index: slotIndex, slot: existing });
  }

  function handlePriorityUpdate(status: PrioritySlotState["status"]) {
    if (!priorityDialog.slot) return;
    setPrioritySlot(sessionId, priorityDialog.index, {
      ...priorityDialog.slot,
      status,
    });
    setPriorityDialog({ open: false, index: 0, slot: null });
  }

  const maxTokens = doctor?.tokensPerSession ?? 20;

  function renderTokenGrid() {
    const elements: React.ReactNode[] = [];
    for (let n = 1; n <= maxTokens; n++) {
      const st: TokenStatus = (statuses[n] as TokenStatus) ?? "white";
      const isClickable = (st === "red" || st === "yellow") && !isClosed;
      elements.push(
        <button
          key={n}
          className={`w-11 h-11 rounded-lg flex items-center justify-center text-sm font-bold transition-all select-none ${TOKEN_CLASSES[st] ?? "token-white"} ${isClickable ? "cursor-pointer hover:scale-110" : ""} ${st === "orange" ? "scale-110 shadow-lg" : ""}`}
          type="button"
          disabled={!isClickable}
          onClick={() => handleTokenClick(n)}
          title={
            st === "orange"
              ? "Currently seeing"
              : st === "yellow"
                ? "Next up"
                : st === "green"
                  ? "Done"
                  : st === "red"
                    ? "Click to call"
                    : "Available"
          }
          data-ocid={`tokens.item.${n}`}
        >
          {n}
        </button>,
      );
      // Add priority slot after every 10 tokens
      if (n % 10 === 0 && n < maxTokens) {
        const slotIndex = n / 10;
        const ps = tokenState?.prioritySlots?.[slotIndex] ?? {
          label: `Priority Slot P${slotIndex}`,
          status: "waiting" as const,
        };
        elements.push(
          <div key={`ps_${slotIndex}`} className="w-full">
            <button
              type="button"
              className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all ${PRIORITY_STATUS_CLASSES[ps.status]}`}
              onClick={() => openPriorityDialog(slotIndex)}
              data-ocid="tokens.toggle"
            >
              <span>
                ⚡ Priority Slot P{slotIndex} — Emergency / Urgent Visit
              </span>
              <Badge
                className={`text-[10px] border-0 ${ps.status === "completed" ? "bg-green-200 text-green-800" : ps.status === "ongoing" ? "bg-orange-200 text-orange-800" : "bg-blue-200 text-blue-800"}`}
              >
                {ps.status === "completed"
                  ? "Completed"
                  : ps.status === "ongoing"
                    ? "Ongoing"
                    : "Waiting"}
              </Badge>
            </button>
          </div>,
        );
      }
    }
    return elements;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome, {doctor?.name} ·{" "}
          {HOSPITALS.find((h) => h.id === doctor?.hospitalId)?.name}
        </p>
      </div>

      <Tabs defaultValue="regulator" className="w-full">
        <TabsList className="mb-6" data-ocid="doctor.tab">
          <TabsTrigger value="regulator" data-ocid="doctor.tab">
            <Activity className="w-4 h-4 mr-2" />
            Token Regulator
          </TabsTrigger>
          <TabsTrigger value="profile" data-ocid="doctor.tab">
            <User className="w-4 h-4 mr-2" />
            My Profile
          </TabsTrigger>
        </TabsList>

        {/* Token Regulator Tab */}
        <TabsContent value="regulator">
          <div className="space-y-6">
            {/* Session selectors */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Date</Label>
                    <Select value={regDate} onValueChange={setRegDate}>
                      <SelectTrigger className="w-44" data-ocid="doctor.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDates.map((d) => (
                          <SelectItem key={d} value={d}>
                            {new Date(`${d}T00:00:00`).toLocaleDateString(
                              "en-IN",
                              {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              },
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Session</Label>
                    <Select
                      value={regSession}
                      onValueChange={(v) => setRegSession(v as SessionType)}
                    >
                      <SelectTrigger className="w-52" data-ocid="doctor.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {doctor?.sessions.map((s) => (
                          <SelectItem key={s} value={s}>
                            {SESSION_TIMES[s].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {cancelled ? (
                      <Badge className="bg-red-100 text-red-700 border-0">
                        Session Cancelled
                      </Badge>
                    ) : isClosed ? (
                      <Badge className="bg-muted text-muted-foreground">
                        Session Closed
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 border-0">
                        Session Active
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Grid */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="text-base">
                    <Clock className="w-4 h-4 inline mr-2" />
                    {SESSION_TIMES[regSession]?.label} —{" "}
                    {new Date(`${regDate}T00:00:00`).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "long" },
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {currentToken !== null && !isClosed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCompleteToken}
                        data-ocid="tokens.primary_button"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-status-green" />
                        Complete #{currentToken}
                      </Button>
                    )}
                    {!isClosed && !cancelled && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            data-ocid="tokens.close_button"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1.5" />
                            Close Session
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-ocid="tokens.dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Close This Session?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              All remaining booked tokens will be marked as
                              unvisited and eligible for refund. This cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="tokens.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCloseSession}
                              data-ocid="tokens.confirm_button"
                            >
                              Close Session & Process Refunds
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {regDate > today && !cancelled && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            data-ocid="tokens.delete_button"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                            Cancel Session
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-ocid="tokens.dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Cancel Upcoming Session?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will cancel the{" "}
                              {SESSION_TIMES[regSession]?.label} session on{" "}
                              {regDate}. All booked patients will be refunded.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="tokens.cancel_button">
                              Keep Session
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancelSession}
                              className="bg-destructive text-destructive-foreground"
                              data-ocid="tokens.confirm_button"
                            >
                              Cancel Session
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {cancelled ? (
                  <div
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="tokens.empty_state"
                  >
                    <XCircle className="w-10 h-10 mx-auto mb-3 text-destructive opacity-50" />
                    <p className="font-medium">
                      This session has been cancelled
                    </p>
                    <p className="text-sm mt-1">
                      Patients have been notified and refunds processed
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {renderTokenGrid()}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                      {[
                        ["white", "Unbooked"],
                        ["red", "Booked"],
                        ["orange", "In Progress"],
                        ["yellow", "Next"],
                        ["green", "Done"],
                      ].map(([s, label]) => (
                        <div key={s} className="flex items-center gap-1.5">
                          <div className={`w-5 h-5 rounded token-${s}`} />
                          <span className="text-xs text-muted-foreground">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="doc-name">Full Name</Label>
                  <Input
                    id="doc-name"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, name: e.target.value }))
                    }
                    data-ocid="profile.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-specialty">Specialty</Label>
                  <Input
                    id="doc-specialty"
                    value={profileForm.specialty}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        specialty: e.target.value,
                      }))
                    }
                    data-ocid="profile.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-price">Price per Session (₹)</Label>
                  <Input
                    id="doc-price"
                    type="number"
                    value={profileForm.price}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, price: e.target.value }))
                    }
                    data-ocid="profile.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-tokens">Tokens per Session</Label>
                  <Input
                    id="doc-tokens"
                    type="number"
                    value={profileForm.tokensPerSession}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        tokensPerSession: e.target.value,
                      }))
                    }
                    data-ocid="profile.input"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="doc-bio">Bio</Label>
                  <Textarea
                    id="doc-bio"
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, bio: e.target.value }))
                    }
                    data-ocid="profile.textarea"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Available Sessions</Label>
                  {(["morning", "afternoon", "evening"] as SessionType[]).map(
                    (s) => (
                      <div key={s} className="flex items-center gap-2">
                        <Checkbox
                          id={`sess_${s}`}
                          checked={profileForm.sessions.includes(s)}
                          onCheckedChange={() => toggleSession(s)}
                          data-ocid="profile.checkbox"
                        />
                        <Label
                          htmlFor={`sess_${s}`}
                          className="font-normal cursor-pointer"
                        >
                          {SESSION_TIMES[s].label}
                        </Label>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <Button
                className="mt-6"
                onClick={handleSaveProfile}
                data-ocid="profile.save_button"
              >
                <Save className="w-4 h-4 mr-2" /> Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Priority Slot Dialog */}
      <Dialog
        open={priorityDialog.open}
        onOpenChange={(v) =>
          !v && setPriorityDialog((p) => ({ ...p, open: false }))
        }
      >
        <DialogContent data-ocid="tokens.dialog">
          <DialogHeader>
            <DialogTitle>
              Priority Slot P{priorityDialog.index} — Urgent Visit
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Update the status for this priority slot.
          </p>
          <div className="grid grid-cols-3 gap-3 py-2">
            <Button
              variant="outline"
              className="flex-col h-16 gap-1"
              onClick={() => handlePriorityUpdate("waiting")}
              data-ocid="tokens.secondary_button"
            >
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-xs">Waiting</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-16 gap-1"
              onClick={() => handlePriorityUpdate("ongoing")}
              data-ocid="tokens.secondary_button"
            >
              <Activity className="w-5 h-5 text-orange-500" />
              <span className="text-xs">Ongoing</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-16 gap-1"
              onClick={() => handlePriorityUpdate("completed")}
              data-ocid="tokens.secondary_button"
            >
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-xs">Completed</span>
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPriorityDialog((p) => ({ ...p, open: false }))}
              data-ocid="tokens.close_button"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
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
