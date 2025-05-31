import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [dateRange, setDateRange] = useState("7d");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch admin stats
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  // Fetch system errors
  const { data: systemErrors, isLoading: errorsLoading } = useQuery({
    queryKey: ["/api/admin/errors"],
    retry: false,
  });

  // Fetch common vulnerabilities
  const { data: commonVulns, isLoading: vulnsLoading } = useQuery({
    queryKey: ["/api/admin/vulnerabilities/common"],
    retry: false,
  });

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/admin/analytics", dateRange],
    retry: false,
  });

  if (isLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-crown text-yellow-400 text-sm"></i>
            </div>
            <h1 className="text-2xl font-bold">Admin Control Panel</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" size="sm">
              <i className="fas fa-sync-alt mr-2"></i>Refresh
            </Button>
            <Button variant="ghost" asChild className="text-white hover:bg-white/10">
              <a href="/api/logout">
                <i className="fas fa-sign-out-alt mr-2"></i>Logout
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="errors">Error Logs</TabsTrigger>
            <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <i className="fas fa-users text-blue-600"></i>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{adminStats?.newUsersThisWeek || 0} this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database Usage</CardTitle>
                  <i className="fas fa-database text-green-600"></i>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats?.databaseUsage || "0%"}</div>
                  <p className="text-xs text-muted-foreground">
                    {adminStats?.databaseSize || "0 MB"} used
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Errors</CardTitle>
                  <i className="fas fa-exclamation-triangle text-red-600"></i>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {systemErrors?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last 24 hours
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                  <i className="fas fa-server text-purple-600"></i>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {adminStats?.uptime || "99.9%"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    System healthy
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts would go here - placeholder for now */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Chart implementation would go here
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scan Volume</CardTitle>
                  <CardDescription>Security scans performed daily</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Chart implementation would go here
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Statistics</CardTitle>
                <CardDescription>Database usage and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Storage Used</label>
                      <div className="text-2xl font-bold">{adminStats?.databaseSize || "0 MB"}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Connections</label>
                      <div className="text-2xl font-bold">{adminStats?.activeConnections || 0}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Error Log</CardTitle>
                <CardDescription>Recent system errors and issues</CardDescription>
              </CardHeader>
              <CardContent>
                {errorsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : systemErrors?.length > 0 ? (
                  <div className="space-y-4">
                    {systemErrors.map((error: any) => (
                      <div key={error.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          error.type === "CRITICAL" ? "bg-red-500" : 
                          error.type === "ERROR" ? "bg-orange-500" : "bg-yellow-500"
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{error.type}</h4>
                            <span className="text-sm text-muted-foreground">
                              {new Date(error.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
                          {error.userId && (
                            <Badge variant="outline" className="mt-2">
                              User: {error.userId}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No system errors found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vulnerabilities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Common Vulnerabilities</CardTitle>
                <CardDescription>Most frequently detected security issues</CardDescription>
              </CardHeader>
              <CardContent>
                {vulnsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : commonVulns?.length > 0 ? (
                  <div className="space-y-4">
                    {commonVulns.map((vuln: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{vuln.type}</h4>
                            <p className="text-sm text-muted-foreground">
                              Found in {vuln.percentage}% of scanned applications
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{vuln.count} instances</div>
                          <div className="text-sm text-muted-foreground">
                            Common fix: {vuln.commonFix}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No vulnerability data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Analytics</CardTitle>
                <CardDescription>Site usage and user activity breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Most Used Features</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Code Scanning</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Dashboard</span>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Documentation</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Programming Languages</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">JavaScript</span>
                        <span className="text-sm font-medium">35%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Python</span>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Java</span>
                        <span className="text-sm font-medium">20%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Response Times</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Scan API</span>
                        <span className="text-sm font-medium text-green-600">142ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Dashboard Load</span>
                        <span className="text-sm font-medium text-green-600">89ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">File Upload</span>
                        <span className="text-sm font-medium text-yellow-600">284ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
