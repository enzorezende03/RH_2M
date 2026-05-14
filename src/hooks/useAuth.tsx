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
    let active = true;

    const applySession = (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    };

    const clearInvalidSession = () => {
      applySession(null);
      if (active) setLoading(false);
      void supabase.auth.signOut({ scope: "local" }).catch(() => {});
    };

    const validateStoredSession = async (storedSession: Session | null) => {
      if (!storedSession) {
        applySession(null);
        if (active) setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        clearInvalidSession();
        return;
      }

      if (!active) return;
      setSession(storedSession);
      setUser(data.user);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event === "INITIAL_SESSION") return;

      if (event === "SIGNED_OUT") {
        applySession(null);
        if (active) setLoading(false);
        return;
      }

      if (event === "TOKEN_REFRESHED" && !sess) {
        clearInvalidSession();
        return;
      }

      applySession(sess);
      if (active) setLoading(false);
    });

    void supabase.auth.getSession().then(({ data: { session: storedSession }, error }) => {
      if (error) {
        clearInvalidSession();
        return;
      }

      void validateStoredSession(storedSession);
    });

    return () => {
      active = false;
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
