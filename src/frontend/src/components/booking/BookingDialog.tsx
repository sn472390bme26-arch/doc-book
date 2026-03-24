import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Hash,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "../../context/StoreContext";
import {
  SESSION_TIMES,
  getAvailableDates,
  isSessionAvailable,
  makeSessionId,
} from "../../data/seed";
import type { Doctor, Hospital, SessionType } from "../../types";

interface Props {
  doctor: Doctor;
  hospital: Hospital;
  open: boolean;
  onClose: () => void;
}

type Step = "date" | "session" | "token" | "payment" | "success";

export default function BookingDialog({
  doctor,
  hospital,
  open,
  onClose,
}: Props) {
  const { user, bookings, addBooking, bookToken } = useStore();
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSession, setSelectedSession] = useState<SessionType | "">("");
  const [paying, setPaying] = useState(false);
  // booking id tracked via store
  const [tokenNumber, setTokenNumber] = useState(0);

  const availableDates = useMemo(() => getAvailableDates(), []);

  function getBookedCount(date: string, session: string): number {
    const sid = makeSessionId(doctor.id, date, session);
    return bookings.filter((b) => b.sessionId === sid && b.paymentDone).length;
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setStep("session");
  }

  function handleSessionSelect(session: SessionType) {
    setSelectedSession(session);
    const count = getBookedCount(selectedDate, session);
    setTokenNumber(count + 1);
    setStep("token");
  }

  function handleConfirm() {
    setStep("payment");
  }

  function handlePay() {
    setPaying(true);
    setTimeout(() => {
      const patientUser = user as { id: string; name: string };
      const sessionId = makeSessionId(doctor.id, selectedDate, selectedSession);
      const id = `bk_${Date.now()}`;
      addBooking({
        id,
        patientId: patientUser.id,
        patientName: patientUser.name,
        doctorId: doctor.id,
        doctorName: doctor.name,
        hospitalName: hospital.name,
        date: selectedDate,
        session: selectedSession as SessionType,
        tokenNumber,
        sessionId,
        paymentDone: true,
        status: "confirmed",
      });
      bookToken(
        sessionId,
        doctor.id,
        selectedDate,
        selectedSession as SessionType,
        tokenNumber,
      );

      setPaying(false);
      setStep("success");
    }, 1800);
  }

  function handleClose() {
    setStep("date");
    setSelectedDate("");
    setSelectedSession("");
    setTokenNumber(0);
    onClose();
  }

  function formatDate(d: string) {
    return new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-ocid="booking.dialog">
        <DialogHeader>
          <DialogTitle>
            {step === "success"
              ? "Booking Confirmed! 🎉"
              : `Book with ${doctor.name}`}
          </DialogTitle>
        </DialogHeader>

        {/* Step: Date */}
        {step === "date" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Select appointment date (next 5 days)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {availableDates.map((date, i) => (
                <Button
                  key={date}
                  variant="outline"
                  className="h-16 flex-col gap-1 hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleDateSelect(date)}
                  data-ocid="booking.button"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {formatDate(date)}
                  </span>
                  {i === 0 && (
                    <Badge className="text-[10px] h-4 bg-green-100 text-green-700 border-0">
                      Today
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Session */}
        {step === "session" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Date: <strong>{formatDate(selectedDate)}</strong> · Select session
            </p>
            <div className="space-y-2">
              {(Object.keys(SESSION_TIMES) as SessionType[]).map((session) => {
                if (!doctor.sessions.includes(session)) return null;
                const available = isSessionAvailable(selectedDate, session);
                const booked = getBookedCount(selectedDate, session);
                const full = booked >= doctor.tokensPerSession;
                return (
                  <Button
                    key={session}
                    variant="outline"
                    className={`w-full justify-between h-14 ${!available || full ? "opacity-40 cursor-not-allowed" : "hover:bg-primary hover:text-primary-foreground"}`}
                    disabled={!available || full}
                    onClick={() => handleSessionSelect(session)}
                    data-ocid="booking.button"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{SESSION_TIMES[session].label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {full
                        ? "Full"
                        : !available
                          ? "Ended"
                          : `${booked}/${doctor.tokensPerSession} booked`}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Token preview */}
        {step === "token" && (
          <div className="space-y-4">
            <div className="bg-muted rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor</span>
                <span className="font-medium">{doctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Session</span>
                <span className="font-medium">
                  {SESSION_TIMES[selectedSession as SessionType]?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Already booked</span>
                <span className="font-medium">{tokenNumber - 1} tokens</span>
              </div>
            </div>
            <div className="border-2 border-primary rounded-xl p-6 text-center">
              <Hash className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Your Token Number</p>
              <p className="text-5xl font-bold text-primary mt-1">
                {tokenNumber}
              </p>
            </div>
            <Button
              className="w-full"
              onClick={handleConfirm}
              data-ocid="booking.confirm_button"
            >
              Confirm & Proceed to Payment
            </Button>
          </div>
        )}

        {/* Step: Payment */}
        {step === "payment" && (
          <div className="space-y-4 text-center">
            <div className="bg-muted rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">
                Amount to Pay
              </p>
              <div className="flex items-center justify-center gap-1 text-3xl font-bold text-foreground">
                <IndianRupee className="w-6 h-6" />
                {doctor.price}
              </div>
            </div>
            {paying ? (
              <div className="py-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm font-medium">Processing Payment...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please wait
                </p>
              </div>
            ) : (
              <Button
                className="w-full text-base h-12"
                onClick={handlePay}
                data-ocid="booking.primary_button"
              >
                <IndianRupee className="w-4 h-4 mr-1" />
                Pay ₹{doctor.price}
              </Button>
            )}
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div
            className="text-center space-y-4"
            data-ocid="booking.success_state"
          >
            <CheckCircle2 className="w-16 h-16 text-status-green mx-auto" />
            <div>
              <p className="font-semibold text-lg">Payment Successful!</p>
              <p className="text-muted-foreground text-sm mt-1">
                Your appointment has been confirmed
              </p>
            </div>
            <div className="border-2 border-status-green rounded-xl p-5">
              <p className="text-xs text-muted-foreground">Your Token Number</p>
              <p
                className="text-5xl font-bold"
                style={{ color: "oklch(0.60 0.15 145)" }}
              >
                {tokenNumber}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {doctor.name} · {formatDate(selectedDate)} ·{" "}
                {SESSION_TIMES[selectedSession as SessionType]?.label}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                data-ocid="booking.close_button"
              >
                Close
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  handleClose();
                  toast.success("Navigate to My Tokens to track!");
                }}
                data-ocid="booking.secondary_button"
              >
                View My Tokens
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
