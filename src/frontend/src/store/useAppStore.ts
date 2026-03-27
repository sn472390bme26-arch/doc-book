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
const LS_HOSPITALS_INITIALIZED = "meditoken_hospitals_initialized";
const LS_PATIENT_CREDENTIALS = "meditoken_patient_creds";
const LS_PATIENT_NAMES = "meditoken_patient_names";

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

function initDoctors(): Doctor[] {
  return loadLS<Doctor[]>(LS_DOCTORS, []);
}

function initHospitals(): Hospital[] {
  // Only admin-created hospitals persist. No sample data.
  const initialized = loadLS<boolean>(LS_HOSPITALS_INITIALIZED, false);
  if (!initialized) {
    saveLS(LS_HOSPITALS_INITIALIZED, true);
    saveLS(LS_HOSPITALS, []);
    return [];
  }
  return loadLS<Hospital[]>(LS_HOSPITALS, []);
}

export function useAppStore() {
  const [user, setUser] = useState<AppUser | null>(() => loadLS(LS_USER, null));
  const [bookings, setBookings] = useState<Booking[]>(() =>
    loadLS(LS_BOOKINGS, []),
  );
  const [tokenStates, setTokenStates] = useState<
    Record<string, SessionTokenState>
  >(() => loadLS(LS_TOKEN_STATES, {}));
  const [doctors, setDoctors] = useState<Doctor[]>(initDoctors);
  const [hospitals, setHospitals] = useState<Hospital[]>(initHospitals);
  const [patients, setPatients] = useState<PatientRecord[]>(() =>
    loadLS(LS_PATIENTS, []),
  );
  const [notification, setNotification] = useState<string | null>(null);

  const getPatientCredentials = useCallback((): Record<
    string,
    { name: string; password: string }
  > => {
    return loadLS<Record<string, { name: string; password: string }>>(
      LS_PATIENT_CREDENTIALS,
      {},
    );
  }, []);

  const getPatientNameIndex = useCallback((): Record<string, string> => {
    return loadLS<Record<string, string>>(LS_PATIENT_NAMES, {});
  }, []);

  const savePatientCredential = useCallback(
    (email: string, name: string, password: string) => {
      const creds = loadLS<Record<string, { name: string; password: string }>>(
        LS_PATIENT_CREDENTIALS,
        {},
      );
      creds[email.toLowerCase()] = { name, password };
      saveLS(LS_PATIENT_CREDENTIALS, creds);

      const nameIndex = loadLS<Record<string, string>>(LS_PATIENT_NAMES, {});
      nameIndex[name.toLowerCase()] = email.toLowerCase();
      saveLS(LS_PATIENT_NAMES, nameIndex);
    },
    [],
  );

  const login = useCallback((u: AppUser) => {
    setUser(u);
    saveLS(LS_USER, u);
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
      const currentToken = state.currentToken;
      const nextToken = state.nextToken;
      if (currentToken !== null) {
        statuses[currentToken] = "green";
      }
      // Do NOT auto-promote next to orange. Keep nextToken as yellow (notification only).
      let newNextToken = nextToken;
      if (newNextToken === null) {
        const reds = Object.entries(statuses)
          .filter(([, s]) => s === "red")
          .map(([n]) => Number(n))
          .sort((a, b) => a - b);
        if (reds[0] !== undefined) {
          statuses[reds[0]] = "yellow";
          newNextToken = reds[0];
        }
      }
      const updated = {
        ...prev,
        [sessionId]: {
          ...state,
          tokenStatuses: statuses,
          currentToken: null,
          nextToken: newNextToken,
        },
      };
      saveLS(LS_TOKEN_STATES, updated);
      return updated;
    });
  }, []);

  // Skip current token: marks as "unvisited" (skipped), does NOT auto-promote next
  const skipToken = useCallback((sessionId: string) => {
    setTokenStates((prev) => {
      const state = prev[sessionId];
      if (!state) return prev;
      const statuses = { ...state.tokenStatuses };
      const currentToken = state.currentToken;
      const nextToken = state.nextToken;
      if (currentToken !== null) {
        statuses[currentToken] = "unvisited";
      }
      // Do NOT auto-promote next to orange. Keep nextToken as yellow.
      let newNextToken = nextToken;
      if (newNextToken === null) {
        const reds = Object.entries(statuses)
          .filter(([, s]) => s === "red")
          .map(([n]) => Number(n))
          .sort((a, b) => a - b);
        if (reds[0] !== undefined) {
          statuses[reds[0]] = "yellow";
          newNextToken = reds[0];
        }
      }
      const updated = {
        ...prev,
        [sessionId]: {
          ...state,
          tokenStatuses: statuses,
          currentToken: null,
          nextToken: newNextToken,
        },
      };
      saveLS(LS_TOKEN_STATES, updated);
      return updated;
    });
  }, []);

  // Mark a previously skipped token as completed when patient arrives later
  const completeSkippedToken = useCallback(
    (sessionId: string, tokenNum: number) => {
      setTokenStates((prev) => {
        const state = prev[sessionId];
        if (!state) return prev;
        const statuses = { ...state.tokenStatuses };
        if (statuses[tokenNum] === "unvisited") {
          statuses[tokenNum] = "green";
        }
        const updated = {
          ...prev,
          [sessionId]: { ...state, tokenStatuses: statuses },
        };
        saveLS(LS_TOKEN_STATES, updated);
        return updated;
      });
    },
    [],
  );

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
    const savedDocs = loadLS<Doctor[]>(LS_DOCTORS, []);
    let max = 0;
    for (const doc of savedDocs) {
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
    setBookings((prev) => {
      const next = prev.map((b) =>
        b.doctorId === doctorId ? { ...b, status: "cancelled" as const } : b,
      );
      saveLS(LS_BOOKINGS, next);
      return next;
    });
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

  const updateHospital = useCallback(
    (id: string, updates: Partial<Hospital>) => {
      setHospitals((prev) => {
        const next = prev.map((h) => (h.id === id ? { ...h, ...updates } : h));
        saveLS(LS_HOSPITALS, next);
        return next;
      });
    },
    [],
  );

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

  const refreshFromStorage = useCallback(() => {
    setTokenStates(loadLS(LS_TOKEN_STATES, {}));
    setBookings(loadLS(LS_BOOKINGS, []));
  }, []);

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
    skipToken,
    completeSkippedToken,
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
    updateHospital,
    patients,
    getStats,
    notification,
    setNotification,
    getPatientCredentials,
    getPatientNameIndex,
    savePatientCredential,
    refreshFromStorage,
  };
}

export type AppStore = ReturnType<typeof useAppStore>;
