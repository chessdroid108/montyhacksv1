import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import FileTree from "@/components/FileTree";
import CodeEditor from "@/components/CodeEditor";
import { 
  Play, 
  Search, 
  Folder, 
  File, 
  Save, 
  Upload, 
  Download,
  AlertTriangle,
  CheckCircle,
  Bug,
  Shield,
  Code,
  Settings,
  Terminal,
  RefreshCw
} from "lucide-react";

interface FileData {
  filename: string;
  content: string;
}

interface ScanResult {
  id: number;
  fileName: string;
  vulnerabilities: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    line: number;
    column?: number;
    fix?: string;
    confidence: number;
  }>;
  securityScore: number;
  status: string;
  createdAt: string;
}

export default function IDE() {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileData[]>([
    {
      filename: "example.js",
      content: `// Sample JavaScript code with potential vulnerabilities
const express = require('express');
const app = express();

// Vulnerable: SQL Injection
app.post('/login', (req, res) => {
  const query = \`SELECT * FROM users WHERE email = '\${req.body.email}' AND password = '\${req.body.password}'\`;
  db.query(query, (err, results) => {
    if (results.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});

// Vulnerable: XSS
app.get('/profile/:id', (req, res) => {
  const html = \`<h1>Welcome \${req.query.name}</h1>\`;
  res.send(html);
});

app.listen(3000);`
    }
  ]);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(files[0]);
  const [scanResults, setScanResults] = useState<ScanResult | null>(null);
  const [activeTab, setActiveTab] = useState("editor");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scanMutation = useMutation({
    mutationFn: async (scanData: { fileName: string; fileContent: string; scanType: string }) => {
      const response = await apiRequest("POST", "/api/scan", scanData);
      return response.json();
    },
    onSuccess: (data: ScanResult) => {
      setScanResults(data);
      queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
      toast({
        title: "Scan Completed",
        description: `Found ${data.vulnerabilities?.length || 0} vulnerabilities with score ${data.securityScore}/100`,
      });
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: "Failed to scan the file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const multiScanMutation = useMutation({
    mutationFn: async (scanData: { files: FileData[]; scanType: string }) => {
      const response = await apiRequest("POST", "/api/scan/multiple", scanData);
      return response.json();
    },
    onSuccess: (data: ScanResult) => {
      setScanResults(data);
      queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
      toast({
        title: "Multi-file Scan Completed",
        description: `Scanned ${files.length} files with score ${data.securityScore}/100`,
      });
    },
    onError: (error) => {
      toast({
        title: "Multi-file Scan Failed",
        description: "Failed to scan files. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: FileData) => {
    setSelectedFile(file);
  };

  const handleCodeChange = (newCode: string) => {
    if (selectedFile) {
      const updatedFiles = files.map(file => 
        file.filename === selectedFile.filename 
          ? { ...file, content: newCode }
          : file
      );
      setFiles(updatedFiles);
      setSelectedFile({ ...selectedFile, content: newCode });
    }
  };

  const handleScanFile = () => {
    if (!selectedFile) return;
    
    scanMutation.mutate({
      fileName: selectedFile.filename,
      fileContent: selectedFile.content,
      scanType: 'file'
    });
  };

  const handleScanProject = () => {
    multiScanMutation.mutate({
      files: files,
      scanType: 'project'
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newFile: FileData = {
          filename: file.name,
          content: content
        };
        
        setFiles(prev => {
          const existing = prev.find(f => f.filename === file.name);
          if (existing) {
            return prev.map(f => f.filename === file.name ? newFile : f);
          }
          return [...prev, newFile];
        });
        
        if (!selectedFile) {
          setSelectedFile(newFile);
        }
      };
      reader.readAsText(file);
    });

    toast({
      title: "Files Uploaded",
      description: `Successfully uploaded ${uploadedFiles.length} file(s)`,
    });
  };

  const addNewFile = () => {
    const filename = prompt("Enter filename (e.g., app.js, index.html):");
    if (!filename) return;

    const newFile: FileData = {
      filename,
      content: "// New file\n"
    };

    setFiles(prev => [...prev, newFile]);
    setSelectedFile(newFile);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="h-screen flex flex-col">
        {/* IDE Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Code className="mr-2 h-6 w-6" />
                SecureCode IDE
              </h1>
              <Badge variant="secondary">
                {files.length} file{files.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".js,.jsx,.ts,.tsx,.py,.php,.html,.css,.json,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
              <Button
                variant="outline"
                onClick={addNewFile}
              >
                <File className="mr-2 h-4 w-4" />
                New File
              </Button>
              <Button
                onClick={handleScanFile}
                disabled={!selectedFile || scanMutation.isPending}
              >
                <Search className="mr-2 h-4 w-4" />
                {scanMutation.isPending ? "Scanning..." : "Scan File"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleScanProject}
                disabled={files.length === 0 || multiScanMutation.isPending}
              >
                <Folder className="mr-2 h-4 w-4" />
                {multiScanMutation.isPending ? "Scanning..." : "Scan Project"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <FileTree
              files={files}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onDeleteFile={(filename) => {
                setFiles(prev => prev.filter(f => f.filename !== filename));
                if (selectedFile?.filename === filename) {
                  setSelectedFile(files.find(f => f.filename !== filename) || null);
                }
              }}
            />
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="editor">Code Editor</TabsTrigger>
                <TabsTrigger value="terminal">Terminal</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="flex-1 mt-0">
                {selectedFile ? (
                  <CodeEditor
                    filename={selectedFile.filename}
                    code={selectedFile.content}
                    onChange={handleCodeChange}
                    vulnerabilities={scanResults?.vulnerabilities || []}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-center">
                      <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No file selected
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Select a file from the file tree or create a new one
                      </p>
                      <Button onClick={addNewFile}>
                        <File className="mr-2 h-4 w-4" />
                        Create New File
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="terminal" className="flex-1 mt-0">
                <div className="h-full bg-black text-green-400 p-4 font-mono text-sm">
                  <div className="mb-2">SecureCode Terminal v1.0.0</div>
                  <div className="mb-2">Type 'help' for available commands</div>
                  <div className="flex items-center">
                    <span className="text-blue-400">user@securecode:~$</span>
                    <div className="ml-2 w-2 h-4 bg-green-400 animate-pulse"></div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="flex-1 mt-0 p-6">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold mb-4">Editor Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Theme</label>
                        <p className="text-xs text-muted-foreground">Choose editor color theme</p>
                      </div>
                      <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                        <option>VS Code Dark</option>
                        <option>VS Code Light</option>
                        <option>Monokai</option>
                        <option>GitHub</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Font Size</label>
                        <p className="text-xs text-muted-foreground">Editor font size</p>
                      </div>
                      <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                        <option>12px</option>
                        <option>14px</option>
                        <option>16px</option>
                        <option>18px</option>
                      </select>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Vulnerability Panel */}
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Security Scanner
                </h3>
                {scanResults && (
                  <Badge 
                    variant={scanResults.securityScore >= 80 ? "default" : 
                           scanResults.securityScore >= 60 ? "secondary" : "destructive"}
                  >
                    Score: {scanResults.securityScore}/100
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {scanResults ? (
                <div className="space-y-4">
                  {/* Security Score */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className={`text-3xl font-bold mb-2 ${
                          scanResults.securityScore >= 80 ? 'text-green-600 dark:text-green-400' :
                          scanResults.securityScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {scanResults.securityScore}
                        </div>
                        <div className="text-sm text-muted-foreground">Security Score</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${
                              scanResults.securityScore >= 80 ? 'bg-green-600' :
                              scanResults.securityScore >= 60 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${scanResults.securityScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vulnerabilities */}
                  <div>
                    <h4 className="font-medium mb-3 text-gray-900 dark:text-white">
                      Detected Issues ({scanResults.vulnerabilities?.length || 0})
                    </h4>
                    <div className="space-y-3">
                      {scanResults.vulnerabilities?.map((vuln, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(vuln.severity)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {vuln.severity.toUpperCase()}
                            </Badge>
                            <span className="text-xs">Line {vuln.line}</span>
                          </div>
                          <h5 className="font-medium text-sm mb-1">{vuln.type}</h5>
                          <p className="text-xs mb-2">{vuln.message}</p>
                          {vuln.fix && (
                            <div className="text-xs">
                              <span className="font-medium">Fix:</span> {vuln.fix}
                            </div>
                          )}
                          <div className="text-xs mt-2 opacity-75">
                            Confidence: {Math.round(vuln.confidence * 100)}%
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No vulnerabilities found!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No scan results yet. Run a security scan to analyze your code.
                  </p>
                  <Button 
                    onClick={handleScanFile}
                    disabled={!selectedFile}
                    size="sm"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Start Scan
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
