import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Building2, Users, UserCheck, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const mockCampusTourReports = [
  { id: "1", eventName: "IIT Delhi Tour", campus: "IIT Delhi", date: "2024-02-20", campusesReached: 1, attendees: 450, studentsConnected: 280 },
  { id: "2", eventName: "BITS Pilani Tour", campus: "BITS Pilani", date: "2024-03-05", campusesReached: 1, attendees: 380, studentsConnected: 245 },
  { id: "3", eventName: "IIM Bangalore Tour", campus: "IIM Bangalore", date: "2024-03-18", campusesReached: 1, attendees: 520, studentsConnected: 356 },
  { id: "4", eventName: "NUS Singapore Tour", campus: "NUS", date: "2024-04-10", campusesReached: 1, attendees: 290, studentsConnected: 198 },
  { id: "5", eventName: "University of Lagos Tour", campus: "UNILAG", date: "2024-05-02", campusesReached: 1, attendees: 680, studentsConnected: 445 },
  { id: "6", eventName: "Ashesi University Tour", campus: "Ashesi", date: "2024-05-15", campusesReached: 1, attendees: 340, studentsConnected: 212 },
  { id: "7", eventName: "Strathmore Tour", campus: "Strathmore", date: "2024-06-01", campusesReached: 1, attendees: 410, studentsConnected: 278 },
  { id: "8", eventName: "Makerere University Tour", campus: "Makerere", date: "2024-06-20", campusesReached: 1, attendees: 350, studentsConnected: 198 },
];

const CampusTourReports = () => {
  const handleDownload = (reportId: string, eventName: string) => {
    const report = mockCampusTourReports.find(r => r.id === reportId);
    if (!report) return;
    
    const csvContent = `Event Name,Campus,Date,Campuses Reached,Attendees,Students Connected\n${report.eventName},${report.campus},${report.date},${report.campusesReached},${report.attendees},${report.studentsConnected}`;
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventName.replace(/\s+/g, "_")}_Report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({ title: "Report Downloaded", description: `${eventName} report has been downloaded.` });
  };

  const handleDownloadAll = () => {
    const headers = "Event Name,Campus,Date,Campuses Reached,Attendees,Students Connected\n";
    const rows = mockCampusTourReports.map(r => `${r.eventName},${r.campus},${r.date},${r.campusesReached},${r.attendees},${r.studentsConnected}`).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Campus_Tour_Reports_All.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({ title: "All Reports Downloaded", description: "All Campus Tour reports have been downloaded." });
  };

  const totalEvents = mockCampusTourReports.length;
  const totalCampuses = mockCampusTourReports.reduce((sum, r) => sum + r.campusesReached, 0);
  const totalAttendees = mockCampusTourReports.reduce((sum, r) => sum + r.attendees, 0);
  const totalStudents = mockCampusTourReports.reduce((sum, r) => sum + r.studentsConnected, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Campus Tour Reports</h1>
            <p className="text-muted-foreground mt-1">View and download reports from Campus Tour events</p>
          </div>
          <Button onClick={handleDownloadAll} className="gap-2">
            <Download className="h-4 w-4" /> Download All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalEvents}</p><p className="text-xs text-muted-foreground">Total Events</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10"><Building2 className="h-5 w-5 text-accent-foreground" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalCampuses}</p><p className="text-xs text-muted-foreground">Campuses Reached</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/50"><Users className="h-5 w-5 text-secondary-foreground" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalAttendees.toLocaleString()}</p><p className="text-xs text-muted-foreground">Attendees Reached</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><UserCheck className="h-5 w-5 text-primary" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalStudents.toLocaleString()}</p><p className="text-xs text-muted-foreground">Students Connected</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg font-display">Campus Tour Reports</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Attendees</TableHead>
                  <TableHead className="text-right">Students Connected</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCampusTourReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.eventName}</TableCell>
                    <TableCell>{report.campus}</TableCell>
                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{report.attendees}</TableCell>
                    <TableCell className="text-right">{report.studentsConnected}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(report.id, report.eventName)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CampusTourReports;
