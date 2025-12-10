import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface School {
  id: string;
  name: string;
  logo_url: string | null;
  country: string | null;
  city: string | null;
  role: string;
  is_primary: boolean;
}

interface SchoolContextType {
  schools: School[];
  currentSchool: School | null;
  setCurrentSchool: (school: School) => void;
  loading: boolean;
  needsSchoolSelection: boolean;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [currentSchool, setCurrentSchoolState] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSchoolSelection, setNeedsSchoolSelection] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserSchools();
    } else {
      setSchools([]);
      setCurrentSchoolState(null);
      setLoading(false);
      setNeedsSchoolSelection(false);
    }
  }, [user]);

  const fetchUserSchools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_schools")
        .select(`
          school_id,
          role,
          is_primary,
          schools (
            id,
            name,
            logo_url,
            country,
            city
          )
        `)
        .eq("user_id", user?.id);

      if (error) throw error;

      const userSchools: School[] = (data || []).map((item: any) => ({
        id: item.schools.id,
        name: item.schools.name,
        logo_url: item.schools.logo_url,
        country: item.schools.country,
        city: item.schools.city,
        role: item.role,
        is_primary: item.is_primary,
      }));

      setSchools(userSchools);

      // Check for stored school preference
      const storedSchoolId = localStorage.getItem(`seed_current_school_${user?.id}`);
      const storedSchool = userSchools.find((s) => s.id === storedSchoolId);

      if (storedSchool) {
        setCurrentSchoolState(storedSchool);
        setNeedsSchoolSelection(false);
      } else if (userSchools.length === 1) {
        // Auto-select if only one school
        setCurrentSchoolState(userSchools[0]);
        setNeedsSchoolSelection(false);
      } else if (userSchools.length > 1) {
        // Check for primary school
        const primarySchool = userSchools.find((s) => s.is_primary);
        if (primarySchool) {
          setCurrentSchoolState(primarySchool);
          setNeedsSchoolSelection(false);
        } else {
          setNeedsSchoolSelection(true);
        }
      } else {
        setNeedsSchoolSelection(false);
      }
    } catch (error) {
      console.error("Error fetching user schools:", error);
    } finally {
      setLoading(false);
    }
  };

  const setCurrentSchool = (school: School) => {
    setCurrentSchoolState(school);
    setNeedsSchoolSelection(false);
    if (user) {
      localStorage.setItem(`seed_current_school_${user.id}`, school.id);
    }
  };

  return (
    <SchoolContext.Provider
      value={{
        schools,
        currentSchool,
        setCurrentSchool,
        loading,
        needsSchoolSelection,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error("useSchool must be used within a SchoolProvider");
  }
  return context;
}
