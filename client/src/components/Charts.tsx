import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

// Mock Chart.js for demonstration - in a real app you'd import the actual Chart.js
declare global {
  interface Window {
    Chart?: any;
  }
}

export default function Charts() {
  const vulnerabilityChartRef = useRef<HTMLCanvasElement>(null);
  const securityScoreChartRef = useRef<HTMLCanvasElement>(null);
  const languageChartRef = useRef<HTMLCanvasElement>(null);
  
  // Fetch user stats for chart data
  const { data: userStats } = useQuery({
    queryKey: ["/api/users/stats"],
    retry: false,
  });

  // Load Chart.js dynamically
  useEffect(() => {
    const loadChartJS = async () => {
      if (typeof window !== 'undefined' && !window.Chart) {
        try {
          const module = await import('chart.js/auto');
          window.Chart = module.default;
        } catch (error) {
          console.warn('Chart.js not available, using fallback visualization');
        }
      }
    };

    loadChartJS();
  }, []);

  // Initialize charts
  useEffect(() => {
    if (!window.Chart) return;

    let vulnerabilityChart: any;
    let securityScoreChart: any;
    let languageChart: any;

    // Vulnerability Trends Chart
    if (vulnerabilityChartRef.current) {
      const ctx = vulnerabilityChartRef.current.getContext('2d');
      vulnerabilityChart = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Vulnerabilities Found',
            data: [12, 19, 8, 15, 6, 23],
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(156, 163, 175, 0.1)'
              },
              ticks: {
                color: '#9CA3AF'
              }
            },
            x: {
              grid: {
                color: 'rgba(156, 163, 175, 0.1)'
              },
              ticks: {
                color: '#9CA3AF'
              }
            }
          }
        }
      });
    }

    // Security Score Chart
    if (securityScoreChartRef.current) {
      const ctx = securityScoreChartRef.current.getContext('2d');
      securityScoreChart = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            label: 'Security Score',
            data: [7.2, 7.8, 8.1, 8.7],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              min: 0,
              max: 10,
              grid: {
                color: 'rgba(156, 163, 175, 0.1)'
              },
              ticks: {
                color: '#9CA3AF'
              }
            },
            x: {
              grid: {
                color: 'rgba(156, 163, 175, 0.1)'
              },
              ticks: {
                color: '#9CA3AF'
              }
            }
          }
        }
      });
    }

    // Language Usage Chart
    if (languageChartRef.current) {
      const ctx = languageChartRef.current.getContext('2d');
      languageChart = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['JavaScript', 'Python', 'Java', 'C++', 'PHP'],
          datasets: [{
            data: [35, 25, 20, 12, 8],
            backgroundColor: [
              '#3B82F6', // Blue
              '#10B981', // Green
              '#F59E0B', // Yellow
              '#EF4444', // Red
              '#8B5CF6'  // Purple
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#9CA3AF',
                padding: 15,
                usePointStyle: true
              }
            }
          }
        }
      });
    }

    // Cleanup function
    return () => {
      if (vulnerabilityChart) vulnerabilityChart.destroy();
      if (securityScoreChart) securityScoreChart.destroy();
      if (languageChart) languageChart.destroy();
    };
  }, [userStats]);

  // Fallback visualization when Chart.js is not available
  const FallbackChart = ({ title, type = "line" }: { title: string; type?: string }) => (
    <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
      <div className="text-center text-muted-foreground">
        <i className="fas fa-chart-line text-4xl mb-2 opacity-50"></i>
        <p className="text-sm">{title}</p>
        <p className="text-xs opacity-70">Chart visualization loading...</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Vulnerability Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-chart-line mr-2 text-red-500"></i>
            Vulnerability Trends
          </CardTitle>
          <CardDescription>
            Vulnerabilities detected over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {window.Chart ? (
              <canvas ref={vulnerabilityChartRef}></canvas>
            ) : (
              <FallbackChart title="Vulnerability Trends" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Score History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-shield-alt mr-2 text-green-500"></i>
            Security Score
          </CardTitle>
          <CardDescription>
            Security score improvement over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {window.Chart ? (
              <canvas ref={securityScoreChartRef}></canvas>
            ) : (
              <FallbackChart title="Security Score History" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Language Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-code mr-2 text-blue-500"></i>
            Language Usage
          </CardTitle>
          <CardDescription>
            Most scanned programming languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {window.Chart ? (
              <canvas ref={languageChartRef}></canvas>
            ) : (
              <FallbackChart title="Language Distribution" type="doughnut" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics Cards */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-tachometer-alt mr-2 text-purple-500"></i>
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Key performance indicators for your security posture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {userStats?.averageFixTime || "2.3"}h
              </div>
              <div className="text-sm text-muted-foreground">Average Fix Time</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {userStats?.scanFrequency || "12"}/week
              </div>
              <div className="text-sm text-muted-foreground">Scans per Week</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {userStats?.codeQualityTrend || "+15"}%
              </div>
              <div className="text-sm text-muted-foreground">Quality Improvement</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scanning Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-activity mr-2 text-orange-500"></i>
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest security scanning activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">File scan completed</p>
                <p className="text-xs text-muted-foreground">auth.js - 2 issues found</p>
              </div>
              <span className="text-xs text-muted-foreground">2h ago</span>
            </div>
            <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Project scan started</p>
                <p className="text-xs text-muted-foreground">Full repository analysis</p>
              </div>
              <span className="text-xs text-muted-foreground">5h ago</span>
            </div>
            <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Vulnerability fixed</p>
                <p className="text-xs text-muted-foreground">SQL injection in login.php</p>
              </div>
              <span className="text-xs text-muted-foreground">1d ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
