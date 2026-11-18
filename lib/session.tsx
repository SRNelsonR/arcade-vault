"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { SavedScore } from "./scores";

export type { SavedScore };

export interface SessionUser {
  name: string;
}

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";

// --- Mini store sobre localStorage (con respaldo en memoria si está bloqueado) ---

const listeners = new Set<() => void>();
const memory: Record<string, string | null> = {};

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memory[key] ?? null;
  }
}

function write(key: string, value: string | null) {
  memory[key] = value;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // localStorage bloqueado o lleno: la app sigue funcionando sin persistir.
  }
  emit();
}

function parse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return (JSON.parse(raw) as T) ?? fallback;
  } catch {
    return fallback;
  }
}

// --- Context ---

interface SessionContextValue {
  /** null = invitado / sin sesión (también durante SSR y la hidratación). */
  user: SessionUser | null;
  scores: SavedScore[];
  login: (user: SessionUser | null) => void;
  signOut: () => void;
  saveScore: (entry: Omit<SavedScore, "at">) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const EMPTY_SCORES: SavedScore[] = [];

export function SessionProvider({ children }: { children: ReactNode }) {
  // Los snapshots son strings (estables por valor); en el servidor y durante la
  // hidratación se usa null, así no hay hydration mismatch.
  const rawUser = useSyncExternalStore(
    subscribe,
    () => read(USER_KEY),
    () => null,
  );
  const rawScores = useSyncExternalStore(
    subscribe,
    () => read(SCORES_KEY),
    () => null,
  );

  const user = useMemo(() => parse<SessionUser | null>(rawUser, null), [rawUser]);
  const scores = useMemo(() => parse<SavedScore[]>(rawScores, EMPTY_SCORES), [rawScores]);

  const login = useCallback((u: SessionUser | null) => {
    write(USER_KEY, u ? JSON.stringify(u) : null);
  }, []);

  const signOut = useCallback(() => {
    write(USER_KEY, null);
  }, []);

  const saveScore = useCallback((entry: Omit<SavedScore, "at">) => {
    const all = parse<SavedScore[]>(read(SCORES_KEY), []);
    all.push({ ...entry, at: Date.now() });
    write(SCORES_KEY, JSON.stringify(all));
  }, []);

  const value = useMemo(
    () => ({ user, scores, login, signOut, saveScore }),
    [user, scores, login, signOut, saveScore],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}
