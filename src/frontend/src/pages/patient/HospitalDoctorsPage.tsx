import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, IndianRupee, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import BookingDialog from "../../components/booking/BookingDialog";
import { useStore } from "../../context/StoreContext";
import { HOSPITALS, SESSION_TIMES } from "../../data/seed";
import { useRouter } from "../../router/RouterContext";
import type { Doctor } from "../../types";

interface Props {
  id: string;
}

export default function HospitalDoctorsPage({ id }: Props) {
  const { goBack } = useRouter();
  const { doctors } = useStore();
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  const hospital = HOSPITALS.find((h) => h.id === id);
  const hospitalDoctors = doctors.filter((d) => d.hospitalId === id);

  if (!hospital)
    return <div className="p-8 text-center">Hospital not found</div>;

  const specialtyColors: Record<string, string> = {
    Cardiologist: "bg-red-100 text-red-700",
    Neurologist: "bg-purple-100 text-purple-700",
    Pediatrician: "bg-green-100 text-green-700",
    Orthopedic: "bg-blue-100 text-blue-700",
    Dermatologist: "bg-pink-100 text-pink-700",
    "General Physician": "bg-teal-100 text-teal-700",
  };

  function getInitials(name: string) {
    return name
      .replace("Dr. ", "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 -ml-2"
        onClick={goBack}
        data-ocid="hospital.button"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hospitals
      </Button>

      <div
        className={`h-32 rounded-2xl bg-gradient-to-br ${hospital.gradient} flex items-end p-6 mb-8`}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">{hospital.name}</h1>
          <p className="text-white/80 text-sm">
            {hospital.area} &middot; {hospitalDoctors.length} Doctors
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {hospitalDoctors.map((doctor, idx) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            data-ocid={`doctors.item.${idx + 1}`}
          >
            <Card className="hover:shadow-card transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary-foreground">
                      {getInitials(doctor.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {doctor.name}
                        </h3>
                        <Badge
                          className={`text-xs border-0 mt-1 ${specialtyColors[doctor.specialty] ?? "bg-muted text-muted-foreground"}`}
                        >
                          {doctor.specialty}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-foreground font-bold">
                          <IndianRupee className="w-4 h-4" />
                          <span>{doctor.price}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          per session
                        </p>
                      </div>
                    </div>
                    {doctor.bio && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {doctor.bio}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {doctor.sessions.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {SESSION_TIMES[s]?.label.split(" (")[0]}
                        </Badge>
                      ))}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>4.5</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0"
                    onClick={() => setBookingDoctor(doctor)}
                    data-ocid={`doctors.primary_button.${idx + 1}`}
                  >
                    Book Token
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {bookingDoctor && (
        <BookingDialog
          doctor={bookingDoctor}
          hospital={hospital}
          open={!!bookingDoctor}
          onClose={() => setBookingDoctor(null)}
        />
      )}
    </div>
  );
}
