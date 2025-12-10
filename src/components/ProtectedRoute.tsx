import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSchool } from "@/contexts/SchoolContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { needsSchoolSelection, loading: schoolLoading, currentSchool, schools } = useSchool();
  const location = useLocation();

  if (authLoading || schoolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center animate-pulse">
            <span className="font-display font-bold text-lg text-primary-foreground">S</span>
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has multiple schools and hasn't selected one, redirect to selector
  if (needsSchoolSelection && location.pathname !== "/select-school") {
    return <Navigate to="/select-school" replace />;
  }

  // If user has no schools, allow access but show limited functionality
  if (schools.length === 0 && location.pathname !== "/select-school") {
    return <Navigate to="/select-school" replace />;
  }

  return <>{children}</>;
}
