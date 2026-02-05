import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  TrendingUp,
  Users,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
} from "lucide-react";
import {
  formatReportMonth,
  activityTypeLabels,
  type ICRReport,
} from "@/lib/api/icr";

// Icon mapping for activity types
const activityIcons: Record<string, React.ReactNode> = {
  phoneCalls: <Phone className="h-3.5 w-3.5" />,
  emailConv: <Mail className="h-3.5 w-3.5" />,
  whatsapp: <MessageSquare className="h-3.5 w-3.5" />,
};

interface ICRReportDetailModalProps {
  report: ICRReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ICRReportDetailModal({ report, open, onOpenChange }: ICRReportDetailModalProps) {
  if (!report) return null;

  const getEngagedCount = () =>
    report.lead_engagement.reduce((sum, le) => sum + le.leads_engaged, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {formatReportMonth(report.report_month)} Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Application Funnel */}
          {report.application_funnel && (
            <div>
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4 pb-2 border-b">
                <TrendingUp className="h-4 w-4" />
                Application Funnel
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Engaged</p>
                  <p className="text-2xl font-bold text-primary">{getEngagedCount()}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Not Interested</p>
                  <p className="text-2xl font-bold">{report.application_funnel.not_interested ?? 0}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Interested 2026</p>
                  <p className="text-2xl font-bold">{report.application_funnel.interested_2026 ?? 0}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Applications</p>
                  <p className="text-2xl font-bold">{report.application_funnel.applications_submitted ?? 0}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Admitted</p>
                  <p className="text-2xl font-bold text-success">{report.application_funnel.admitted ?? 0}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Accepted</p>
                  <p className="text-2xl font-bold">{report.application_funnel.offers_accepted ?? 0}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Enrolled</p>
                  <p className="text-2xl font-bold text-accent">{report.application_funnel.enrolled ?? 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Lead Generation */}
          {report.lead_generation.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4 pb-2 border-b">
                <Users className="h-4 w-4" />
                Lead Generation Activities
              </h4>
              <div className="space-y-3">
                {report.lead_generation.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-muted/30 p-4 rounded-lg border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {activityTypeLabels[activity.activity_type] || activity.activity_type}
                        </span>
                      </div>
                      <Badge variant="secondary" className="font-semibold">
                        {activity.qualified_leads} leads
                      </Badge>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground pl-6">{activity.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lead Engagement */}
          {report.lead_engagement.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4 pb-2 border-b">
                <MessageSquare className="h-4 w-4" />
                Lead Engagement Activities
              </h4>
              <div className="space-y-3">
                {report.lead_engagement.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-muted/30 p-4 rounded-lg border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {activityIcons[activity.activity_type] || <GraduationCap className="h-4 w-4 text-accent" />}
                        <span className="font-medium">
                          {activityTypeLabels[activity.activity_type] || activity.activity_type}
                        </span>
                      </div>
                      <Badge variant="outline" className="font-semibold">
                        {activity.leads_engaged} engaged
                      </Badge>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground pl-6">{activity.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Metadata */}
          <div className="bg-muted/30 rounded-lg p-4 border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Representative:</span>
                <p className="font-medium">{report.client_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span>
                <p className="font-medium">{report.client_role}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{report.client_email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <p className="font-medium">
                  {new Date(report.updated_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
