import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Calendar, Clock, Hash, Hospital } from "lucide-react";
import { motion } from "motion/react";
import { useStore } from "../../context/StoreContext";
import { SESSION_TIMES } from "../../data/seed";
import { useRouter } from "../../router/RouterContext";
import type { SessionType } from "../../types";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-700 border-0",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-700 border-0",
  },
  unvisited: {
    label: "Refund Pending",
    className: "bg-orange-100 text-orange-700 border-0",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 border-0",
  },
};

export default function MyTokensPage() {
  const { user, bookings } = useStore();
  const { navigate } = useRouter();

  const patientId = (user as { id: string }).id;
  const myBookings = bookings
    .filter((b) => b.patientId === patientId)
    .sort((a, b) => b.id.localeCompare(a.id));

  function formatDate(d: string) {
    return new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          My Appointments
        </h1>
        <p className="text-muted-foreground">
          Track all your booked tokens and appointments
        </p>
      </div>

      {myBookings.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="tokens.empty_state"
        >
          <Activity className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="text-xl font-semibold">No appointments yet</p>
          <p className="text-sm mt-1">
            Book your first appointment from the hospitals page
          </p>
          <Button
            className="mt-6"
            onClick={() => navigate({ path: "/patient/hospitals" })}
            data-ocid="tokens.primary_button"
          >
            Find a Hospital
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {myBookings.map((booking, idx) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              data-ocid={`tokens.item.${idx + 1}`}
            >
              <Card className="hover:shadow-card transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">
                          {booking.doctorName}
                        </h3>
                        <Badge
                          className={
                            STATUS_BADGE[booking.status]?.className ?? ""
                          }
                        >
                          {STATUS_BADGE[booking.status]?.label ??
                            booking.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Hospital className="w-3 h-3" />
                        {booking.hospitalName}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(booking.date)}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {SESSION_TIMES[booking.session as SessionType]?.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        <Hash className="w-4 h-4 text-primary" />
                        <span className="text-2xl font-bold text-primary">
                          {booking.tokenNumber}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate({
                            path: "/patient/track",
                            sessionId: booking.sessionId,
                            tokenNumber: booking.tokenNumber,
                          })
                        }
                        data-ocid={`tokens.secondary_button.${idx + 1}`}
                      >
                        Track Token
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
