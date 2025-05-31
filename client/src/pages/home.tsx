import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  Shield, 
  AlertTriangle, 
  FileCode, 
  CheckCircle, 
  Download,
  Settings,
  Bug,
  Plus,
  Search,
  Folder,
  FolderOpen
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { CodeEditor } from "@/components/ide/code-editor";
import { FileTree } from "@/components/ide/file-tree";
import { VulnerabilityPanel } from "@/components/ide/vulnerability-panel";
import { VulnerabilityChart } from "@/components/charts/vulnerability-chart";
import { SecurityScoreChart } from "@/components/charts/security-score-chart";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { FloatingWindow } from "@/components/floating-window";
import { BugReportModal } from "@/components/bug-report-modal";
import { SettingsModal } from "@/components/settings-modal";
import { DocumentationModal } from "@/components/documentation-modal";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export default function Home() {
  const [showBugReport, setShowBugReport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showFloatingWindow, setShowFloatingWindow] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [currentScanId, setCurrentScanId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch chart data
  const { data: chartData, isLoading: chartsLoading } = useQuery({
    queryKey: ["/api/dashboard/charts"],
  });

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Fetch recent scans
  const { data: recentScans = [], isLoading: scansLoading } = useQuery({
    queryKey: ["/api/scans"],
  });

  // File scan mutation
  const fileScanMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await apiRequest("POST", `/api/scan/file/${fileId}`);
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentScanId(data.id);
      toast({
        title: "Scan Started",
        description: "File vulnerability scan is in progress...",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Project scan mutation
  const projectScanMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiRequest("POST", `/api/scan/project/${projectId}`);
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentScanId(data.id);
      toast({
        title: "Project Scan Started",
        description: "Full project vulnerability scan is in progress...",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
    },
    onError: (error) => {
      toast({
        title: "Project Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Quick scan mutation
  const quickScanMutation = useMutation({
    mutationFn: async ({ code, language }: { code: string; language: string }) => {
      const response = await apiRequest("POST", "/api/scan/quick", { code, language });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quick Scan Complete",
        description: `Found ${data.vulnerabilities.length} potential issues. Security Score: ${data.securityScore}/10`,
      });
    },
    onError: (error) => {
      toast({
        title: "Quick Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Export PDF mutation
  const exportPdfMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/export/security-report");
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'security-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "PDF Export Complete",
        description: "Security report has been downloaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileScan = (fileId: number) => {
    setSelectedFileId(fileId);
    fileScanMutation.mutate(fileId);
  };

  const handleProjectScan = (projectId: number) => {
    projectScanMutation.mutate(projectId);
  };

  const handleQuickScan = (code: string, language: string) => {
    quickScanMutation.mutate({ code, language });
  };

  const handleExportPdf = () => {
    exportPdfMutation.mutate();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onDocumentation={() => setShowDocumentation(true)}
        onBugReport={() => setShowBugReport(true)}
        onSettings={() => setShowSettings(true)}
        showUserMenu={true}
      />

      <div className="pt-16">
        <Tabs defaultValue="overview" className="h-[calc(100vh-4rem)]">
          <div className="border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <TabsList className="grid w-full max-w-2xl grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ide">IDE</TabsTrigger>
                <TabsTrigger value="scans">Scans</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="h-full overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <div>
                  <h1 className="text-3xl font-bold">Security Dashboard</h1>
                  <p className="text-muted-foreground">Monitor your code security in real-time</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={handleExportPdf}
                    disabled={exportPdfMutation.isPending}
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {exportPdfMutation.isPending ? "Generating..." : "Export PDF"}
                  </Button>
                  <Button onClick={() => setShowSettings(true)} variant="outline" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Security Score</p>
                        <p className="text-2xl font-bold">{dashboardStats?.securityScore || 0}/10</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={(dashboardStats?.securityScore || 0) * 10} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Vulnerabilities</p>
                        <p className="text-2xl font-bold">{dashboardStats?.totalVulnerabilities || 0}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {dashboardStats?.criticalVulnerabilities || 0} Critical
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <FileCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Files Scanned</p>
                        <p className="text-2xl font-bold">{dashboardStats?.filesScanned || 0}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Last scan: {dashboardStats?.lastScanTime || 'Never'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Issues Fixed</p>
                        <p className="text-2xl font-bold">{dashboardStats?.fixedVulnerabilities || 0}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {dashboardStats?.fixRate || 0}% Fix Rate
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Charts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Vulnerability Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VulnerabilityChart data={chartData?.vulnerabilityTrends} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Score History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SecurityScoreChart data={chartData?.securityScoreHistory} />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Scans */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Vulnerability Scans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentScans.map((scan: any, index: number) => (
                        <motion.div
                          key={scan.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-muted rounded-lg">
                              {scan.scanType === 'project' ? (
                                <FolderOpen className="w-5 h-5" />
                              ) : (
                                <FileCode className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{scan.scanType.toUpperCase()} Scan</p>
                              <p className="text-sm text-muted-foreground">
                                {scan.vulnerabilitiesFound} vulnerabilities found
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusColor(scan.status)}>
                              {scan.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              Score: {scan.securityScore || 'N/A'}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      
                      {recentScans.length === 0 && !scansLoading && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No scans yet. Start by scanning a file or project.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="ide" className="h-full">
            <div className="flex h-full">
              <FileTree 
                onFileSelect={setSelectedFileId}
                onFileScan={handleFileScan}
                onProjectScan={handleProjectScan}
                isScanning={fileScanMutation.isPending || projectScanMutation.isPending}
              />
              <div className="flex-1 flex">
                <CodeEditor 
                  selectedFileId={selectedFileId}
                  onQuickScan={handleQuickScan}
                  isScanning={quickScanMutation.isPending}
                />
                <VulnerabilityPanel 
                  scanId={currentScanId}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scans" className="h-full overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Vulnerability Scans</h2>
              
              <div className="grid gap-6">
                {recentScans.map((scan: any) => (
                  <Card key={scan.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Badge variant={getStatusColor(scan.status)}>
                            {scan.status}
                          </Badge>
                          <span className="font-medium">{scan.scanType.toUpperCase()} Scan</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Security Score</p>
                          <p className="text-lg font-semibold">{scan.securityScore || 'N/A'}/10</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Vulnerabilities</p>
                          <p className="text-lg font-semibold">{scan.vulnerabilitiesFound}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="text-lg font-semibold">
                            {scan.completedAt 
                              ? `${Math.round((new Date(scan.completedAt).getTime() - new Date(scan.createdAt).getTime()) / 1000)}s`
                              : 'In progress'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="h-full overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Security Reports</h2>
                <Button onClick={handleExportPdf} disabled={exportPdfMutation.isPending}>
                  <Download className="w-4 h-4 mr-2" />
                  {exportPdfMutation.isPending ? "Generating..." : "Export Report"}
                </Button>
              </div>
              
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Summary Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Comprehensive overview of your security posture including vulnerability trends, 
                      security scores, and recommendations for improvement.
                    </p>
                    <ProgressStepper 
                      steps={[
                        { title: "Scan Analysis", status: "completed" },
                        { title: "Vulnerability Assessment", status: "completed" },
                        { title: "Risk Evaluation", status: "completed" },
                        { title: "Report Generation", status: "current" }
                      ]}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="h-full overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Projects</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: any) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Folder className="w-5 h-5" />
                        <span>{project.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleProjectScan(project.id)}
                          disabled={projectScanMutation.isPending}
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Scan Project
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {projects.length === 0 && !projectsLoading && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No projects yet. Create your first project to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={() => setShowFloatingWindow(true)}
        icon={Plus}
      />

      {/* Floating Window */}
      <FloatingWindow 
        open={showFloatingWindow}
        onOpenChange={setShowFloatingWindow}
        onQuickScan={handleQuickScan}
        isScanning={quickScanMutation.isPending}
      />

      {/* Modals */}
      <BugReportModal 
        open={showBugReport} 
        onOpenChange={setShowBugReport} 
      />
      
      <SettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
      />
      
      <DocumentationModal
        open={showDocumentation}
        onOpenChange={setShowDocumentation}
      />
    </div>
  );
}
