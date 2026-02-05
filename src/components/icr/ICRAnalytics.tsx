import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Eye,
  FileText,
  Calendar,
  Users,
  Target,
  AlertCircle,
  Download,
  Loader2,
} from "lucide-react";
import {
  calculateICRTotals,
  formatReportMonth,
  type ICRReport,
  type ICRSchool,
} from "@/lib/api/icr";

interface ICRAnalyticsProps {
  reports: ICRReport[];
  school?: ICRSchool;
  isLoading: boolean;
  error: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewReport: (report: ICRReport) => void;
  onDownloadReport: (report: ICRReport) => void;
  downloadingReportId: number | null;
}

export function ICRAnalytics({
  reports,
  school,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  onViewReport,
  onDownloadReport,
  downloadingReportId,
}: ICRAnalyticsProps) {
  // Filter reports by search query
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const query = searchQuery.toLowerCase();
    return reports.filter((report) => {
      const monthYear = formatReportMonth(report.report_month).toLowerCase();
      const clientName = report.client_name.toLowerCase();
      return monthYear.includes(query) || clientName.includes(query);
    });
  }, [searchQuery, reports]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    return calculateICRTotals(reports);
  }, [reports]);

  // Calculate totals for a single report
  const getReportTotals = (report: ICRReport) => {
    const totalLeads = report.lead_generation.reduce((sum, lg) => sum + lg.qualified_leads, 0);
    const totalEngaged = report.lead_engagement.reduce((sum, le) => sum + le.leads_engaged, 0);
    return { totalLeads, totalEngaged };
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published Reports</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold font-display">{summaryStats.publishedReports}</p>
                )}
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold font-display">{summaryStats.totalLeads.toLocaleString()}</p>
                )}
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activities</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold font-display">{summaryStats.totalActivities}</p>
                )}
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold font-display">{summaryStats.totalApplications}</p>
                )}
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Published Reports</CardTitle>
              <CardDescription>Monthly activity reports from your in-country representative</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  className="pl-9 w-64"
                  variant="ghost"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertCircle className="h-12 w-12 text-destructive/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Failed to load reports. Please try again.</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No reports found matching your search." : "No reports available yet."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs h-10">Month</TableHead>
                  <TableHead className="text-xs h-10">Representative</TableHead>
                  <TableHead className="text-xs h-10 text-right">Leads Generated</TableHead>
                  <TableHead className="text-xs h-10 text-right">Leads Engaged</TableHead>
                  <TableHead className="text-xs h-10 text-right">Applications</TableHead>
                  <TableHead className="text-xs h-10 text-right">Admitted</TableHead>
                  <TableHead className="text-xs h-10">Last Updated</TableHead>
                  <TableHead className="text-xs h-10 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report, index) => {
                  const totals = getReportTotals(report);
                  return (
                    <TableRow
                      key={report.report_id}
                      className="animate-fade-in opacity-0"
                      style={{ animationDelay: `${350 + index * 50}ms`, animationFillMode: "forwards" }}
                    >
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">
                          {formatReportMonth(report.report_month)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{report.client_name}</span>
                          <span className="text-xs text-muted-foreground block">{report.client_role}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {totals.totalLeads}
                      </TableCell>
                      <TableCell className="text-right">
                        {totals.totalEngaged}
                      </TableCell>
                      <TableCell className="text-right">
                        {report.application_funnel?.applications_submitted ?? 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {report.application_funnel?.admitted ?? 0}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(report.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewReport(report)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => onDownloadReport(report)}
                            disabled={downloadingReportId === report.report_id}
                          >
                            {downloadingReportId === report.report_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            {downloadingReportId === report.report_id ? "Downloading..." : "Download"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
