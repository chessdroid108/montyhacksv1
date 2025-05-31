import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Clock,
  BarChart3
} from "lucide-react";

interface SecurityOverviewProps {
  stats?: {
    totalProjects: number;
    totalScans: number;
    totalVulnerabilities: number;
    averageSecurityScore: number;
    recentScans: any[];
    projects: any[];
  } | null;
}

export function SecurityOverview({ stats }: SecurityOverviewProps) {
  const securityScore = stats?.averageSecurityScore || 0;
  const totalVulnerabilities = stats?.totalVulnerabilities || 0;
  const totalProjects = stats?.totalProjects || 0;
  const totalScans = stats?.totalScans || 0;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    if (score >= 50) return "outline";
    return "destructive";
  };

  const metrics = [
    {
      title: "Security Score",
      value: securityScore,
      unit: "/100",
      description: "Overall security rating",
      icon: Shield,
      color: getScoreColor(securityScore),
      trend: securityScore > 75 ? "up" : securityScore < 50 ? "down" : "stable",
      trendValue: "+2.3%"
    },
    {
      title: "Active Vulnerabilities",
      value: totalVulnerabilities,
      unit: "",
      description: "Issues requiring attention",
      icon: AlertTriangle,
      color: totalVulnerabilities > 10 ? "text-red-600" : totalVulnerabilities > 5 ? "text-yellow-600" : "text-green-600",
      trend: totalVulnerabilities > 10 ? "up" : "down",
      trendValue: totalVulnerabilities > 0 ? `${totalVulnerabilities} found` : "No issues"
    },
    {
      title: "Projects Secured",
      value: totalProjects,
      unit: "",
      description: "Total projects analyzed",
      icon: CheckCircle,
      color: "text-blue-600",
      trend: "up",
      trendValue: "+3 this week"
    },
    {
      title: "Scans Completed",
      value: totalScans,
      unit: "",
      description: "Total security scans",
      icon: BarChart3,
      color: "text-purple-600",
      trend: "up",
      trendValue: "+12 today"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Security Score Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Shield className="w-6 h-6" />
              <span>Security Overview</span>
            </span>
            <Badge variant={getScoreBadgeVariant(securityScore)} className="text-sm">
              {securityScore >= 90 ? "Excellent" : 
               securityScore >= 70 ? "Good" : 
               securityScore >= 50 ? "Fair" : "Needs Attention"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Your overall security posture and vulnerability status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                  className="text-muted"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${securityScore}, 100`}
                  className={getScoreColor(securityScore)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>
                    {securityScore}
                  </div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold mb-2">Security Assessment</h3>
            <p className="text-muted-foreground text-sm">
              {securityScore >= 90 
                ? "Excellent security posture with minimal risks"
                : securityScore >= 70 
                ? "Good security with some areas for improvement"
                : securityScore >= 50 
                ? "Fair security - several vulnerabilities need attention"
                : "Poor security - critical issues require immediate action"
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${metric.color}`}>
                    <metric.icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-1 text-sm">
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : metric.trend === "down" ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : null}
                    <span className={
                      metric.trend === "up" ? "text-green-600" : 
                      metric.trend === "down" ? "text-red-600" : 
                      "text-muted-foreground"
                    }>
                      {metric.trendValue}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${metric.color}`}>
                    {metric.value}{metric.unit}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{metric.title}</div>
                    <div className="text-xs text-muted-foreground">{metric.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Run Full Scan</div>
                  <div className="text-xs text-muted-foreground">Scan all projects</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">View Reports</div>
                  <div className="text-xs text-muted-foreground">Detailed analysis</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Security Tips</div>
                  <div className="text-xs text-muted-foreground">Best practices</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
