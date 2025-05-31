import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
}

const mockFileTree: FileNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      {
        name: "app.js",
        type: "file",
        content: `const express = require('express');
const app = express();

// Vulnerable SQL query
app.post('/login', (req, res) => {
  const query = 'SELECT * FROM users WHERE email = "' + req.body.email + '"';
  db.query(query, (err, results) => {
    res.json(results);
  });
});

app.listen(3000);`
      },
      {
        name: "auth.js",
        type: "file",
        content: `// Authentication module with vulnerabilities
function authenticateUser(password) {
  // VULNERABILITY: Hardcoded password
  if (password === 'admin123') {
    return true;
  }
  return false;
}

// VULNERABILITY: No password hashing
function createUser(userData) {
  const user = {
    ...userData,
    password: userData.password // Plain text password
  };
  return saveUser(user);
}`
      },
      {
        name: "utils.js",
        type: "file",
        content: `// Utility functions
function sanitizeInput(input) {
  // Basic sanitization
  return input.replace(/[<>]/g, '');
}

function generateToken() {
  // VULNERABILITY: Weak random generation
  return Math.random().toString(36);
}`
      }
    ]
  },
  {
    name: "package.json",
    type: "file",
    content: `{
  "name": "sample-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",
    "mysql": "^2.18.0"
  }
}`
  }
];

export default function IDE() {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(mockFileTree[0].children?.[1] || null);
  const [code, setCode] = useState(selectedFile?.content || "");
  const [scanResults, setScanResults] = useState<any>(null);
  const { toast } = useToast();

  const scanMutation = useMutation({
    mutationFn: async (codeToScan: string) => {
      const response = await fetch("/api/scan/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: codeToScan,
          language: "javascript",
          fileName: selectedFile?.name || "untitled.js"
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to scan code");
      }
      
      return response.json();
    },
    onSuccess: (results) => {
      setScanResults(results);
      toast({
        title: "Scan completed",
        description: `Found ${results.vulnerabilities.length} vulnerabilities`,
      });
    },
    onError: () => {
      toast({
        title: "Scan failed",
        description: "Unable to scan code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node, index) => (
      <div key={index} className={`ml-${depth * 4}`}>
        <div
          className={`flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer ${
            selectedFile?.name === node.name ? "bg-blue-50 dark:bg-blue-900/20" : ""
          }`}
          onClick={() => {
            if (node.type === "file") {
              setSelectedFile(node);
              setCode(node.content || "");
              setScanResults(null);
            }
          }}
        >
          <i className={`fas ${node.type === "folder" ? "fa-folder text-yellow-500" : "fa-file-code text-blue-500"}`}></i>
          <span className="text-sm">{node.name}</span>
          {node.type === "file" && node.name === "auth.js" && (
            <i className="fas fa-exclamation-circle text-red-500 text-xs" title="Vulnerabilities detected"></i>
          )}
        </div>
        {node.children && renderFileTree(node.children, depth + 1)}
      </div>
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex">
      {/* File Explorer */}
      <Card className="w-64 rounded-none border-r">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Project Explorer</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="space-y-1">
            {renderFileTree(mockFileTree)}
          </div>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">{selectedFile?.name || "No file selected"}</span>
            {scanResults && (
              <Badge variant={scanResults.securityScore > 7 ? "default" : scanResults.securityScore > 4 ? "secondary" : "destructive"}>
                Score: {scanResults.securityScore}/10
              </Badge>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={() => scanMutation.mutate(code)}
            disabled={scanMutation.isPending || !code.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <i className="fas fa-search mr-2"></i>
            {scanMutation.isPending ? "Scanning..." : "Scan Code"}
          </Button>
        </div>

        <div className="flex-1 flex">
          {/* Code Editor */}
          <div className="flex-1 bg-gray-900 text-gray-100">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-gray-900 text-gray-100 font-mono text-sm border-none resize-none focus:ring-0"
              placeholder="Select a file to edit..."
            />
          </div>

          {/* Vulnerability Panel */}
          <Card className="w-80 rounded-none border-l">
            <CardHeader>
              <CardTitle className="text-sm">Security Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {scanResults ? (
                <>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${scanResults.securityScore > 7 ? "text-green-600" : scanResults.securityScore > 4 ? "text-yellow-600" : "text-red-600"}`}>
                      {scanResults.securityScore}/10
                    </div>
                    <div className="text-sm text-muted-foreground">Security Score</div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Vulnerabilities ({scanResults.vulnerabilities.length})</h4>
                    {scanResults.vulnerabilities.length > 0 ? (
                      scanResults.vulnerabilities.map((vuln: any, index: number) => (
                        <div key={index} className={`p-3 rounded-lg border-l-4 border-l-${getSeverityColor(vuln.severity).replace('bg-', '')}`}>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {vuln.severity.toUpperCase()}
                            </Badge>
                            {vuln.line && (
                              <span className="text-xs text-muted-foreground">Line {vuln.line}</span>
                            )}
                          </div>
                          <h5 className="font-medium text-sm">{vuln.type}</h5>
                          <p className="text-xs text-muted-foreground mt-1">{vuln.message}</p>
                          {vuln.suggestion && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                              <strong>Fix:</strong> {vuln.suggestion}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        <i className="fas fa-shield-check text-green-500 text-2xl mb-2"></i>
                        <div>No vulnerabilities detected!</div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <i className="fas fa-search text-gray-400 text-2xl mb-2"></i>
                  <div>Run a scan to see results</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
