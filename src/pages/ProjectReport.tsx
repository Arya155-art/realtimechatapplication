import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Shield, 
  Users, 
  Upload, 
  Zap, 
  Lock, 
  Database, 
  Globe,
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import authScreenshot from "@/assets/screenshots/auth-page.png";

const ProjectReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      
      const options = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: "ChatRoom-Project-Report.pdf",
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: "#0f172a"
        },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] as const }
      };

      await html2pdf().set(options).from(reportRef.current).save();
      
      toast({
        title: "PDF Exported",
        description: "Your project report has been downloaded successfully."
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  const features = [
    {
      icon: MessageSquare,
      title: "Real-time Messaging",
      description: "Instant message delivery with real-time updates using WebSocket connections"
    },
    {
      icon: Users,
      title: "User Presence",
      description: "Live online/offline status indicators showing who's active in the chat"
    },
    {
      icon: Upload,
      title: "File Sharing",
      description: "Share images and files securely with automatic thumbnail generation"
    },
    {
      icon: Lock,
      title: "Secure Authentication",
      description: "Email-based authentication with secure session management"
    },
    {
      icon: Shield,
      title: "Row Level Security",
      description: "Database-level security ensuring users can only access their own data"
    },
    {
      icon: Zap,
      title: "Fast & Responsive",
      description: "Optimized performance with smooth animations using Framer Motion"
    }
  ];

  const techStack = [
    { name: "React 18", category: "Frontend" },
    { name: "TypeScript", category: "Language" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "Framer Motion", category: "Animations" },
    { name: "Lovable Cloud", category: "Backend" },
    { name: "Real-time Subscriptions", category: "Database" },
    { name: "Signed URLs", category: "File Storage" },
    { name: "Row Level Security", category: "Security" }
  ];

  const securityFeatures = [
    "Row Level Security (RLS) on all tables",
    "Authenticated-only message access",
    "Private file storage with signed URLs",
    "Rate limiting on message sending",
    "SECURITY DEFINER functions with proper mitigations",
    "Input sanitization and validation"
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 print:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ChatRoom</h1>
              <p className="text-xs text-muted-foreground">Project Report</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleExportPDF} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/auth")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Button>
          </div>
        </div>
      </header>

      <main ref={reportRef} className="container mx-auto px-4 py-8 space-y-12">
        {/* Project Overview */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Project Overview</h2>
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed text-muted-foreground">
                <strong className="text-foreground">ChatRoom</strong> is a modern, real-time chat application 
                built with React and powered by Lovable Cloud. It features secure authentication, 
                instant messaging, user presence indicators, and file sharing capabilities. 
                The application prioritizes security with comprehensive Row Level Security policies 
                and uses signed URLs for private file access.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Screenshots */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Application Screenshots</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Authentication Page</CardTitle>
                <CardDescription>Secure login and registration interface</CardDescription>
              </CardHeader>
              <CardContent>
                <img 
                  src={authScreenshot} 
                  alt="ChatRoom Authentication Page" 
                  className="rounded-lg border border-border shadow-lg w-full"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chat Interface</CardTitle>
                <CardDescription>Real-time messaging with user presence</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border border-dashed border-border">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chat interface requires authentication</p>
                  <p className="text-xs mt-1">Log in to view the chat room</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Technology Stack */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Technology Stack</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                {techStack.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-2 px-4">
                    <span className="font-medium">{tech.name}</span>
                    <span className="text-muted-foreground ml-2">• {tech.category}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Architecture Diagram */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">System Architecture</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3 text-center p-4 bg-muted/30 rounded-lg">
                  <Globe className="h-10 w-10 mx-auto text-primary" />
                  <h3 className="font-semibold">Frontend</h3>
                  <p className="text-sm text-muted-foreground">
                    React + TypeScript with Tailwind CSS and Framer Motion for smooth UI/UX
                  </p>
                </div>
                <div className="space-y-3 text-center p-4 bg-muted/30 rounded-lg">
                  <Database className="h-10 w-10 mx-auto text-primary" />
                  <h3 className="font-semibold">Backend</h3>
                  <p className="text-sm text-muted-foreground">
                    Lovable Cloud with real-time subscriptions and PostgreSQL database
                  </p>
                </div>
                <div className="space-y-3 text-center p-4 bg-muted/30 rounded-lg">
                  <Shield className="h-10 w-10 mx-auto text-primary" />
                  <h3 className="font-semibold">Security</h3>
                  <p className="text-sm text-muted-foreground">
                    RLS policies, authenticated routes, and secure file storage
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Security Features */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Security Implementation</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Security Measures
              </CardTitle>
              <CardDescription>
                Comprehensive security features protecting user data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid md:grid-cols-2 gap-3">
                {securityFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Database Schema */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Database Schema</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Messages</CardTitle>
                <CardDescription>Chat messages table</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm font-mono">
                  <li className="text-primary">id <span className="text-muted-foreground">UUID PK</span></li>
                  <li>user_id <span className="text-muted-foreground">UUID</span></li>
                  <li>content <span className="text-muted-foreground">TEXT</span></li>
                  <li>file_url <span className="text-muted-foreground">TEXT</span></li>
                  <li>file_name <span className="text-muted-foreground">TEXT</span></li>
                  <li>file_type <span className="text-muted-foreground">TEXT</span></li>
                  <li>created_at <span className="text-muted-foreground">TIMESTAMP</span></li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profiles</CardTitle>
                <CardDescription>User profiles table</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm font-mono">
                  <li className="text-primary">id <span className="text-muted-foreground">UUID PK</span></li>
                  <li>user_id <span className="text-muted-foreground">UUID UNIQUE</span></li>
                  <li>username <span className="text-muted-foreground">TEXT</span></li>
                  <li>avatar_url <span className="text-muted-foreground">TEXT</span></li>
                  <li>status <span className="text-muted-foreground">TEXT</span></li>
                  <li>last_seen <span className="text-muted-foreground">TIMESTAMP</span></li>
                  <li>created_at <span className="text-muted-foreground">TIMESTAMP</span></li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rate Limits</CardTitle>
                <CardDescription>Rate limiting table</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm font-mono">
                  <li className="text-primary">user_id <span className="text-muted-foreground">UUID PK</span></li>
                  <li className="text-primary">action <span className="text-muted-foreground">TEXT PK</span></li>
                  <li>count <span className="text-muted-foreground">INTEGER</span></li>
                  <li>window_start <span className="text-muted-foreground">TIMESTAMP</span></li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <section className="border-t border-border pt-8">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              Built with ❤️ using <strong>Lovable</strong>
            </p>
            <p className="text-xs mt-2">
              © {new Date().getFullYear()} ChatRoom - Real-time Chat Application
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectReport;
