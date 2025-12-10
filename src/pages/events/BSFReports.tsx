import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, MapPin, Users, Calendar, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const mockBSFReports = [
  { id: "1", eventName: "BSF Lagos 2024", city: "Lagos", date: "2024-03-15", registrants: 245, attendees: 198, connections: 156 },
  { id: "2", eventName: "BSF Nairobi 2024", city: "Nairobi", date: "2024-04-20", registrants: 312, attendees: 267, connections: 201 },
  { id: "3", eventName: "BSF Accra 2024", city: "Accra", date: "2024-05-10", registrants: 189, attendees: 145, connections: 112 },
  { id: "4", eventName: "BSF Mumbai 2024", city: "Mumbai", date: "2024-06-08", registrants: 278, attendees: 234, connections: 189 },
  { id: "5", eventName: "BSF Dubai 2024", city: "Dubai", date: "2024-07-12", registrants: 221, attendees: 198, connections: 134 },
];

const BSFReports = () => {
  const handleDownload = (reportId: string, eventName: string) => {
    // Create CSV content
    const report = mockBSFReports.find(r => r.id === reportId);
    if (!report) return;
    
    const csvContent = `Event Name,City,Date,Registrants,Attendees,Connections\n${report.eventName},${report.city},${report.date},${report.registrants},${report.attendees},${report.connections}`;
    
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
    const headers = "Event Name,City,Date,Registrants,Attendees,Connections\n";
    const rows = mockBSFReports.map(r => `${r.eventName},${r.city},${r.date},${r.registrants},${r.attendees},${r.connections}`).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "BSF_Reports_All.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({ title: "All Reports Downloaded", description: "All BSF reports have been downloaded." });
  };

  const totalEvents = mockBSFReports.length;
  const uniqueCities = new Set(mockBSFReports.map(r => r.city)).size;
  const totalRegistrants = mockBSFReports.reduce((sum, r) => sum + r.registrants, 0);
  const totalConnections = mockBSFReports.reduce((sum, r) => sum + r.connections, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Business School Festival Reports</h1>
            <p className="text-muted-foreground mt-1">View and download reports from BSF events</p>
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
                <div className="p-2 rounded-lg bg-accent/10"><MapPin className="h-5 w-5 text-accent-foreground" /></div>
                <div><p className="text-2xl font-bold text-foreground">{uniqueCities}</p><p className="text-xs text-muted-foreground">Unique Cities</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/50"><Users className="h-5 w-5 text-secondary-foreground" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalRegistrants.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Registrants</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Calendar className="h-5 w-5 text-primary" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalConnections.toLocaleString()}</p><p className="text-xs text-muted-foreground">Connections</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg font-display">BSF Event Reports</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Registrants</TableHead>
                  <TableHead className="text-right">Attendees</TableHead>
                  <TableHead className="text-right">Connections</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBSFReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.eventName}</TableCell>
                    <TableCell>{report.city}</TableCell>
                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{report.registrants}</TableCell>
                    <TableCell className="text-right">{report.attendees}</TableCell>
                    <TableCell className="text-right">{report.connections}</TableCell>
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

export default BSFReports;
