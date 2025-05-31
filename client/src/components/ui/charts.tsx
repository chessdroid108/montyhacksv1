import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface ChartData {
  labels: string[];
  datasets: Array<{
    label?: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    tension?: number;
    fill?: boolean;
  }>;
}

interface ChartsContainerProps {
  type: "line" | "bar" | "doughnut" | "pie";
  data: ChartData;
  options?: any;
  className?: string;
}

export function ChartsContainer({ type, data, options = {}, className = "" }: ChartsContainerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Default options for better appearance
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: type === "doughnut" || type === "pie",
          position: "bottom" as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            color: getComputedStyle(document.documentElement).getPropertyValue('--foreground') || '#374151',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#374151',
          borderWidth: 1,
        },
      },
      scales: type !== "doughnut" && type !== "pie" ? {
        x: {
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--border') || '#e5e7eb',
          },
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground') || '#6b7280',
          },
        },
        y: {
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--border') || '#e5e7eb',
          },
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground') || '#6b7280',
          },
          beginAtZero: true,
        },
      } : undefined,
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      plugins: {
        ...defaultOptions.plugins,
        ...options.plugins,
      },
    };

    // Create new chart
    chartRef.current = new ChartJS(ctx, {
      type: type === "doughnut" ? "doughnut" : type === "pie" ? "pie" : type,
      data,
      options: mergedOptions,
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [type, data, options]);

  return (
    <div className={`relative w-full h-64 ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
}
