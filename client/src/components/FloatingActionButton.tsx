import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Minus, X, Search, Code, FileText } from "lucide-react";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [quickCode, setQuickCode] = useState("");
  const [scanResults, setScanResults] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleQuickScan = async () => {
    if (!quickCode.trim()) return;
    
    setIsScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      setScanResults({
        vulnerabilities: [
          {
            type: "SQL_INJECTION",
            severity: "HIGH",
            title: "Potential SQL Injection",
            description: "User input concatenated directly into SQL query"
          },
          {
            type: "XSS",
            severity: "MEDIUM", 
            title: "Cross-Site Scripting Risk",
            description: "Unescaped user input in HTML output"
          }
        ],
        securityScore: 6.5
      });
      setIsScanning(false);
    }, 2000);
  };

  const handleCreateProject = () => {
    // This would trigger project creation flow
    console.log("Create new project");
  };

  const handleOpenReports = () => {
    // This would navigate to reports section
    console.log("Open reports");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center"
      >
        <Plus className="h-6 w-6" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Floating Window */}
      <div
        className={`fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-12' : 'w-96 h-[32rem]'
        }`}
        style={{
          resize: isMinimized ? 'none' : 'both',
          overflow: 'auto',
          minWidth: '320px',
          minHeight: isMinimized ? '48px' : '400px',
          maxWidth: '90vw',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-move">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {isMinimized ? 'Quick Actions' : 'Security Toolkit'}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Quick Actions */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                <div className="space-y-3">
                  <Button
                    onClick={handleCreateProject}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Plus className="mr-3 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">New Project</div>
                      <div className="text-xs text-gray-500">Create a new security project</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={handleOpenReports}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <FileText className="mr-3 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">View Reports</div>
                      <div className="text-xs text-gray-500">Access security reports</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Quick Code Scanner */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Scanner</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="quick-code" className="text-sm">
                      Paste Code for Quick Analysis
                    </Label>
                    <Textarea
                      id="quick-code"
                      placeholder="Paste your code here for a quick security scan..."
                      value={quickCode}
                      onChange={(e) => setQuickCode(e.target.value)}
                      className="h-24 font-mono text-sm"
                    />
                  </div>
                  
                  <Button
                    onClick={handleQuickScan}
                    disabled={!quickCode.trim() || isScanning}
                    className="w-full"
                  >
                    {isScanning ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Quick Scan
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Scan Results */}
              {scanResults && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Scan Results</h4>
                  <Card>
                    <CardContent className="p-4">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Security Score</span>
                          <span className={`text-lg font-bold ${
                            scanResults.securityScore >= 8 ? 'text-green-600' : 
                            scanResults.securityScore >= 6 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {scanResults.securityScore}/10
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {scanResults.vulnerabilities.map((vuln: any, index: number) => (
                          <div
                            key={index}
                            className={`p-2 rounded text-xs ${
                              vuln.severity === 'HIGH' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                              vuln.severity === 'MEDIUM' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                              'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            }`}
                          >
                            <div className="font-medium">{vuln.title}</div>
                            <div className="text-xs opacity-80 mt-1">{vuln.description}</div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs font-medium">{vuln.severity}</span>
                              <span className="text-xs opacity-60">{vuln.type.replace('_', ' ')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
