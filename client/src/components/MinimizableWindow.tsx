import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, Minus, Maximize2, Minimize2 } from "lucide-react";

interface MinimizableWindowProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export default function MinimizableWindow({
  isOpen,
  onClose,
  title = "Security Analysis",
  children,
}: MinimizableWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ width: 400, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      className={`fixed z-40 bg-background border border-border rounded-lg shadow-2xl transition-all duration-300 ${
        isMinimized ? "h-12" : ""
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? 300 : size.width,
        height: isMinimized ? 48 : size.height,
        minWidth: 300,
        minHeight: 200,
        maxWidth: "90vw",
        maxHeight: "90vh",
      }}
    >
      {/* Window Header */}
      <div
        className="flex items-center justify-between p-3 border-b border-border cursor-move bg-muted/50 rounded-t-lg"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-semibold ml-2">{title}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Window Content */}
      {!isMinimized && (
        <div className="p-4 h-full overflow-auto">
          {children || <DefaultWindowContent />}
        </div>
      )}

      {/* Resize Handle */}
      {!isMinimized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-muted-foreground"></div>
        </div>
      )}
    </div>
  );
}

function DefaultWindowContent() {
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Real-time Analysis</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Monitor your code security in real-time with AI-powered analysis.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Pattern Matching</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active
          </Badge>
        </div>
        <Progress value={85} className="h-2" />
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">AI Analysis</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Processing
          </Badge>
        </div>
        <Progress value={scanProgress} className="h-2" />
      </div>

      <Button
        onClick={startScan}
        disabled={isScanning}
        className="w-full"
        variant={isScanning ? "secondary" : "default"}
      >
        {isScanning ? "Scanning..." : "Start Quick Scan"}
      </Button>

      {scanProgress === 100 && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <h4 className="text-sm font-semibold text-red-600">
              Critical Issue Detected
            </h4>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              SQL injection vulnerability found in authentication module.
            </p>
            <div className="flex items-center justify-between mt-2">
              <Badge variant="destructive" className="text-xs">
                Critical
              </Badge>
              <span className="text-xs text-muted-foreground">
                Confidence: 94%
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
