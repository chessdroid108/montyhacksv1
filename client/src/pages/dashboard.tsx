import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  AlertTriangle, 
  FileCode, 
  TrendingUp, 
  Download,
  Settings,
  Bug,
  Code,
  Search,
  Play,
  Folder,
  Plus,
  X,
  Minus,
  BarChart3
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { VulnerabilityChart } from "@/components/charts/VulnerabilityChart";
import { SecurityScoreChart } from "@/components/charts/SecurityScoreChart";
import { FileTree } from "@/components/ide/FileTree";
import { CodeEditor } from "@/components/ide/CodeEditor";
import { VulnerabilityPanel } from "@/components/ide/VulnerabilityPanel";
import { BugReportModal } from "@/components/modals/BugReportModal";
import { FloatingWindow } from "@/components/modals/FloatingWindow";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { apiRequest } from "@/lib/queryClient";

interface DashboardStats {
  securityScore: number;
  vulnerabilities: number;
  criticalVulnerabilities: number;
  filesScanned: number;
  fixRate: number;
  recentScans: any[];
}

interface ScanResult {
  scanId: number;
  vulnerabilities: any[];
  securityScore: {
    score: number;
    breakdown: {
      codeQuality: number;
      securityVulnerabilities: number;
      complexityRisk: number;
      bestPractices: number;
    };
  };
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showBugReport, setShowBugReport] = useState(false);
  const [showFloatingWindow, setShowFloatingWindow] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [codeContent, setCodeContent] = useState("");
  const [scanResults, setScanResults] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  // Fetch projects
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Scan mutation
  const scanMutation = useMutation({
    mutationFn: async (data: { code: string; filename: string; scanType: string }) => {
      const response = await apiRequest("POST", "/api/scan", data);
      return response.json();
    },
    onSuccess: (data) => {
      setScanResults(data);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Scan completed",
        description: `Found ${data.vulnerabilities.length} vulnerabilities`,
      });
    },
    onError: (error) => {
      toast({
        title: "Scan failed",
        description: "Failed to scan code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Quick scan mutation
  const quickScanMutation = useMutation({
    mutationFn: async (data: { code: string; filename: string }) => {
      const response = await apiRequest("POST", "/api/scan/quick", data);
      return response.json();
    },
    onSuccess: (data) => {
      setScanResults(data);
      toast({
        title: "Quick scan completed",
        description: `Found ${data.vulnerabilities.length} potential issues`,
      });
    },
  });

  // Export PDF mutation
  const exportPdfMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/export/pdf");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "PDF Export",
        description: "Your security report is being generated...",
      });
    },
  });

  const handleScan = (scanType: 'FILE' | 'FOLDER' | 'PROJECT') => {
    if (!codeContent || !selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file and add some code to scan.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    scanMutation.mutate({
      code: codeContent,
      filename: selectedFile,
      scanType,
    });
  };

  const handleQuickScan = () => {
    if (!codeContent || !selectedFile) {
      toast({
        title: "No code to scan",
        description: "Please add some code in the editor.",
        variant: "destructive",
      });
      return;
    }

    quickScanMutation.mutate({
      code: codeContent,
      filename: selectedFile,
    });
  };

  useEffect(() => {
    if (scanMutation.data || quickScanMutation.data) {
      setIsScanning(false);
    }
  }, [scanMutation.data, quickScanMutation.data]);

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold">Security Dashboard</h1>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBugReport(true)}
            >
              <Bug className="h-4 w-4 mr-2" />
              Report Bug
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportPdfMutation.mutate()}
              disabled={exportPdfMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/settings'}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-muted/30">
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
              <TabsList className="grid w-full grid-rows-4">
                <TabsTrigger value="overview" className="justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="ide" className="justify-start">
                  <Code className="h-4 w-4 mr-2" />
                  IDE
                </TabsTrigger>
                <TabsTrigger value="scans" className="justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  Scans
                </TabsTrigger>
                <TabsTrigger value="reports" className="justify-start">
                  <FileCode className="h-4 w-4 mr-2" />
                  Reports
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Overview Tab */}
            <TabsContent value="overview" className="h-full p-6 overflow-auto">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.securityScore || 0}/10
                    </div>
                    <Progress value={(stats?.securityScore || 0) * 10} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {stats?.vulnerabilities || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.criticalVulnerabilities || 0} critical
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Files Scanned</CardTitle>
                    <FileCode className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats?.filesScanned || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last scan: 2 hours ago
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fix Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.fixRate || 0}%
                    </div>
                    <Progress value={stats?.fixRate || 0} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Vulnerability Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VulnerabilityChart />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Score History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SecurityScoreChart />
                  </CardContent>
                </Card>
              </div>

              {/* Recent Scans */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Vulnerability Scans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recentScans?.slice(0, 5).map((scan, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="font-medium">Scan #{scan.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {scan.vulnerabilitiesFound} vulnerabilities found
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={scan.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {scan.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Score: {scan.securityScore}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* IDE Tab */}
            <TabsContent value="ide" className="h-full">
              <div className="flex h-full">
                {/* File Explorer */}
                <div className="w-64 border-r border-border">
                  <FileTree 
                    onFileSelect={setSelectedFile}
                    selectedFile={selectedFile}
                  />
                </div>

                {/* Code Editor */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {selectedFile || "No file selected"}
                      </span>
                      {scanResults && (
                        <Badge variant="outline">
                          Score: {scanResults.securityScore.score}/100
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleQuickScan}
                        disabled={quickScanMutation.isPending}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Quick Scan
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleScan('FILE')}
                        disabled={scanMutation.isPending}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {isScanning ? 'Scanning...' : 'Scan File'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex">
                    <div className="flex-1">
                      <CodeEditor 
                        value={codeContent}
                        onChange={setCodeContent}
                        language="javascript"
                        vulnerabilities={scanResults?.vulnerabilities || []}
                      />
                    </div>
                    
                    <div className="w-80 border-l border-border">
                      <VulnerabilityPanel 
                        vulnerabilities={scanResults?.vulnerabilities || []}
                        securityScore={scanResults?.securityScore}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Scans Tab */}
            <TabsContent value="scans" className="h-full p-6 overflow-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Vulnerability Scans</h2>
                  <div className="flex space-x-2">
                    <Button onClick={() => handleScan('FOLDER')}>
                      <Folder className="h-4 w-4 mr-2" />
                      Scan Folder
                    </Button>
                    <Button onClick={() => handleScan('PROJECT')}>
                      <Code className="h-4 w-4 mr-2" />
                      Scan Project
                    </Button>
                  </div>
                </div>

                {/* Scan Results */}
                {scanResults && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Latest Scan Results</CardTitle>
                      <CardDescription>
                        Found {scanResults.vulnerabilities.length} vulnerabilities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {scanResults.vulnerabilities.map((vuln, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <Badge variant={
                                vuln.severity === 'CRITICAL' ? 'destructive' :
                                vuln.severity === 'HIGH' ? 'destructive' :
                                vuln.severity === 'MEDIUM' ? 'default' : 'secondary'
                              }>
                                {vuln.severity}
                              </Badge>
                              <div>
                                <p className="font-medium">{vuln.type.replace(/_/g, ' ')}</p>
                                <p className="text-sm text-muted-foreground">{vuln.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">Line {vuln.lineNumber}</p>
                              <p className="text-xs text-muted-foreground">{vuln.confidence}% confidence</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="h-full p-6 overflow-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Security Reports</h2>
                  <Button onClick={() => exportPdfMutation.mutate()}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Export Options</CardTitle>
                    <CardDescription>Generate comprehensive security reports</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Vulnerability Summary (PDF)
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Detailed Analysis (PDF)
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Raw Data (JSON)
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowFloatingWindow(true)} />

      {/* Modals */}
      <BugReportModal 
        isOpen={showBugReport} 
        onClose={() => setShowBugReport(false)} 
      />
      
      <FloatingWindow
        isOpen={showFloatingWindow}
        onClose={() => setShowFloatingWindow(false)}
        onQuickScan={handleQuickScan}
      />
    </div>
  );
}
