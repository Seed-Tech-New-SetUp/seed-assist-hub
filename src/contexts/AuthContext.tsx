import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface PortalSchool {
  id: string;
  mapping_id: string;
  entity_id: string;
  name: string;
  role: string;
  role_name: string;
  country: string;
  country_code: string;
}

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
  schools?: PortalSchool[];
}

interface AuthContextType {
  user: User | PortalUser | null;
  session: Session | null;
  loading: boolean;
  portalToken: string | null;
  portalSchools: PortalSchool[];
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | PortalUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [portalToken, setPortalToken] = useState<string | null>(null);
  const [portalSchools, setPortalSchools] = useState<PortalSchool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored portal session first
    const storedPortalUser = localStorage.getItem('portal_user');
    const storedPortalToken = localStorage.getItem('portal_token');
    const storedPortalSchools = localStorage.getItem('portal_schools');
    
    if (storedPortalUser && storedPortalToken) {
      try {
        const parsedUser = JSON.parse(storedPortalUser);
        setUser(parsedUser);
        setPortalToken(storedPortalToken);
        if (storedPortalSchools) {
          setPortalSchools(JSON.parse(storedPortalSchools));
        }
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('portal_user');
        localStorage.removeItem('portal_token');
        localStorage.removeItem('portal_schools');
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

  const fetchMemberSchools = async (token: string, email: string): Promise<PortalSchool[]> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portal-auth?action=members-by-email&email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch member schools');
        return [];
      }

      const result = await response.json();
      console.log('Member schools fetched:', result);

      if (!result.success || !result.data) {
        return [];
      }

      // Transform the portal API response to our PortalSchool format
      return result.data.map((member: any) => ({
        id: member.company?.company_id?.toString() || member.id?.toString(),
        mapping_id: member.mapping_id,
        entity_id: member.company?.entity_id,
        name: member.company?.organization_name || 'Unknown School',
        role: member.role?.role || member.company?.member_type || 'member',
        role_name: member.role?.role_name || member.company?.member_type_label || 'Member',
        country: member.country?.country_name || '',
        country_code: member.country?.country_code || '',
      }));
    } catch (err) {
      console.error('Error fetching member schools:', err);
      return [];
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

      // Extract token from login response
      const token = data.data?.access_token || data.access_token || data.token || 'portal_authenticated';
      const loginUser = data.data?.user || data.user;
      
      // Fetch member schools using the token
      const schools = await fetchMemberSchools(token, email);
      
      // Create portal user from login response
      const portalUser: PortalUser = {
        id: loginUser?.id || email,
        email: email,
        full_name: loginUser?.full_name || loginUser?.name || email.split('@')[0],
        user_metadata: {
          full_name: loginUser?.full_name || loginUser?.name || email.split('@')[0],
        },
        phone: loginUser?.phone?.toString(),
        schools: schools,
      };
      
      localStorage.setItem('portal_user', JSON.stringify(portalUser));
      localStorage.setItem('portal_token', token);
      localStorage.setItem('portal_schools', JSON.stringify(schools));
      
      setUser(portalUser);
      setPortalToken(token);
      setPortalSchools(schools);

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
    localStorage.removeItem('portal_schools');
    localStorage.removeItem('seed_current_school');
    setUser(null);
    setPortalToken(null);
    setPortalSchools([]);
    
    // Also sign out from Supabase if there's a session
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, portalToken, portalSchools, signIn, signUp, signOut }}>
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