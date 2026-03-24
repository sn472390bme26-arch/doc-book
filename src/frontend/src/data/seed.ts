import type { Doctor, Hospital } from "../types";

export const ADMIN_CODE = "ADMIN-001";

export const HOSPITALS: Hospital[] = [
  {
    id: "h1",
    name: "City General Hospital",
    area: "Downtown",
    doctorCount: 12,
    rating: 4.5,
    gradient: "from-blue-400 to-blue-600",
    address: "45 Central Avenue, Downtown District",
    phone: "+91 22 4567 8900",
  },
  {
    id: "h2",
    name: "Apollo Medical Center",
    area: "Westside",
    doctorCount: 8,
    rating: 4.7,
    gradient: "from-teal-400 to-cyan-600",
    address: "12 West Ring Road, Westside",
    phone: "+91 22 8765 4321",
  },
  {
    id: "h3",
    name: "Metro Health Clinic",
    area: "Eastside",
    doctorCount: 15,
    rating: 4.3,
    gradient: "from-indigo-400 to-purple-600",
    address: "88 East Park Lane, Eastside",
    phone: "+91 22 3456 7890",
  },
  {
    id: "h4",
    name: "Sunrise Hospital",
    area: "Northside",
    doctorCount: 6,
    rating: 4.6,
    gradient: "from-orange-400 to-amber-500",
    address: "3 Sunrise Boulevard, Northside",
    phone: "+91 22 9012 3456",
  },
];

export const DOCTORS: Doctor[] = [
  {
    id: "d1",
    hospitalId: "h1",
    code: "DOC001",
    name: "Dr. Sarah Chen",
    specialty: "Cardiologist",
    price: 800,
    sessions: ["morning", "afternoon", "evening"],
    tokensPerSession: 20,
    bio: "Expert cardiologist with 15 years of experience in treating heart conditions.",
    phone: "+91 98765 43210",
    consultationFee: 800,
    isAvailable: true,
  },
  {
    id: "d2",
    hospitalId: "h1",
    code: "DOC002",
    name: "Dr. Raj Patel",
    specialty: "Neurologist",
    price: 1000,
    sessions: ["morning", "afternoon"],
    tokensPerSession: 15,
    bio: "Leading neurologist specializing in stroke rehabilitation and epilepsy management.",
    phone: "+91 98765 43211",
    consultationFee: 1000,
    isAvailable: true,
  },
  {
    id: "d3",
    hospitalId: "h2",
    code: "DOC003",
    name: "Dr. Priya Nair",
    specialty: "Pediatrician",
    price: 600,
    sessions: ["morning", "evening"],
    tokensPerSession: 25,
    bio: "Compassionate pediatrician dedicated to child health and development.",
    phone: "+91 98765 43212",
    consultationFee: 600,
    isAvailable: true,
  },
  {
    id: "d4",
    hospitalId: "h2",
    name: "Dr. Kumar Singh",
    specialty: "Orthopedic",
    price: 900,
    sessions: ["afternoon", "evening"],
    tokensPerSession: 18,
    bio: "Orthopedic surgeon with expertise in joint replacement and sports injuries.",
    phone: "+91 98765 43213",
    consultationFee: 900,
    isAvailable: true,
  },
  {
    id: "d5",
    hospitalId: "h3",
    name: "Dr. Meera Sharma",
    specialty: "Dermatologist",
    price: 700,
    sessions: ["morning", "afternoon", "evening"],
    tokensPerSession: 20,
    bio: "Dermatologist specializing in skin disorders, cosmetic procedures, and hair care.",
    phone: "+91 98765 43214",
    consultationFee: 700,
    isAvailable: true,
  },
  {
    id: "d6",
    hospitalId: "h4",
    name: "Dr. Arun Verma",
    specialty: "General Physician",
    price: 400,
    sessions: ["morning", "afternoon", "evening"],
    tokensPerSession: 30,
    bio: "General physician with holistic approach to primary healthcare and preventive medicine.",
    phone: "+91 98765 43215",
    consultationFee: 400,
    isAvailable: true,
  },
];

export const SESSION_TIMES: Record<
  string,
  { start: string; end: string; label: string }
> = {
  morning: { start: "09:00", end: "12:00", label: "Morning (9 AM – 12 PM)" },
  afternoon: { start: "14:00", end: "17:00", label: "Afternoon (2 PM – 5 PM)" },
  evening: { start: "18:00", end: "21:00", label: "Evening (6 PM – 9 PM)" },
};

export function makeSessionId(
  doctorId: string,
  date: string,
  session: string,
): string {
  return `${doctorId}_${date}_${session}`;
}

export function getAvailableDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export function isSessionAvailable(date: string, session: string): boolean {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  if (date > today) return true;
  if (date < today) return false;
  // Same day - check if session ends in more than 10 min
  const times = SESSION_TIMES[session];
  if (!times) return false;
  const [endH, endM] = times.end.split(":").map(Number);
  const endTime = new Date(now);
  endTime.setHours(endH, endM - 10, 0, 0);
  return now < endTime;
}
