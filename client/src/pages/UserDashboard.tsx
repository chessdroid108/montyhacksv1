import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navigation from "@/components/Navigation";
import IDE from "@/components/IDE";
import VulnerabilityScanner from "@/components/VulnerabilityScanner";
import FloatingActionButton from "@/components/FloatingActionButton";
import MinimizableWindow from "@/components/MinimizableWindow";
import BugReportForm from "@/components/BugReportForm";
import {
  Shield,
  AlertTriangle,
  FileCode,
  CheckCircle,
  TrendingUp,
  Download,
  Bug,
  Zap,
  BarChart3,
  Clock,
  Target,
  Settings,
} from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showFloatingWindow, setShowFloatingWindow] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);

  // Fetch user scans
  const { data: scans = [], isLoading: scansLoading } = useQuery({
    queryKey: ["/api/scans"],
  });

  // Fetch user projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Calculate dashboard metrics
  const totalVulnerabilities = scans.reduce((sum: number, scan: any) => 
    sum + (scan.vulnerabilities?.length || 0), 0
  );

  const criticalIssues = scans.reduce((sum: number, scan: any) => 
    sum + (scan.vulnerabilities?.filter((v: any) => v.severity === 'critical')?.length || 0), 0
  );

  const averageSecurityScore = scans.length > 0 
    ? Math.round(scans.reduce((sum: number, scan: any) => sum + (scan.securityScore || 0), 0) / scans.length)
    : 0;

  const handleExportPDF = () => {
    // Simulate PDF export
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,';
    link.download = 'security-report.pdf';
    // In a real implementation, you would generate an actual PDF
    alert('PDF export functionality would generate a comprehensive security report here.');
  };

  const statsCards = [
    {
      title: "Security Score",
      value: `${averageSecurityScore}/100`,
      change: "+12%",
      trend: "up",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Vulnerabilities",
      value: totalVulnerabilities.toString(),
      change: `${criticalIssues} Critical`,
      trend: "down",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      title: "Files Scanned",
      value: scans.length.toString(),
      change: "+5 this week",
      trend: "up",
      icon: FileCode,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Issues Fixed",
      value: "94%",
      change: "+8 this month",
      trend: "up",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
  ];

  if (scansLoading || projectsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Security Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'Developer'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button onClick={handleExportPDF} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={() => setShowBugReport(true)} variant="outline">
                  <Bug className="h-4 w-4 mr-2" />
                  Report Bug
                </Button>
                <Button asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="ide" className="flex items-center space-x-2">
                <FileCode className="h-4 w-4" />
                <span>IDE</span>
              </TabsTrigger>
              <TabsTrigger value="scanner" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Scanner</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Reports</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                          </div>
                          <Badge variant={stat.trend === "up" ? "default" : "secondary"} className="text-xs">
                            {stat.change}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Recent Scans */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Recent Vulnerability Scans</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {scans.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No scans found</p>
                      <p className="text-sm">Start by scanning your code files for vulnerabilities</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {scans.slice(0, 10).map((scan: any, index: number) => (
                          <motion.div
                            key={scan.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <FileCode className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{scan.fileName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {scan.vulnerabilities?.length || 0} vulnerabilities found
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  Score: {scan.securityScore}/100
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(scan.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* Security Score Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Security Score Trend</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Security Score</span>
                      <span className="text-2xl font-bold">{averageSecurityScore}/100</span>
                    </div>
                    <Progress value={averageSecurityScore} className="h-3" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{scans.length - criticalIssues}</p>
                        <p className="text-xs text-muted-foreground">Secure Files</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{Math.max(0, totalVulnerabilities - criticalIssues)}</p>
                        <p className="text-xs text-muted-foreground">Warnings</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{criticalIssues}</p>
                        <p className="text-xs text-muted-foreground">Critical</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ide">
              <IDE />
            </TabsContent>

            <TabsContent value="scanner">
              <VulnerabilityScanner />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Detailed reporting functionality coming soon</p>
                    <p className="text-sm">Export comprehensive security reports and analytics</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onQuickScan={() => setActiveTab("scanner")}
        onNewProject={() => setActiveTab("ide")}
        onUploadFile={() => setActiveTab("scanner")}
        onOpenWindow={() => setShowFloatingWindow(true)}
      />

      {/* Minimizable Window */}
      <MinimizableWindow
        isOpen={showFloatingWindow}
        onClose={() => setShowFloatingWindow(false)}
        title="Quick Analysis"
      />

      {/* Bug Report Form */}
      <BugReportForm
        isOpen={showBugReport}
        onClose={() => setShowBugReport(false)}
      />
    </div>
  );
}
