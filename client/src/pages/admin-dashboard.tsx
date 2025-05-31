import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  Crown, 
  Database, 
  Users, 
  AlertTriangle, 
  Activity, 
  Code, 
  TrendingUp,
  Server,
  Shield,
  Bug,
  RefreshCw,
  Filter
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { AdminCharts } from "@/components/charts/admin-charts";
import { BugReportModal } from "@/components/bug-report-modal";
import { DocumentationModal } from "@/components/documentation-modal";

export default function AdminDashboard() {
  const [showBugReport, setShowBugReport] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");
  const [languageFilter, setLanguageFilter] = useState("all");

  // Fetch admin analytics
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ["/api/admin/analytics", timeRange, languageFilter],
    queryFn: () => fetch(`/api/admin/analytics?timeRange=${timeRange}&filter=${languageFilter}`).then(r => r.json()),
  });

  // Fetch system errors
  const { data: systemErrors = [], isLoading: errorsLoading } = useQuery({
    queryKey: ["/api/admin/system-errors"],
  });

  // Fetch common vulnerabilities
  const { data: commonVulns = [], isLoading: vulnsLoading } = useQuery({
    queryKey: ["/api/admin/common-vulnerabilities"],
  });

  // Fetch traffic analytics
  const { data: trafficData, isLoading: trafficLoading } = useQuery({
    queryKey: ["/api/admin/traffic-analytics"],
  });

  const handleRefresh = () => {
    refetchAnalytics();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onDocumentation={() => setShowDocumentation(true)}
        onBugReport={() => setShowBugReport(true)}
        showUserMenu={true}
        isAdmin={true}
      />

      <div className="pt-16">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Crown className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Admin Control Panel</h1>
                  <p className="text-white/80">System analytics and administration</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 3 months</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleRefresh}
                  variant="secondary"
                  size="sm"
                  disabled={analyticsLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full max-w-3xl grid-cols-6">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
              <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
              <TabsTrigger value="traffic">Traffic</TabsTrigger>
              <TabsTrigger value="languages">Languages</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              {/* Key Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                        <p className="text-2xl font-bold">{formatNumber(analytics?.activeUsers || 0)}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                      <span className="text-green-600">+12.5%</span>
                      <span className="text-muted-foreground ml-1">vs last period</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Scans Performed</p>
                        <p className="text-2xl font-bold">{formatNumber(analytics?.totalScans || 0)}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                      <span className="text-green-600">+8.3%</span>
                      <span className="text-muted-foreground ml-1">vs last period</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                        <Bug className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Vulnerabilities Found</p>
                        <p className="text-2xl font-bold">{formatNumber(analytics?.vulnerabilitiesFound || 0)}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-red-600">-5.2%</span>
                      <span className="text-muted-foreground ml-1">vs last period</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Data Processed</p>
                        <p className="text-2xl font-bold">{analytics?.dataProcessed || '0'}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                      <span className="text-green-600">+15.7%</span>
                      <span className="text-muted-foreground ml-1">vs last period</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Charts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AdminCharts 
                  analytics={analytics}
                  trafficData={trafficData}
                  timeRange={timeRange}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="database" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5" />
                    <span>Database Usage</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {analytics?.databaseUsage?.size || '0 GB'}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Size</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {analytics?.databaseUsage?.connections || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Connections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                        {analytics?.databaseUsage?.queries || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Queries/minute</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="errors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>System Error Log</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemErrors.map((error: any, index: number) => (
                      <motion.div
                        key={error.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-4 p-4 border rounded-lg"
                      >
                        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{error.errorType}</h4>
                            <Badge variant={getSeverityColor(error.severity)}>
                              {error.severity || 'Error'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {error.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(error.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    
                    {systemErrors.length === 0 && !errorsLoading && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No system errors recorded.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vulnerabilities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bug className="w-5 h-5" />
                    <span>Most Common Vulnerabilities</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {commonVulns.map((vuln: any, index: number) => (
                      <motion.div
                        key={vuln.type}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{vuln.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Found in {vuln.percentage}% of scanned applications
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatNumber(vuln.count)}</p>
                          <p className="text-sm text-muted-foreground">instances</p>
                        </div>
                      </motion.div>
                    ))}
                    
                    {commonVulns.length === 0 && !vulnsLoading && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No vulnerability data available.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="traffic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Traffic Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Most Used Features</h4>
                      <div className="space-y-3">
                        {trafficData?.features?.map((feature: any, index: number) => (
                          <div key={feature.name} className="flex items-center justify-between">
                            <span className="text-sm">{feature.name}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${feature.percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-10">
                                {feature.percentage}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Response Times</h4>
                      <div className="space-y-3">
                        {trafficData?.responseTimes?.map((api: any) => (
                          <div key={api.endpoint} className="flex items-center justify-between">
                            <span className="text-sm">{api.endpoint}</span>
                            <span className="text-sm font-semibold text-green-600">
                              {api.avgTime}ms
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Peak Hours</h4>
                      <div className="space-y-3">
                        {trafficData?.peakHours?.map((hour: any) => (
                          <div key={hour.time} className="flex items-center justify-between">
                            <span className="text-sm">{hour.time}</span>
                            <span className="text-sm font-semibold">
                              {formatNumber(hour.requests)} requests
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="languages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="w-5 h-5" />
                    <span>Programming Language Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-4">Most Popular Languages</h4>
                      <div className="space-y-4">
                        {analytics?.languageStats?.map((lang: any, index: number) => (
                          <div key={lang.name} className="flex items-center space-x-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{lang.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {lang.percentage}%
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                                  style={{ width: `${lang.percentage}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-semibold">
                              {formatNumber(lang.count)} projects
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-4">Vulnerability Distribution by Language</h4>
                      <div className="space-y-3">
                        {analytics?.vulnerabilityByLanguage?.map((lang: any) => (
                          <div key={lang.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="font-medium">{lang.name}</span>
                            <div className="text-right">
                              <p className="font-semibold">{formatNumber(lang.vulnCount)}</p>
                              <p className="text-xs text-muted-foreground">vulnerabilities</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <BugReportModal 
        open={showBugReport} 
        onOpenChange={setShowBugReport} 
      />
      
      <DocumentationModal
        open={showDocumentation}
        onOpenChange={setShowDocumentation}
      />
    </div>
  );
}
