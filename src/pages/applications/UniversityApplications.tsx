import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Download, Search, FileSpreadsheet, Users, GraduationCap, Clock, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  UniversityApplication,
  fetchApplications,
  downloadApplicationsExport,
} from "@/lib/api/applications";

const statusConfig: Record<UniversityApplication["status"], { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  under_review: { label: "Under Review", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  admitted: { label: "Admitted", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  rejected: { label: "Rejected", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  waitlisted: { label: "Waitlisted", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
};

export default function UniversityApplications() {
  const [applications, setApplications] = useState<UniversityApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    admitted: 0,
    pending: 0,
  });

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchApplications({ search: searchQuery });
      if (response.success && response.data) {
        setApplications(response.data.applications || []);
        if (response.data.stats) {
          setStats({
            total: response.data.stats.total || 0,
            admitted: response.data.stats.admitted || 0,
            pending: (response.data.stats.pending || 0) + (response.data.stats.under_review || 0),
          });
        } else {
          // Calculate stats from data
          const apps = response.data.applications || [];
          setStats({
            total: apps.length,
            admitted: apps.filter((a) => a.status === "admitted").length,
            pending: apps.filter((a) => a.status === "pending" || a.status === "under_review").length,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Filter locally for immediate search feedback
  const filteredApplications = applications.filter(
    (app) =>
      app.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.program?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.nationality?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await downloadApplicationsExport();
      toast({
        title: "Success",
        description: "Export downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to download export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Application Pipeline
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              All student applications submitted via SEED
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadApplications} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={handleDownload} disabled={isExporting} className="gap-2">
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download XLSX
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admitted</p>
                <p className="text-2xl font-bold text-foreground">{stats.admitted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                Applications List
              </CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">Loading applications...</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Student Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Nationality</TableHead>
                        <TableHead>CGPA</TableHead>
                        <TableHead>Work Exp.</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                            No applications found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredApplications.map((app) => (
                          <TableRow key={app.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{app.student_name}</TableCell>
                            <TableCell className="text-muted-foreground">{app.email}</TableCell>
                            <TableCell>{app.program}</TableCell>
                            <TableCell>{app.nationality}</TableCell>
                            <TableCell>{app.cgpa}</TableCell>
                            <TableCell>{app.work_experience}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {app.application_date ? new Date(app.application_date).toLocaleDateString() : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusConfig[app.status]?.className || ""}>
                                {statusConfig[app.status]?.label || app.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredApplications.length} of {applications.length} applications
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
