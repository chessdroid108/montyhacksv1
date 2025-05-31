import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, Users, Activity, BarChart3 } from "lucide-react";

interface AdminChartsProps {
  analytics?: any;
  trafficData?: any;
  timeRange: string;
}

export function AdminCharts({ analytics, trafficData, timeRange }: AdminChartsProps) {
  const userGrowthRef = useRef<HTMLCanvasElement>(null);
  const scanVolumeRef = useRef<HTMLCanvasElement>(null);
  const languageDistributionRef = useRef<HTMLCanvasElement>(null);
  const trafficAnalyticsRef = useRef<HTMLCanvasElement>(null);

  const userGrowthChart = useRef<any>(null);
  const scanVolumeChart = useRef<any>(null);
  const languageChart = useRef<any>(null);
  const trafficChart = useRef<any>(null);

  useEffect(() => {
    const loadCharts = async () => {
      if (typeof window !== 'undefined') {
        const Chart = (await import('chart.js')).default;
        await import('chart.js/auto');

        // Destroy existing charts
        [userGrowthChart, scanVolumeChart, languageChart, trafficChart].forEach(chart => {
          if (chart.current) {
            chart.current.destroy();
          }
        });

        // User Growth Chart
        if (userGrowthRef.current) {
          const ctx = userGrowthRef.current.getContext('2d');
          if (ctx) {
            const userGrowthData = [450, 620, 780, 920, 1100, 1250, 1450];
            const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

            userGrowthChart.current = new Chart(ctx, {
              type: 'line',
              data: {
                labels,
                datasets: [
                  {
                    label: 'New Users',
                    data: userGrowthData,
                    borderColor: 'rgb(139, 92, 246)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(139, 92, 246)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    cornerRadius: 8,
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(156, 163, 175, 0.7)' },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(156, 163, 175, 0.1)' },
                    ticks: { color: 'rgba(156, 163, 175, 0.7)' },
                  },
                },
              },
            });
          }
        }

        // Scan Volume Chart
        if (scanVolumeRef.current) {
          const ctx = scanVolumeRef.current.getContext('2d');
          if (ctx) {
            const scanData = [1200, 1900, 800, 1500, 2000, 800, 600];
            const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

            scanVolumeChart.current = new Chart(ctx, {
              type: 'bar',
              data: {
                labels,
                datasets: [
                  {
                    label: 'Scans',
                    data: scanData,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                    borderRadius: 4,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    cornerRadius: 8,
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(156, 163, 175, 0.7)' },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(156, 163, 175, 0.1)' },
                    ticks: { color: 'rgba(156, 163, 175, 0.7)' },
                  },
                },
              },
            });
          }
        }

        // Language Distribution Chart
        if (languageDistributionRef.current) {
          const ctx = languageDistributionRef.current.getContext('2d');
          if (ctx) {
            const languageData = analytics?.languageStats || [
              { name: 'JavaScript', count: 35 },
              { name: 'Python', count: 25 },
              { name: 'Java', count: 20 },
              { name: 'PHP', count: 12 },
              { name: 'C#', count: 8 },
            ];

            languageChart.current = new Chart(ctx, {
              type: 'doughnut',
              data: {
                labels: languageData.map(lang => lang.name),
                datasets: [
                  {
                    data: languageData.map(lang => lang.count),
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(16, 185, 129, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(239, 68, 68, 0.8)',
                      'rgba(139, 92, 246, 0.8)',
                    ],
                    borderColor: [
                      'rgb(59, 130, 246)',
                      'rgb(16, 185, 129)',
                      'rgb(245, 158, 11)',
                      'rgb(239, 68, 68)',
                      'rgb(139, 92, 246)',
                    ],
                    borderWidth: 2,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: 'rgba(156, 163, 175, 0.8)',
                      usePointStyle: true,
                      padding: 15,
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    cornerRadius: 8,
                    callbacks: {
                      label: (context: any) => {
                        const percentage = ((context.parsed / languageData.reduce((a, b) => a + b.count, 0)) * 100).toFixed(1);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                      },
                    },
                  },
                },
              },
            });
          }
        }

        // Traffic Analytics Chart
        if (trafficAnalyticsRef.current) {
          const ctx = trafficAnalyticsRef.current.getContext('2d');
          if (ctx) {
            const trafficDataPoints = [2500, 3200, 2800, 3500, 4100, 3800, 4200];
            const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

            trafficChart.current = new Chart(ctx, {
              type: 'area',
              data: {
                labels,
                datasets: [
                  {
                    label: 'Page Views',
                    data: trafficDataPoints,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(16, 185, 129)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    cornerRadius: 8,
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(156, 163, 175, 0.7)' },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(156, 163, 175, 0.1)' },
                    ticks: { color: 'rgba(156, 163, 175, 0.7)' },
                  },
                },
              },
            });
          }
        }
      }
    };

    loadCharts();

    return () => {
      [userGrowthChart, scanVolumeChart, languageChart, trafficChart].forEach(chart => {
        if (chart.current) {
          chart.current.destroy();
        }
      });
    };
  }, [analytics, timeRange]);

  const chartCards = [
    {
      title: "User Growth",
      icon: Users,
      ref: userGrowthRef,
      description: "New user registrations over time",
    },
    {
      title: "Scan Volume",
      icon: Activity,
      ref: scanVolumeRef,
      description: "Daily vulnerability scans performed",
    },
    {
      title: "Language Distribution",
      icon: BarChart3,
      ref: languageDistributionRef,
      description: "Most popular programming languages",
    },
    {
      title: "Traffic Analytics",
      icon: TrendingUp,
      ref: trafficAnalyticsRef,
      description: "Daily page views and user activity",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {chartCards.map((chart, index) => (
        <motion.div
          key={chart.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <chart.icon className="w-5 h-5 text-primary" />
                <span>{chart.title}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{chart.description}</p>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 w-full">
                <canvas ref={chart.ref} className="absolute inset-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
