import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const AUTH_INIT_TIMEOUT_MS = 4000;
const AUTH_REQUEST_TIMEOUT_MS = 3000;

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let initTimeoutId: number | null = null;

    const applySession = (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    };

    const finishLoading = () => {
      if (initTimeoutId !== null) {
        window.clearTimeout(initTimeoutId);
        initTimeoutId = null;
      }

      if (active) setLoading(false);
    };

    const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number) => {
      return await Promise.race<T>([
        promise,
        new Promise<T>((_, reject) => {
          window.setTimeout(() => reject(new Error("auth-timeout")), timeoutMs);
        }),
      ]);
    };

    const scheduleLocalSignOut = (clearStorage = false) => {
      window.setTimeout(() => {
        if (clearStorage) {
          try {
            Object.keys(window.localStorage)
              .filter((key) => key.startsWith("sb-"))
              .forEach((key) => window.localStorage.removeItem(key));
          } catch {
            // noop
          }
        }

        void supabase.auth.signOut({ scope: "local" }).catch(() => {});
      }, 0);
    };

    const clearInvalidSession = (clearStorage = false) => {
      applySession(null);
      finishLoading();
      scheduleLocalSignOut(clearStorage);
    };

    const validateStoredSession = async (storedSession: Session | null) => {
      if (!storedSession) {
        applySession(null);
        finishLoading();
        return;
      }

      try {
        const { data, error } = await withTimeout(supabase.auth.getUser(), AUTH_REQUEST_TIMEOUT_MS);

        if (error || !data.user) {
          console.warn("Sessão inválida detectada na inicialização; limpando autenticação local.");
          clearInvalidSession(true);
          return;
        }

        if (!active) return;
        setSession(storedSession);
        setUser(data.user);
        finishLoading();
      } catch {
        console.warn("Inicialização de autenticação excedeu o tempo limite; limpando sessão local.");
        clearInvalidSession(true);
      }
    };

    initTimeoutId = window.setTimeout(() => {
      if (!active) return;
      console.warn("Autenticação demorou demais para iniciar; redirecionando para login limpo.");
      clearInvalidSession(true);
    }, AUTH_INIT_TIMEOUT_MS);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event === "INITIAL_SESSION") return;

      if (event === "SIGNED_OUT") {
        applySession(null);
        finishLoading();
        return;
      }

      if (!sess) {
        applySession(null);
        finishLoading();
        return;
      }

      applySession(sess);
      finishLoading();
    });

    void withTimeout(supabase.auth.getSession(), AUTH_REQUEST_TIMEOUT_MS)
      .then(({ data: { session: storedSession }, error }) => {
        if (error) {
          clearInvalidSession(true);
          return;
        }

        void validateStoredSession(storedSession);
      })
      .catch(() => {
        console.warn("Não foi possível restaurar a sessão salva; limpando autenticação local.");
        clearInvalidSession(true);
      });

    return () => {
      active = false;
      if (initTimeoutId !== null) window.clearTimeout(initTimeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut({ scope: "local" });
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
