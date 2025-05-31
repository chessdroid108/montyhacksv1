import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useVulnerabilityScanning } from "@/hooks/useVulnerabilityScanning";
import { getSeverityColor, getSeverityBgColor } from "@/lib/vulnerabilityScanner";
import { 
  Minus, 
  X, 
  Search, 
  FileText, 
  FolderOpen, 
  Activity 
} from "lucide-react";

interface MinimizableWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MinimizableWindow({ isOpen, onClose }: MinimizableWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [quickCode, setQuickCode] = useState("");
  const [showResults, setShowResults] = useState(false);
  
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  const { scan, isScanning, scanResult } = useVulnerabilityScanning();

  // Position window in bottom right initially
  useEffect(() => {
    if (isOpen && windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setPosition({
        x: window.innerWidth - rect.width - 24,
        y: window.innerHeight - rect.height - 100
      });
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (headerRef.current?.contains(e.target as Node)) {
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

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - 320, e.clientY - dragOffset.y))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleQuickScan = async () => {
    if (!quickCode.trim()) return;
    
    try {
      const result = await scan({
        projectId: 0,
        scanType: "FILE",
        code: quickCode,
        fileName: "quick-scan.js"
      });
      setShowResults(true);
    } catch (error) {
      console.error("Quick scan failed:", error);
    }
  };

  if (!isOpen) return null;

  const windowStyle = {
    position: 'fixed' as const,
    left: position.x,
    top: position.y,
    width: '400px',
    height: isMinimized ? '56px' : '320px',
    zIndex: 30,
    transition: isDragging ? 'none' : 'height 0.3s ease-out',
  };

  return (
    <Card
      ref={windowRef}
      style={windowStyle}
      className="shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden resize"
      onMouseDown={handleMouseDown}
    >
      <CardHeader
        ref={headerRef}
        className="flex flex-row items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 cursor-move select-none"
      >
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Quick Security Analysis</h3>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-4 h-full overflow-y-auto">
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => window.location.href = "/dashboard"}
              >
                <Search className="w-3 h-3 mr-1" />
                Scan
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => window.location.href = "/dashboard"}
              >
                <FileText className="w-3 h-3 mr-1" />
                Reports
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => window.location.href = "/dashboard"}
              >
                <FolderOpen className="w-3 h-3 mr-1" />
                Projects
              </Button>
            </div>

            {/* Quick Code Scan */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Paste Code for Quick Scan
              </label>
              <Textarea
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value)}
                placeholder="Paste your code here for quick vulnerability scan..."
                rows={3}
                className="text-xs font-mono"
              />
              <Button
                onClick={handleQuickScan}
                disabled={!quickCode.trim() || isScanning}
                size="sm"
                className="w-full"
              >
                {isScanning ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Scanning...</span>
                  </div>
                ) : (
                  <>
                    <Search className="w-3 h-3 mr-2" />
                    Quick Scan
                  </>
                )}
              </Button>
            </div>

            {/* Quick Results */}
            {showResults && scanResult && (
              <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Scan Results
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Security Score:</span>
                    <Badge variant={scanResult.securityScore >= 80 ? "default" : "destructive"}>
                      {scanResult.securityScore}/100
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {scanResult.vulnerabilities.length} vulnerabilities found
                  </div>
                  {scanResult.vulnerabilities.slice(0, 2).map((vuln, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-xs ${getSeverityBgColor(vuln.severity)}`}
                    >
                      <div className={`font-medium ${getSeverityColor(vuln.severity)}`}>
                        {vuln.type}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 truncate">
                        Line {vuln.line}: {vuln.message}
                      </div>
                    </div>
                  ))}
                  {scanResult.vulnerabilities.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{scanResult.vulnerabilities.length - 2} more vulnerabilities
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
