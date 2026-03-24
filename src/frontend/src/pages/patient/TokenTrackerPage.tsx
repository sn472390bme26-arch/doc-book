import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Info } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { useRouter } from "../../router/RouterContext";
import type { TokenStatus } from "../../types";

const TOKEN_CLASSES: Record<TokenStatus, string> = {
  white: "token-white",
  red: "token-red",
  orange: "token-orange",
  yellow: "token-yellow animate-pulse-ring",
  green: "token-green",
  unvisited:
    "bg-muted border-2 border-muted-foreground/20 text-muted-foreground",
};

const STATUS_LABELS: Record<TokenStatus, string> = {
  white: "Available",
  red: "Booked - Waiting",
  orange: "Currently Being Seen",
  yellow: "Next Up (You're called!)",
  green: "Completed",
  unvisited: "Unvisited",
};

interface Props {
  sessionId: string;
  tokenNumber: number;
}

export default function TokenTrackerPage({ sessionId, tokenNumber }: Props) {
  const { goBack } = useRouter();
  const { tokenStates, bookings, doctors } = useStore();

  const booking = bookings.find(
    (b) => b.sessionId === sessionId && b.tokenNumber === tokenNumber,
  );
  const tokenState = tokenStates[sessionId];

  const doctor = booking
    ? doctors.find((d) => d.id === booking.doctorId)
    : null;
  const maxTokens = doctor?.tokensPerSession ?? 30;

  const statuses = tokenState?.tokenStatuses ?? {};
  const myStatus: TokenStatus = statuses[tokenNumber] ?? "red";

  function getStatusMsg() {
    switch (myStatus) {
      case "green":
        return {
          text: "Your consultation is complete.",
          color: "text-status-green",
        };
      case "orange":
        return {
          text: "You are currently being seen by the doctor!",
          color: "text-status-orange",
        };
      case "yellow":
        return {
          text: "You're next! Please be ready at the counter.",
          color: "text-status-yellow",
        };
      case "red":
        return {
          text: `You are in the queue. Token #${tokenNumber}.`,
          color: "text-primary",
        };
      case "unvisited":
        return {
          text: "Session closed. Refund will be processed.",
          color: "text-destructive",
        };
      default:
        return { text: "", color: "" };
    }
  }

  const msg = getStatusMsg();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 -ml-2"
        onClick={goBack}
        data-ocid="tracker.button"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Tokens
      </Button>

      <h1 className="text-2xl font-bold mb-2">Token Tracker</h1>
      {booking && (
        <p className="text-muted-foreground text-sm mb-6">
          {booking.doctorName} &middot; {booking.date} &middot;{" "}
          {booking.session}
        </p>
      )}

      <Card className="mb-6 border-2 border-primary">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Your Token</p>
              <p className="text-4xl font-bold text-primary">#{tokenNumber}</p>
              <p className={`text-sm font-medium mt-1 ${msg.color}`}>
                {msg.text}
              </p>
            </div>
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${TOKEN_CLASSES[myStatus] ?? "token-red"}`}
            >
              {tokenNumber}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4" /> Session Token Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: maxTokens }, (_, i) => i + 1).map((n) => {
              const st: TokenStatus = statuses[n] ?? "white";
              const isMe = n === tokenNumber;
              return (
                <div
                  key={n}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${TOKEN_CLASSES[st] ?? "token-white"} ${isMe ? "ring-4 ring-primary ring-offset-1 scale-110" : ""}`}
                  title={STATUS_LABELS[st]}
                >
                  {n}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-border">
            {(
              [
                ["white", "Available"],
                ["red", "Booked"],
                ["orange", "In Progress"],
                ["yellow", "Next Up"],
                ["green", "Done"],
              ] as [TokenStatus, string][]
            ).map(([s, label]) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded ${TOKEN_CLASSES[s]}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
