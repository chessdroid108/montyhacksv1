import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface FloatingWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface QuickScanResult {
  vulnerabilities: Array<{
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    confidence: number;
  }>;
  securityScore: number;
}

export default function FloatingWindow({ open, onOpenChange }: FloatingWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [quickCode, setQuickCode] = useState("");
  const [scanResults, setScanResults] = useState<QuickScanResult | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize position to bottom-right corner
  useEffect(() => {
    if (open && position.x === 0 && position.y === 0) {
      setPosition({
        x: window.innerWidth - 400 - 24, // 400px width + 24px margin
        y: window.innerHeight - 320 - 100 // 320px height + 100px margin
      });
    }
  }, [open, position]);

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (headerRef.current && headerRef.current.contains(e.target as Node)) {
      setIsDragging(true);
      const rect = windowRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const quickScanMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/scan/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code,
          language: "javascript", // Default to JavaScript for quick scan
          fileName: "quick-scan.js"
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: (results) => {
      setScanResults(results);
      toast({
        title: "Quick scan completed",
        description: `Found ${results.vulnerabilities.length} issues`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      
      toast({
        title: "Quick scan failed",
        description: "Unable to scan code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleQuickScan = () => {
    if (!quickCode.trim()) {
      toast({
        title: "No code to scan",
        description: "Please enter some code to analyze.",
        variant: "destructive",
      });
      return;
    }

    quickScanMutation.mutate(quickCode);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const quickActions = [
    {
      icon: "fas fa-search",
      title: "Quick Scan",
      description: "Scan code snippet for vulnerabilities",
      color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      action: () => {
        // Focus on the code textarea
        const textarea = document.querySelector('#quick-code') as HTMLTextAreaElement;
        if (textarea) textarea.focus();
      }
    },
    {
      icon: "fas fa-plus",
      title: "New Project",
      description: "Create a new security project",
      color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      action: () => {
        toast({
          title: "Coming soon",
          description: "Project creation feature will be available soon.",
        });
      }
    },
    {
      icon: "fas fa-file-alt",
      title: "View Reports",
      description: "Access your security reports",
      color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
      action: () => {
        toast({
          title: "Redirecting",
          description: "Opening reports section...",
        });
        // In a real app, this would navigate to reports
      }
    }
  ];

  if (!open) return null;

  return (
    <div
      ref={windowRef}
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized ? 'w-64 h-12' : 'w-96 h-80'
      }`}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className="h-full shadow-2xl border-2">
        <CardHeader 
          ref={headerRef}
          className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-move rounded-t-lg ${
            isMinimized ? 'rounded-b-lg' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-bolt text-yellow-300"></i>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <i className={`fas ${isMinimized ? 'fa-plus' : 'fa-minus'} text-xs`}></i>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                onClick={() => onOpenChange(false)}
              >
                <i className="fas fa-times text-xs"></i>
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-4 space-y-4 h-64 overflow-y-auto">
            {/* Quick Actions Grid */}
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`w-full p-3 rounded-lg border text-left transition-all hover:shadow-sm ${action.color}`}
                >
                  <div className="flex items-center space-x-3">
                    <i className={action.icon}></i>
                    <div>
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs opacity-70">{action.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Code Scanner */}
            <div className="border-t pt-4">
              <Label htmlFor="quick-code" className="text-sm font-medium">Quick Code Scan</Label>
              <Textarea
                id="quick-code"
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value)}
                placeholder="Paste code here for instant analysis..."
                className="mt-2 h-20 text-xs font-mono"
              />
              <div className="flex items-center justify-between mt-2">
                <Button 
                  size="sm" 
                  onClick={handleQuickScan}
                  disabled={quickScanMutation.isPending || !quickCode.trim()}
                  className="text-xs"
                >
                  <i className="fas fa-search mr-1"></i>
                  {quickScanMutation.isPending ? "Scanning..." : "Scan"}
                </Button>
                
                {scanResults && (
                  <div className="text-xs text-muted-foreground">
                    Score: {scanResults.securityScore}/10 • {scanResults.vulnerabilities.length} issues
                  </div>
                )}
              </div>
            </div>

            {/* Quick Scan Results */}
            {scanResults && scanResults.vulnerabilities.length > 0 && (
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium mb-2">Quick Results</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {scanResults.vulnerabilities.slice(0, 3).map((vuln, index) => (
                    <div key={index} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
                      <span className="truncate flex-1">{vuln.type}</span>
                      <Badge variant={getSeverityColor(vuln.severity)} className="text-xs ml-2">
                        {vuln.severity}
                      </Badge>
                    </div>
                  ))}
                  {scanResults.vulnerabilities.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{scanResults.vulnerabilities.length - 3} more issues
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
