import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface School {
  id: string;
  name: string;
  logo_url: string | null;
  country: string | null;
  city: string | null;
  role: string;
  role_name: string;
  is_primary: boolean;
  entity_id?: string;
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
  const { user, portalSchools } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [currentSchool, setCurrentSchoolState] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSchoolSelection, setNeedsSchoolSelection] = useState(false);

  useEffect(() => {
    if (user && portalSchools.length > 0) {
      // Transform portal schools to our School format
      const transformedSchools: School[] = portalSchools.map((ps, index) => ({
        id: ps.id,
        name: ps.name,
        logo_url: null, // Portal API doesn't provide logo
        country: ps.country || null,
        city: null, // Portal API doesn't provide city separately
        role: ps.role,
        role_name: ps.role_name,
        is_primary: index === 0, // First school is primary by default
        entity_id: ps.entity_id,
      }));

      setSchools(transformedSchools);

      // Check for stored school preference
      const storedSchoolId = localStorage.getItem('seed_current_school');
      const storedSchool = transformedSchools.find((s) => s.id === storedSchoolId);

      if (storedSchool) {
        setCurrentSchoolState(storedSchool);
        setNeedsSchoolSelection(false);
      } else if (transformedSchools.length === 1) {
        // Auto-select if only one school
        setCurrentSchoolState(transformedSchools[0]);
        localStorage.setItem('seed_current_school', transformedSchools[0].id);
        setNeedsSchoolSelection(false);
      } else if (transformedSchools.length > 1) {
        // Multiple schools - need selection
        setNeedsSchoolSelection(true);
      } else {
        setNeedsSchoolSelection(false);
      }
      
      setLoading(false);
    } else if (user && portalSchools.length === 0) {
      // User logged in but no schools fetched yet - might still be loading
      setSchools([]);
      setLoading(false);
      setNeedsSchoolSelection(false);
    } else {
      // No user
      setSchools([]);
      setCurrentSchoolState(null);
      setLoading(false);
      setNeedsSchoolSelection(false);
    }
  }, [user, portalSchools]);

  const setCurrentSchool = (school: School) => {
    setCurrentSchoolState(school);
    setNeedsSchoolSelection(false);
    localStorage.setItem('seed_current_school', school.id);
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