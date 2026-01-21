import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Download,
  Eye,
  FileText,
  Calendar,
  Users,
  Target,
  TrendingUp,
  MapPin,
  Briefcase,
  GraduationCap,
} from "lucide-react";

// Mock data for ICR reports - replace with API call
interface ICRReport {
  id: string;
  month: string;
  year: number;
  country: string;
  region: string;
  status: "submitted" | "published";
  submittedDate: string;
  publishedDate?: string;
  metrics: {
    leadsCaptured: number;
    eventsAttended: number;
    schoolsVisited: number;
    applicationsGenerated: number;
    conversionsToAdmit: number;
  };
  activities: {
    title: string;
    date: string;
    type: string;
    attendees: number;
    leadsGenerated: number;
    description?: string;
  }[];
  highlights: string[];
}

const mockReports: ICRReport[] = [
  {
    id: "1",
    month: "December",
    year: 2024,
    country: "India",
    region: "South Asia",
    status: "published",
    submittedDate: "2024-12-05",
    publishedDate: "2024-12-08",
    metrics: {
      leadsCaptured: 456,
      eventsAttended: 8,
      schoolsVisited: 12,
      applicationsGenerated: 89,
      conversionsToAdmit: 23,
    },
    activities: [
      {
        title: "IIM Bangalore Campus Visit",
        date: "2024-12-02",
        type: "Campus Visit",
        attendees: 150,
        leadsGenerated: 45,
        description: "Conducted information session and Q&A with prospective MBA students.",
      },
      {
        title: "Delhi Business Education Fair",
        date: "2024-12-05",
        type: "Education Fair",
        attendees: 320,
        leadsGenerated: 98,
        description: "Participated in annual education fair, engaged with working professionals.",
      },
    ],
    highlights: [
      "Strong engagement from tier-2 cities",
      "30% increase in qualified leads vs. last month",
      "Partnership discussions with 3 new universities",
    ],
  },
  {
    id: "2",
    month: "November",
    year: 2024,
    country: "India",
    region: "South Asia",
    status: "published",
    submittedDate: "2024-11-28",
    publishedDate: "2024-12-01",
    metrics: {
      leadsCaptured: 389,
      eventsAttended: 6,
      schoolsVisited: 10,
      applicationsGenerated: 72,
      conversionsToAdmit: 18,
    },
    activities: [
      {
        title: "Mumbai MBA Summit",
        date: "2024-11-15",
        type: "Summit",
        attendees: 280,
        leadsGenerated: 76,
      },
    ],
    highlights: [
      "Successful webinar series launch",
      "15% improvement in lead quality",
    ],
  },
  {
    id: "3",
    month: "October",
    year: 2024,
    country: "India",
    region: "South Asia",
    status: "published",
    submittedDate: "2024-10-25",
    publishedDate: "2024-10-28",
    metrics: {
      leadsCaptured: 312,
      eventsAttended: 5,
      schoolsVisited: 8,
      applicationsGenerated: 56,
      conversionsToAdmit: 14,
    },
    activities: [],
    highlights: ["Focus on digital engagement", "New social media strategy implemented"],
  },
];

const statusStyles = {
  submitted: "bg-warning/10 text-warning border-warning/20",
  published: "bg-success/10 text-success border-success/20",
};

export default function InCountryReports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<ICRReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return mockReports;
    const query = searchQuery.toLowerCase();
    return mockReports.filter(
      (report) =>
        report.month.toLowerCase().includes(query) ||
        report.country.toLowerCase().includes(query) ||
        report.region.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleViewReport = (report: ICRReport) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleDownloadReport = (reportId: string) => {
    // TODO: Implement download via API
    console.log("Downloading report:", reportId);
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalLeads = mockReports.reduce((sum, r) => sum + r.metrics.leadsCaptured, 0);
    const totalEvents = mockReports.reduce((sum, r) => sum + r.metrics.eventsAttended, 0);
    const totalApplications = mockReports.reduce((sum, r) => sum + r.metrics.applicationsGenerated, 0);
    const publishedReports = mockReports.filter((r) => r.status === "published").length;
    return { totalLeads, totalEvents, totalApplications, publishedReports };
  }, []);

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">
            In-Country <span className="text-primary">Representation</span> Reports
          </h1>
          <p className="text-muted-foreground">
            View and download monthly activity reports from your regional representatives.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published Reports</p>
                <p className="text-2xl font-bold font-display">{summaryStats.publishedReports}</p>
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
                <p className="text-2xl font-bold font-display">{summaryStats.totalLeads.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">Events Attended</p>
                <p className="text-2xl font-bold font-display">{summaryStats.totalEvents}</p>
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
                <p className="text-sm text-muted-foreground">Applications Generated</p>
                <p className="text-2xl font-bold font-display">{summaryStats.totalApplications}</p>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No reports found matching your search.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Events</TableHead>
                  <TableHead className="text-right">Applications</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report, index) => (
                  <TableRow
                    key={report.id}
                    className="animate-fade-in opacity-0"
                    style={{ animationDelay: `${350 + index * 50}ms`, animationFillMode: "forwards" }}
                  >
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">
                        {report.month} {report.year}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{report.country}</span>
                        <span className="text-xs text-muted-foreground">({report.region})</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {report.metrics.leadsCaptured}
                    </TableCell>
                    <TableCell className="text-right">{report.metrics.eventsAttended}</TableCell>
                    <TableCell className="text-right">{report.metrics.applicationsGenerated}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[report.status]}
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {report.publishedDate
                        ? new Date(report.publishedDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleDownloadReport(report.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Report Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {selectedReport?.month} {selectedReport?.year} Report
            </DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              {/* Funnel Metrics */}
              <div>
                <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4 pb-2 border-b">
                  <TrendingUp className="h-4 w-4" />
                  Performance Funnel
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Leads</p>
                    <p className="text-2xl font-bold text-primary">{selectedReport.metrics.leadsCaptured}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Events</p>
                    <p className="text-2xl font-bold text-primary">{selectedReport.metrics.eventsAttended}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Schools</p>
                    <p className="text-2xl font-bold text-primary">{selectedReport.metrics.schoolsVisited}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Applications</p>
                    <p className="text-2xl font-bold text-primary">{selectedReport.metrics.applicationsGenerated}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Admits</p>
                    <p className="text-2xl font-bold text-primary">{selectedReport.metrics.conversionsToAdmit}</p>
                  </div>
                </div>
              </div>

              {/* Activities */}
              {selectedReport.activities.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4 pb-2 border-b">
                    <Briefcase className="h-4 w-4" />
                    Activities Conducted
                  </h4>
                  <div className="space-y-3">
                    {selectedReport.activities.map((activity, idx) => (
                      <div key={idx} className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex flex-wrap justify-between gap-2 mb-2">
                          <span className="font-medium">{activity.title}</span>
                          <Badge variant="secondary">{activity.type}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(activity.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {activity.attendees} attendees
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3.5 w-3.5" />
                            {activity.leadsGenerated} leads
                          </span>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground italic">{activity.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {selectedReport.highlights.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4 pb-2 border-b">
                    <GraduationCap className="h-4 w-4" />
                    Key Highlights
                  </h4>
                  <ul className="space-y-2">
                    {selectedReport.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleDownloadReport(selectedReport.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
