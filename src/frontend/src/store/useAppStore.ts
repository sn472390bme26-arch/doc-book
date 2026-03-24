import { useCallback, useState } from "react";
import type {
  AppUser,
  Booking,
  Doctor,
  Hospital,
  PatientRecord,
  PrioritySlotState,
  SessionTokenState,
  TokenStatus,
} from "../types";

const LS_USER = "meditoken_user";
const LS_BOOKINGS = "meditoken_bookings";
const LS_TOKEN_STATES = "meditoken_token_states";
const LS_DOCTORS = "meditoken_doctors";
const LS_HOSPITALS = "meditoken_hospitals";
const LS_PATIENTS = "meditoken_patients";

function loadLS<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

import {
  DOCTORS as SEED_DOCTORS,
  HOSPITALS as SEED_HOSPITALS,
} from "../data/seed";

export function useAppStore() {
  const [user, setUser] = useState<AppUser | null>(() => loadLS(LS_USER, null));
  const [bookings, setBookings] = useState<Booking[]>(() =>
    loadLS(LS_BOOKINGS, []),
  );
  const [tokenStates, setTokenStates] = useState<
    Record<string, SessionTokenState>
  >(() => loadLS(LS_TOKEN_STATES, {}));
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = loadLS<Doctor[]>(LS_DOCTORS, []);
    // Merge saved overrides with seed doctors
    const seedMerged = SEED_DOCTORS.map((sd) => {
      const override = saved.find((d) => d.id === sd.id);
      return override ?? sd;
    });
    // Add any extra doctors not in seed
    const extraDoctors = saved.filter(
      (sd) => !SEED_DOCTORS.find((seed) => seed.id === sd.id),
    );
    return [...seedMerged, ...extraDoctors];
  });
  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    const saved = loadLS<Hospital[]>(LS_HOSPITALS, []);
    if (saved.length === 0) return SEED_HOSPITALS;
    // Merge saved with seeds
    const seedMerged = SEED_HOSPITALS.map((sh) => {
      const override = saved.find((h) => h.id === sh.id);
      return override ?? sh;
    });
    const extra = saved.filter(
      (h) => !SEED_HOSPITALS.find((seed) => seed.id === h.id),
    );
    return [...seedMerged, ...extra];
  });
  const [patients, setPatients] = useState<PatientRecord[]>(() =>
    loadLS(LS_PATIENTS, []),
  );
  const [notification, setNotification] = useState<string | null>(null);

  const login = useCallback((u: AppUser) => {
    setUser(u);
    saveLS(LS_USER, u);
    // Register patient on login
    if (u.role === "patient") {
      setPatients((prev) => {
        if (prev.find((p) => p.id === u.id)) return prev;
        const next = [
          ...prev,
          {
            id: u.id,
            name: u.name,
            email: u.email,
            createdAt: new Date().toISOString(),
          },
        ];
        saveLS(LS_PATIENTS, next);
        return next;
      });
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(LS_USER);
  }, []);

  const addBooking = useCallback((b: Booking) => {
    setBookings((prev) => {
      const next = [...prev, b];
      saveLS(LS_BOOKINGS, next);
      return next;
    });
  }, []);

  const getOrCreateTokenState = useCallback(
    (
      sessionId: string,
      doctorId: string,
      date: string,
      session: string,
    ): SessionTokenState => {
      return (
        tokenStates[sessionId] ?? {
          sessionId,
          doctorId,
          date,
          session,
          tokenStatuses: {},
          prioritySlots: {},
          currentToken: null,
          nextToken: null,
          isClosed: false,
          cancelledSessions: [],
        }
      );
    },
    [tokenStates],
  );

  const bookToken = useCallback(
    (
      sessionId: string,
      doctorId: string,
      date: string,
      session: string,
      tokenNumber: number,
    ) => {
      setTokenStates((prev) => {
        const existing = prev[sessionId] ?? {
          sessionId,
          doctorId,
          date,
          session,
          tokenStatuses: {},
          prioritySlots: {},
          currentToken: null,
          nextToken: null,
          isClosed: false,
          cancelledSessions: [],
        };
        const next = {
          ...existing,
          tokenStatuses: {
            ...existing.tokenStatuses,
            [tokenNumber]: "red" as TokenStatus,
          },
        };
        const updated = { ...prev, [sessionId]: next };
        saveLS(LS_TOKEN_STATES, updated);
        return updated;
      });
    },
    [],
  );

  const regulateToken = useCallback(
    (sessionId: string, clickedToken: number) => {
      setTokenStates((prev) => {
        const state = prev[sessionId];
        if (!state) return prev;

        const statuses = { ...state.tokenStatuses };
        let currentToken = state.currentToken;
        let nextToken = state.nextToken;

        if (currentToken !== null && currentToken !== clickedToken) {
          statuses[currentToken] = "green";
        }

        statuses[clickedToken] = "orange";
        currentToken = clickedToken;

        const redTokens = Object.entries(statuses)
          .filter(([n, s]) => s === "red" && Number(n) !== clickedToken)
          .map(([n]) => Number(n))
          .sort((a, b) => a - b);

        if (nextToken !== null && statuses[nextToken] === "yellow") {
          statuses[nextToken] = "red";
        }

        const nextRed = redTokens[0] ?? null;
        if (nextRed !== null) {
          statuses[nextRed] = "yellow";
        }
        nextToken = nextRed;

        const updated = {
          ...prev,
          [sessionId]: {
            ...state,
            tokenStatuses: statuses,
            currentToken,
            nextToken,
          },
        };
        saveLS(LS_TOKEN_STATES, updated);
        return updated;
      });
    },
    [],
  );

  const completeCurrentToken = useCallback((sessionId: string) => {
    setTokenStates((prev) => {
      const state = prev[sessionId];
      if (!state) return prev;

      const statuses = { ...state.tokenStatuses };
      let currentToken = state.currentToken;
      let nextToken = state.nextToken;

      if (currentToken !== null) {
        statuses[currentToken] = "green";
      }

      if (nextToken !== null) {
        statuses[nextToken] = "orange";
        currentToken = nextToken;

        const reds = Object.entries(statuses)
          .filter(([n, s]) => s === "red" && Number(n) !== nextToken)
          .map(([n]) => Number(n))
          .sort((a, b) => a - b);

        if (reds[0] !== undefined) {
          statuses[reds[0]] = "yellow";
          nextToken = reds[0];
        } else {
          nextToken = null;
        }
      } else {
        currentToken = null;
      }

      const updated = {
        ...prev,
        [sessionId]: {
          ...state,
          tokenStatuses: statuses,
          currentToken,
          nextToken,
        },
      };
      saveLS(LS_TOKEN_STATES, updated);
      return updated;
    });
  }, []);

  const closeSession = useCallback((sessionId: string) => {
    setTokenStates((prev) => {
      const state = prev[sessionId];
      if (!state) return prev;

      const statuses = { ...state.tokenStatuses };
      for (const [n, s] of Object.entries(statuses)) {
        if (s === "red" || s === "yellow") {
          statuses[Number(n)] = "unvisited";
        }
      }

      const updated = {
        ...prev,
        [sessionId]: { ...state, tokenStatuses: statuses, isClosed: true },
      };
      saveLS(LS_TOKEN_STATES, updated);
      return updated;
    });
    setBookings((prev) => {
      const next = prev.map((b) =>
        b.sessionId === sessionId && b.status === "confirmed"
          ? { ...b, status: "unvisited" as const }
          : b,
      );
      saveLS(LS_BOOKINGS, next);
      return next;
    });
  }, []);

  const setPrioritySlot = useCallback(
    (sessionId: string, slotIndex: number, slot: PrioritySlotState) => {
      setTokenStates((prev) => {
        const state = prev[sessionId];
        if (!state) return prev;
        const updated = {
          ...prev,
          [sessionId]: {
            ...state,
            prioritySlots: { ...state.prioritySlots, [slotIndex]: slot },
          },
        };
        saveLS(LS_TOKEN_STATES, updated);
        return updated;
      });
    },
    [],
  );

  const cancelSession = useCallback(
    (doctorId: string, date: string, session: string) => {
      const key = `${doctorId}_${date}_${session}`;
      setTokenStates((prev) => {
        const cancelledKey = "__cancelled__";
        const existing = prev[cancelledKey] ?? {
          sessionId: cancelledKey,
          doctorId: "",
          date: "",
          session: "morning",
          tokenStatuses: {},
          prioritySlots: {},
          currentToken: null,
          nextToken: null,
          isClosed: false,
          cancelledSessions: [],
        };
        const next = {
          ...prev,
          [cancelledKey]: {
            ...existing,
            cancelledSessions: [...(existing.cancelledSessions ?? []), key],
          },
        };
        saveLS(LS_TOKEN_STATES, next);
        return next;
      });
    },
    [],
  );

  const isSessionCancelled = useCallback(
    (doctorId: string, date: string, session: string): boolean => {
      const key = `${doctorId}_${date}_${session}`;
      const cancelledEntry = tokenStates.__cancelled__;
      return cancelledEntry?.cancelledSessions?.includes(key) ?? false;
    },
    [tokenStates],
  );

  const updateDoctor = useCallback(
    (doctorId: string, updates: Partial<Doctor>) => {
      setDoctors((prev) => {
        const next = prev.map((d) =>
          d.id === doctorId ? { ...d, ...updates } : d,
        );
        saveLS(LS_DOCTORS, next);
        return next;
      });
    },
    [],
  );

  const addDoctor = useCallback((d: Omit<Doctor, "id" | "code">): Doctor => {
    // Generate sequential code
    let maxNum = 0;
    setDoctors((prev) => {
      for (const doc of prev) {
        if (doc.code) {
          const match = doc.code.match(/DOC-?(\d+)/i);
          if (match) {
            const num = Number.parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        }
      }
      return prev;
    });
    // Read current doctors synchronously by using a ref-style approach
    // We'll compute max from the current state
    const savedDocs = loadLS<Doctor[]>(LS_DOCTORS, []);
    const allCodes = [...SEED_DOCTORS, ...savedDocs];
    let max = 0;
    for (const doc of allCodes) {
      if (doc.code) {
        const match = doc.code.match(/DOC-?(\d+)/i);
        if (match) {
          const num = Number.parseInt(match[1], 10);
          if (num > max) max = num;
        }
      }
    }
    const nextNum = max + 1;
    const code = `DOC-${String(nextNum).padStart(5, "0")}`;
    const id = `d_${Date.now()}`;
    const newDoctor: Doctor = { ...d, id, code };
    setDoctors((prev) => {
      const next = [...prev, newDoctor];
      saveLS(LS_DOCTORS, next);
      return next;
    });
    return newDoctor;
  }, []);

  const deleteDoctor = useCallback((doctorId: string) => {
    setDoctors((prev) => {
      const next = prev.filter((d) => d.id !== doctorId);
      saveLS(LS_DOCTORS, next);
      return next;
    });
    // Cascade: cancel bookings for this doctor
    setBookings((prev) => {
      const next = prev.map((b) =>
        b.doctorId === doctorId ? { ...b, status: "cancelled" as const } : b,
      );
      saveLS(LS_BOOKINGS, next);
      return next;
    });
    // Remove tokenStates for this doctor's sessions
    setTokenStates((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (next[key].doctorId === doctorId) {
          delete next[key];
        }
      }
      saveLS(LS_TOKEN_STATES, next);
      return next;
    });
  }, []);

  const addHospital = useCallback((h: Hospital) => {
    setHospitals((prev) => {
      const next = [...prev, h];
      saveLS(LS_HOSPITALS, next);
      return next;
    });
  }, []);

  const deleteHospital = useCallback(
    (id: string, currentDoctors: Doctor[]): boolean => {
      const hasDoctors = currentDoctors.some((d) => d.hospitalId === id);
      if (hasDoctors) return false;
      setHospitals((prev) => {
        const next = prev.filter((h) => h.id !== id);
        saveLS(LS_HOSPITALS, next);
        return next;
      });
      return true;
    },
    [],
  );

  const updateHospitalPhoto = useCallback((id: string, photoUrl: string) => {
    setHospitals((prev) => {
      const next = prev.map((h) => (h.id === id ? { ...h, photoUrl } : h));
      saveLS(LS_HOSPITALS, next);
      return next;
    });
  }, []);

  const getStats = useCallback(() => {
    const activeSessions = Object.values(tokenStates).filter(
      (s) =>
        !s.isClosed &&
        s.sessionId !== "__cancelled__" &&
        s.currentToken !== null,
    ).length;
    return {
      totalHospitals: hospitals.length,
      totalDoctors: doctors.length,
      totalPatients: patients.length,
      totalBookings: bookings.length,
      activeSessions,
    };
  }, [hospitals, doctors, patients, bookings, tokenStates]);

  const getBookingsForPatient = useCallback(
    (patientId: string) => {
      return bookings.filter((b) => b.patientId === patientId);
    },
    [bookings],
  );

  const getBookingsForSession = useCallback(
    (sessionId: string) => {
      return bookings.filter((b) => b.sessionId === sessionId);
    },
    [bookings],
  );

  return {
    user,
    login,
    logout,
    bookings,
    addBooking,
    getBookingsForPatient,
    getBookingsForSession,
    tokenStates,
    getOrCreateTokenState,
    bookToken,
    regulateToken,
    completeCurrentToken,
    closeSession,
    setPrioritySlot,
    cancelSession,
    isSessionCancelled,
    doctors,
    updateDoctor,
    addDoctor,
    deleteDoctor,
    hospitals,
    addHospital,
    deleteHospital,
    updateHospitalPhoto,
    patients,
    getStats,
    notification,
    setNotification,
  };
}

export type AppStore = ReturnType<typeof useAppStore>;
