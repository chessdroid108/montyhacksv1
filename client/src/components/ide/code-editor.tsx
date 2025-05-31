import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  Play, 
  Save, 
  Download, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Code,
  FileText
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface CodeEditorProps {
  selectedFileId: number | null;
  onQuickScan: (code: string, language: string) => void;
  isScanning: boolean;
}

// Monaco Editor will be loaded dynamically
let monaco: any = null;

export function CodeEditor({ selectedFileId, onQuickScan, isScanning }: CodeEditorProps) {
  const [editor, setEditor] = useState<any>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Load Monaco Editor
  useEffect(() => {
    const loadMonaco = async () => {
      if (!monaco) {
        // Load Monaco Editor from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js';
        document.body.appendChild(script);
        
        script.onload = () => {
          (window as any).require.config({
            paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }
          });
          (window as any).require(['vs/editor/editor.main'], () => {
            monaco = (window as any).monaco;
            setIsEditorReady(true);
          });
        };
      } else {
        setIsEditorReady(true);
      }
    };

    loadMonaco();
  }, []);

  // Initialize editor when Monaco is ready
  useEffect(() => {
    if (isEditorReady && editorRef.current && !editor) {
      const editorInstance = monaco.editor.create(editorRef.current, {
        value: code,
        language: language,
        theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs',
        automaticLayout: true,
        fontSize: 14,
        lineNumbers: 'on',
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        folding: true,
        lineNumbersMinChars: 4,
        glyphMargin: true,
        contextmenu: true,
        mouseWheelZoom: true,
      });

      editorInstance.onDidChangeModelContent(() => {
        setCode(editorInstance.getValue());
      });

      setEditor(editorInstance);

      return () => {
        editorInstance.dispose();
      };
    }
  }, [isEditorReady, language]);

  // Update editor theme when dark mode changes
  useEffect(() => {
    if (editor) {
      const observer = new MutationObserver(() => {
        const isDark = document.documentElement.classList.contains('dark');
        monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      return () => observer.disconnect();
    }
  }, [editor]);

  // Fetch file content
  const { data: fileData, isLoading: fileLoading } = useQuery({
    queryKey: ["/api/files", selectedFileId],
    queryFn: () => selectedFileId ? fetch(`/api/files/${selectedFileId}`).then(r => r.json()) : null,
    enabled: !!selectedFileId,
  });

  // Update editor content when file changes
  useEffect(() => {
    if (fileData && editor) {
      const content = fileData.content || "";
      const lang = fileData.language || "javascript";
      
      setCode(content);
      setLanguage(lang);
      
      editor.setValue(content);
      monaco.editor.setModelLanguage(editor.getModel(), lang);
    }
  }, [fileData, editor]);

  // Save file mutation
  const saveFileMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFileId) throw new Error("No file selected");
      const response = await apiRequest("PUT", `/api/files/${selectedFileId}`, {
        content: code,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File Saved",
        description: "Your changes have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (selectedFileId && code !== fileData?.content) {
      saveFileMutation.mutate();
    }
  };

  const handleQuickScan = () => {
    onQuickScan(code, language);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (editor) {
      monaco.editor.setModelLanguage(editor.getModel(), newLanguage);
    }
  };

  const handleDownload = () => {
    if (!code) return;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language}`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'php', label: 'PHP' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'sql', label: 'SQL' },
  ];

  if (!isEditorReady) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading code editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Editor Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <span className="font-medium">
                {fileData?.name || 'Untitled'}
              </span>
              {fileData && code !== fileData.content && (
                <Badge variant="outline" className="text-xs">
                  Modified
                </Badge>
              )}
            </div>
            
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickScan}
              disabled={!code || isScanning}
              className={isScanning ? "btn-scan scanning" : "btn-scan"}
            >
              {isScanning ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Scan
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={!selectedFileId || saveFileMutation.isPending || code === fileData?.content}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveFileMutation.isPending ? "Saving..." : "Save"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!code}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative">
        {selectedFileId ? (
          <div ref={editorRef} className="absolute inset-0 custom-scrollbar" />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md"
            >
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No File Selected</h3>
              <p className="text-muted-foreground mb-6">
                Select a file from the file tree to start editing, or create a new file to begin coding.
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Code className="w-4 h-4 mr-2" />
                  Create New File
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onQuickScan("// Your code here\nconsole.log('Hello, World!');", "javascript")}
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Try Quick Scan
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-border px-4 py-2 bg-muted/50">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>Lines: {code.split('\n').length}</span>
            <span>Characters: {code.length}</span>
            <span>Language: {languageOptions.find(l => l.value === language)?.label}</span>
          </div>
          <div className="flex items-center space-x-4">
            {fileLoading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full"></div>
                <span>Loading...</span>
              </div>
            )}
            {selectedFileId && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Ready</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
