import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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
    let mounted = true;

    const applySession = (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    };

    const finishLoading = () => {
      if (mounted) setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
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

    void supabase.auth.getSession()
      .then(({ data: { session: storedSession }, error }) => {
        if (error) {
          console.warn("Não foi possível restaurar a sessão salva.", error);
          applySession(null);
          finishLoading();
          return;
        }

        applySession(storedSession ?? null);
        finishLoading();
      })
      .catch(() => {
        console.warn("Não foi possível restaurar a sessão salva.");
        applySession(null);
        finishLoading();
      });

    return () => {
      mounted = false;
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
