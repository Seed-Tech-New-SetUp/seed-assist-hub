import { getCookie, AUTH_COOKIES } from "@/lib/utils/cookies";

export interface UniversityApplication {
  record_id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  program_name: string;
  intake: string;
  status: string;
  created_at: string;
}

export interface ApplicationsResponse {
  success: boolean;
  data?: {
    applications: UniversityApplication[];
    meta?: {
      total_applications: number;
      filtered_count: number;
      status_counts: Record<string, number>;
    };
    filter_options?: {
      statuses: string[];
      intakes: string[];
      programs: string[];
    };
    school?: {
      university: string;
      school_name: string;
    };
  };
  error?: string;
}

function getAuthToken(): string | null {
  return getCookie(AUTH_COOKIES.TOKEN) || getCookie("auth_token");
}

export async function fetchApplications(params?: {
  search?: string;
  status?: string;
  program?: string;
  page?: number;
  limit?: number;
}): Promise<ApplicationsResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  // Build query string
  const queryParams = new URLSearchParams({ action: "list" });
  if (params?.search) queryParams.append("search", params.search);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.program) queryParams.append("program", params.program);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/applications-proxy?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch applications");
  }

  return response.json();
}

export function getApplicationsExportUrl(): string {
  const token = getAuthToken();
  if (!token) return "";

  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/applications-proxy?action=export`;
}

export async function downloadApplicationsExport(): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  // Create a hidden form to POST with auth headers via a different approach
  // Since we can't add headers to direct links, we'll use the proxy with token in URL
  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/applications-proxy`;
  const params = new URLSearchParams({
    action: "export",
    token: token, // Pass token as query param for direct download
  });
  
  // Open in new tab - the proxy will handle auth from query param
  window.open(`${baseUrl}?${params.toString()}`, "_blank");
}
