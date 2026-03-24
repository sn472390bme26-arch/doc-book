import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Star, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { DOCTORS, HOSPITALS } from "../../data/seed";
import { useRouter } from "../../router/RouterContext";

export default function HospitalsPage() {
  const [search, setSearch] = useState("");
  const { navigate } = useRouter();

  const filtered = HOSPITALS.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.area.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Find a Hospital
        </h1>
        <p className="text-muted-foreground">
          Search and book appointments at top hospitals near you
        </p>
      </div>

      <div className="relative max-w-xl mb-8">
        <Search className="absolute left-3.5 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          className="pl-11 h-11 text-base"
          placeholder="Search by hospital name or area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-ocid="hospitals.search_input"
        />
      </div>

      {filtered.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="hospitals.empty_state"
        >
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No hospitals found</p>
          <p className="text-sm">Try a different name or area</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((hospital, idx) => {
            const docCount = DOCTORS.filter(
              (d) => d.hospitalId === hospital.id,
            ).length;
            return (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                data-ocid={`hospitals.item.${idx + 1}`}
              >
                <Card
                  className="cursor-pointer hover:shadow-card transition-all hover:-translate-y-1 overflow-hidden"
                  onClick={() =>
                    navigate({ path: "/patient/hospital", id: hospital.id })
                  }
                >
                  <div
                    className={`h-32 bg-gradient-to-br ${hospital.gradient} flex items-end p-4`}
                  >
                    <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                      <Star className="w-3 h-3 mr-1 fill-yellow-300 text-yellow-300" />
                      {hospital.rating}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground text-sm leading-tight mb-2">
                      {hospital.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <MapPin className="w-3 h-3" />
                      {hospital.area}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {docCount} doctors available
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
