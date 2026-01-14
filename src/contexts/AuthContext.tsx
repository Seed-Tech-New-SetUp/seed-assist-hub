import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface PortalUser {
  id: string;
  email: string;
  full_name?: string;
  user_metadata?: {
    full_name?: string;
  };
  // Extended user info from /me endpoint
  role?: string;
  phone?: string;
  avatar_url?: string;
  organization?: string;
  schools?: Array<{ id: string; name: string }>;
}

interface AuthContextType {
  user: User | PortalUser | null;
  session: Session | null;
  loading: boolean;
  portalToken: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | PortalUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [portalToken, setPortalToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored portal session first
    const storedPortalUser = localStorage.getItem('portal_user');
    const storedPortalToken = localStorage.getItem('portal_token');
    
    if (storedPortalUser && storedPortalToken) {
      try {
        const parsedUser = JSON.parse(storedPortalUser);
        setUser(parsedUser);
        setPortalToken(storedPortalToken);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('portal_user');
        localStorage.removeItem('portal_token');
      }
    }

    // Fallback to Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserInfo = async (token: string): Promise<PortalUser | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('portal-auth', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: null,
        method: 'GET',
      });

      // Use query param approach since invoke doesn't support GET with query params well
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portal-auth?action=me`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch user info');
        return null;
      }

      const userData = await response.json();
      console.log('User info fetched:', userData);

      return {
        id: userData.id || userData.member?.id,
        email: userData.email || userData.member?.email,
        full_name: userData.name || userData.member?.name,
        user_metadata: {
          full_name: userData.name || userData.member?.name,
        },
        role: userData.role || userData.member?.role,
        phone: userData.phone || userData.member?.phone,
        avatar_url: userData.avatar_url || userData.member?.avatar_url,
        organization: userData.organization || userData.member?.organization,
        schools: userData.schools || userData.member?.schools,
      };
    } catch (err) {
      console.error('Error fetching user info:', err);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('portal-auth', {
        body: { email, password },
      });

      if (error) {
        console.error('Portal auth error:', error);
        return { error: new Error(error.message || 'Login failed') };
      }

      if (data.error) {
        return { error: new Error(data.error) };
      }

      const token = data.token || data.access_token || 'portal_authenticated';
      
      // Fetch complete user info using the token
      let portalUser = await fetchUserInfo(token);
      
      // Fallback to login response data if /me fails
      if (!portalUser) {
        portalUser = {
          id: data.user?.id || data.member?.id || email,
          email: email,
          full_name: data.user?.name || data.member?.name || email.split('@')[0],
          user_metadata: {
            full_name: data.user?.name || data.member?.name || email.split('@')[0],
          },
        };
      }
      
      localStorage.setItem('portal_user', JSON.stringify(portalUser));
      localStorage.setItem('portal_token', token);
      
      setUser(portalUser);
      setPortalToken(token);

      return { error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // For now, signup still uses Supabase or could be extended to portal
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Clear portal session
    localStorage.removeItem('portal_user');
    localStorage.removeItem('portal_token');
    setUser(null);
    setPortalToken(null);
    
    // Also sign out from Supabase if there's a session
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, portalToken, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
