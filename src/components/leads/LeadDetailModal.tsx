import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Lead {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_name: string;
  registration_date: string;
  programs_viewed: string;
  intended_study_level: string;
  intended_subject_area: string;
  intended_pg_program_start_year: string;
  utm_sources: string;
  page_views: number;
  total_clicks: number;
  last_activity: string;
}

interface LeadDetailModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailModal({ lead, open, onOpenChange }: LeadDetailModalProps) {
  if (!lead) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "MMM d, yyyy HH:mm");
    } catch {
      return dateStr;
    }
  };

  // Parse utm_sources to extract source/medium/campaign
  const parseUtmSources = (utm: string) => {
    if (!utm || utm.trim() === "" || utm === ",") {
      return { source: "Direct", medium: "", campaign: "" };
    }
    // Simple parsing - first non-empty value as source
    const sources = utm.split(",").map(s => s.trim()).filter(Boolean);
    return {
      source: sources[0] || "Direct",
      medium: "",
      campaign: "",
    };
  };

  const utmData = parseUtmSources(lead.utm_sources);

  // Decode HTML entities in subject area
  const decodeHtml = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-700">Lead Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Personal Information */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-slate-700 text-lg">Personal Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-slate-700">Full Name:</span>{" "}
                <span className="text-slate-600">{lead.first_name} {lead.last_name}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Email:</span>{" "}
                <span className="text-slate-600">{lead.email}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Phone:</span>{" "}
                <span className="text-slate-600">{lead.phone || "-"}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Country:</span>{" "}
                <span className="text-slate-600">{lead.country_name}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Registered:</span>{" "}
                <span className="text-slate-600">{formatDate(lead.registration_date)}</span>
              </div>
            </div>
          </div>

          {/* Academic Interests */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-slate-700 text-lg">Academic Interests</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-slate-700">Program:</span>{" "}
                <span className="text-slate-600">{lead.programs_viewed || "-"}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Study Level:</span>{" "}
                <span className="text-slate-600">{lead.intended_study_level || "-"}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Subject Area:</span>{" "}
                <span className="text-slate-600">{decodeHtml(lead.intended_subject_area || "-")}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Start Year:</span>{" "}
                <span className="text-slate-600">{lead.intended_pg_program_start_year || "-"}</span>
              </div>
            </div>
          </div>

          {/* Source Information */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-slate-700 text-lg">Source Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-slate-700">Source:</span>{" "}
                <span className="text-slate-600">{utmData.source}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Medium:</span>{" "}
                <span className="text-slate-600">{utmData.medium || "-"}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Campaign:</span>{" "}
                <span className="text-slate-600">{utmData.campaign || "-"}</span>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-slate-700 text-lg">Activity</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-slate-700">Page Views:</span>{" "}
                <span className="text-slate-600">{lead.page_views}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Total Clicks:</span>{" "}
                <span className="text-slate-600">{lead.total_clicks}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Last Activity:</span>{" "}
                <span className="text-slate-600">{formatDateTime(lead.last_activity)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
