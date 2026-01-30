import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Download, Loader2, Mail, Lock, Calendar, MapPin, Tag, AlertCircle, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { extractFilenameFromHeader } from "@/lib/utils/download-filename";

interface ReportInfo {
  title?: string;
  event_date?: string;
  venue?: string;
  banner_image?: string;
  school_logo?: string;
  school_name?: string;
  city?: string;
  campus_name?: string;
  academic_season?: string;
}

interface SecureReportDownloadProps {
  reportType: "virtual" | "in-person";
}

const API_BASE = "https://seedglobaleducation.com/api/assist";

export default function SecureReportDownload({ reportType }: SecureReportDownloadProps) {
  const { hashId } = useParams<{ hashId: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reportInfo, setReportInfo] = useState<ReportInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  const getInfoEndpointUrl = () => {
    return reportType === "in-person"
      ? `${API_BASE}/in-person-event/report_info.php`
      : `${API_BASE}/virtual-event/report_info.php`;
  };

  useEffect(() => {
    const fetchReportInfo = async () => {
      if (!hashId) return;
      
      try {
        const url = `${getInfoEndpointUrl()}?id=${hashId}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          setReportInfo(data);
        }
      } catch (error) {
        console.error("Error fetching report info:", error);
      } finally {
        setLoadingInfo(false);
      }
    };

    fetchReportInfo();
  }, [hashId, reportType]);

  const getEndpointUrl = () => {
    return reportType === "in-person"
      ? `${API_BASE}/in-person-event/report_download.php`
      : `${API_BASE}/virtual-event/report_download.php`;
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsDownloading(true);
    setErrorMessage("");

    try {
      const response = await fetch(getEndpointUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hash_id: hashId,
          email: email.trim(),
          password: password.trim(),
          report_type: reportType,
        }),
      });

      const contentType = response.headers.get("Content-Type") || "";
      
      if (contentType.includes("application/vnd.openxmlformats") || 
          contentType.includes("application/octet-stream") ||
          contentType.includes("application/vnd.ms-excel")) {
        const blob = await response.blob();
        const filename = extractFilenameFromHeader(response, "report.xlsx");
        
        toast.success("Download starting...");
        setShowModal(false);
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        setErrorMessage(data.message || "Verification failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Download error:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loadingInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  const displayLocation = reportInfo?.campus_name || reportInfo?.city || reportInfo?.venue;
  const eventTitle = reportInfo?.title 
    ? `${reportInfo.title}${displayLocation ? ` - ${displayLocation}` : ''}`
    : 'Event Report';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Hero Header with School Logo */}
      <header className="relative overflow-hidden">
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-900" />
        
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* School Logo */}
        <div className="relative z-10 flex justify-center py-12 px-4">
          {reportInfo?.school_logo ? (
            <img 
              src={reportInfo.school_logo} 
              alt={reportInfo.school_name || "School Logo"} 
              className="h-20 md:h-28 w-auto object-contain drop-shadow-2xl"
            />
          ) : (
            <div className="h-20 w-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <FileSpreadsheet className="h-10 w-10 text-white" />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center px-4 -mt-6 pb-12">
        <Card className="w-full max-w-lg overflow-hidden shadow-2xl border-0 bg-card">
          {/* Event Banner Image */}
          {reportInfo?.banner_image && (
            <div className="relative">
              <img 
                src={reportInfo.banner_image} 
                alt={reportInfo?.title || "Event"} 
                className="w-full h-48 md:h-56 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>
          )}

          {/* Event Details */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Title */}
            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-display font-bold text-foreground leading-tight">
                {eventTitle}
              </h1>
            </div>

            {/* Info Cards */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              {reportInfo?.event_date && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Date</p>
                    <p className="text-sm font-semibold text-foreground">{reportInfo.event_date}</p>
                  </div>
                </div>
              )}
              
              {reportInfo?.venue && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Venue</p>
                    <p className="text-sm font-semibold text-foreground">{reportInfo.venue}</p>
                  </div>
                </div>
              )}
              
              {reportInfo?.academic_season && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Tag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Season</p>
                    <p className="text-sm font-semibold text-foreground">{reportInfo.academic_season}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Download Button */}
            <Button 
              onClick={() => setShowModal(true)}
              className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
              size="lg"
              variant="default"
            >
              <Download className="h-5 w-5 mr-3" />
              Download Report
            </Button>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">
          © 2025 SEED Global Education
        </p>
      </footer>

      {/* Login Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold text-center">
              Verify Your Identity
            </DialogTitle>
            <DialogDescription className="text-center">
              Enter your credentials to download the report
            </DialogDescription>
          </DialogHeader>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleDownload} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isDownloading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isDownloading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Verify & Download
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Your credentials are encrypted and secure.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
