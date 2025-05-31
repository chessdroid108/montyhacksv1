import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Minus, 
  X, 
  Search, 
  Play, 
  FileText, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Code,
  Zap,
  Settings
} from "lucide-react";

interface FloatingWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuickScan?: () => void;
}

export function FloatingWindow({ open, onOpenChange, onQuickScan }: FloatingWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [quickCode, setQuickCode] = useState("");
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState("scanner");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const quickActions = [
    {
      id: "quick-scan",
      title: "Quick Vulnerability Scan",
      description: "Scan code snippet for security issues",
      icon: Search,
      color: "bg-blue-500",
      action: () => setActiveTab("scanner")
    },
    {
      id: "new-project",
      title: "Create New Project",
      description: "Start a new security analysis project",
      icon: FileText,
      color: "bg-green-500",
      action: () => {
        toast({
          title: "Feature Coming Soon",
          description: "Project creation will be available in the next update.",
        });
      }
    },
    {
      id: "security-tips",
      title: "Security Best Practices",
      description: "View security recommendations",
      icon: Shield,
      color: "bg-purple-500",
      action: () => setActiveTab("tips")
    },
    {
      id: "ai-assistant",
      title: "AI Security Assistant",
      description: "Get AI-powered security advice",
      icon: Zap,
      color: "bg-yellow-500",
      action: () => setActiveTab("assistant")
    }
  ];

  const securityTips = [
    {
      title: "Use Parameterized Queries",
      description: "Always use parameterized queries to prevent SQL injection attacks.",
      severity: "critical"
    },
    {
      title: "Input Validation",
      description: "Validate and sanitize all user inputs before processing.",
      severity: "high"
    },
    {
      title: "Secure Headers",
      description: "Implement security headers like CSP, HSTS, and X-Frame-Options.",
      severity: "medium"
    },
    {
      title: "Regular Updates",
      description: "Keep dependencies and frameworks updated to latest versions.",
      severity: "medium"
    }
  ];

  const handleQuickScan = async () => {
    if (!quickCode.trim()) {
      toast({
        title: "No Code to Scan",
        description: "Please enter some code to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock scan results based on code content
      const mockResults = [];
      
      if (quickCode.includes('${') && quickCode.toLowerCase().includes('select')) {
        mockResults.push({
          type: "SQL Injection",
          severity: "critical",
          line: 1,
          message: "Potential SQL injection vulnerability detected"
        });
      }
      
      if (quickCode.includes('innerHTML')) {
        mockResults.push({
          type: "XSS",
          severity: "high",
          line: 2,
          message: "Potential XSS vulnerability in innerHTML usage"
        });
      }

      if (quickCode.includes('password') && quickCode.includes('=')) {
        mockResults.push({
          type: "Hardcoded Credentials",
          severity: "high",
          line: 3,
          message: "Hardcoded password detected in source code"
        });
      }

      setScanResults(mockResults);
      
      toast({
        title: "Scan Complete",
        description: `Found ${mockResults.length} potential issues`,
      });
      
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to complete the security scan",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  // Drag functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - window.innerWidth / 2,
          y: e.clientY - window.innerHeight / 2
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
  }, [isDragging]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed z-50"
        style={{
          bottom: isMinimized ? '6rem' : '1.5rem',
          right: '1.5rem',
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: isMinimized ? '16rem' : '24rem',
          height: isMinimized ? '3rem' : '28rem'
        }}
      >
        <Card className="h-full shadow-2xl border-2">
          {/* Header */}
          <CardHeader 
            ref={dragRef}
            className={`pb-2 cursor-move select-none ${isMinimized ? 'p-3' : ''}`}
            onMouseDown={() => setIsDragging(true)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className={`flex items-center space-x-2 ${isMinimized ? 'text-sm' : 'text-base'}`}>
                <Zap className={isMinimized ? 'w-4 h-4' : 'w-5 h-5'} />
                <span>Quick Actions</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="flex-1 p-4">
                  {activeTab === "actions" && (
                    <div className="space-y-3">
                      {quickActions.map((action) => (
                        <motion.div
                          key={action.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={action.action}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                              <action.icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{action.title}</div>
                              <div className="text-xs text-muted-foreground">{action.description}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeTab === "scanner" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Quick Code Scanner</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("actions")}
                        >
                          Back
                        </Button>
                      </div>
                      
                      <Textarea
                        placeholder="Paste your code here for quick security analysis..."
                        value={quickCode}
                        onChange={(e) => setQuickCode(e.target.value)}
                        className="min-h-[100px] font-mono text-sm"
                      />
                      
                      <Button 
                        onClick={handleQuickScan}
                        disabled={isScanning || !quickCode.trim()}
                        className="w-full"
                      >
                        {isScanning ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        ) : (
                          <Search className="w-4 h-4 mr-2" />
                        )}
                        {isScanning ? 'Scanning...' : 'Scan Code'}
                      </Button>
                      
                      {scanResults.length > 0 && (
                        <div className="space-y-2">
                          <Separator />
                          <h4 className="text-sm font-medium">Scan Results:</h4>
                          <ScrollArea className="h-32">
                            {scanResults.map((result, index) => (
                              <div key={index} className={`p-2 rounded-lg mb-2 ${getSeverityColor(result.severity)}`}>
                                <div className="flex items-start space-x-2">
                                  <AlertTriangle className="w-3 h-3 mt-0.5" />
                                  <div>
                                    <div className="text-xs font-medium">{result.type}</div>
                                    <div className="text-xs opacity-80">{result.message}</div>
                                    <Badge variant="outline" className="text-xs h-4 mt-1">
                                      Line {result.line}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </ScrollArea>
                        </div>
                      )}
                      
                      {scanResults.length === 0 && quickCode && !isScanning && (
                        <div className="text-center py-4">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <p className="text-sm text-green-600 font-medium">No issues found!</p>
                          <p className="text-xs text-muted-foreground">Your code looks secure</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "tips" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Security Tips</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("actions")}
                        >
                          Back
                        </Button>
                      </div>
                      
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {securityTips.map((tip, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-start space-x-2">
                                <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{tip.title}</div>
                                  <div className="text-xs text-muted-foreground mt-1">{tip.description}</div>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs h-4 mt-2 ${getSeverityColor(tip.severity)}`}
                                  >
                                    {tip.severity.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {activeTab === "assistant" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">AI Security Assistant</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("actions")}
                        >
                          Back
                        </Button>
                      </div>
                      
                      <div className="text-center py-8">
                        <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <p className="text-sm font-medium mb-2">AI Assistant</p>
                        <p className="text-xs text-muted-foreground">
                          Get personalized security advice and code recommendations
                        </p>
                        <Button className="mt-4" size="sm">
                          Start Conversation
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>

                {/* Navigation Tabs */}
                <div className="border-t p-2">
                  <div className="flex justify-center space-x-1">
                    {[
                      { id: "actions", icon: Settings, label: "Actions" },
                      { id: "scanner", icon: Search, label: "Scanner" },
                      { id: "tips", icon: Shield, label: "Tips" },
                      { id: "assistant", icon: Zap, label: "AI" }
                    ].map((tab) => (
                      <Button
                        key={tab.id}
                        size="sm"
                        variant={activeTab === tab.id ? "default" : "ghost"}
                        className="h-8 w-16"
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <tab.icon className="w-3 h-3" />
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
