import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { motion } from "framer-motion";
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  FileCode, 
  Plus, 
  Search, 
  MoreHorizontal,
  AlertTriangle,
  Play,
  Trash2,
  Edit3,
  Copy
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface FileTreeProps {
  onFileSelect: (fileId: number) => void;
  onFileScan: (fileId: number) => void;
  onProjectScan: (projectId: number) => void;
  isScanning: boolean;
}

interface FileNode {
  id: number;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  projectId?: number;
  hasVulnerabilities?: boolean;
}

export function FileTree({ onFileSelect, onFileScan, onProjectScan, isScanning }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Fetch files for selected project
  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ["/api/projects", selectedProject, "files"],
    queryFn: () => selectedProject ? fetch(`/api/projects/${selectedProject}/files`).then(r => r.json()) : [],
    enabled: !!selectedProject,
  });

  // Create file mutation
  const createFileMutation = useMutation({
    mutationFn: async (fileData: { name: string; path: string }) => {
      if (!selectedProject) throw new Error("No project selected");
      const response = await apiRequest("POST", `/api/projects/${selectedProject}/files`, {
        ...fileData,
        content: "",
        language: getLanguageFromExtension(fileData.name),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File Created",
        description: "New file has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "files"] });
      setIsCreatingFile(false);
      setNewFileName("");
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileSelect = (fileId: number) => {
    setSelectedFile(fileId);
    onFileSelect(fileId);
  };

  const handleCreateFile = () => {
    if (newFileName && selectedProject) {
      createFileMutation.mutate({
        name: newFileName,
        path: newFileName,
      });
    }
  };

  const getFileIcon = (fileName: string, isFolder: boolean = false) => {
    if (isFolder) {
      return expandedFolders.has(fileName) ? FolderOpen : Folder;
    }

    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, any> = {
      'js': FileCode,
      'ts': FileCode,
      'jsx': FileCode,
      'tsx': FileCode,
      'py': FileCode,
      'java': FileCode,
      'php': FileCode,
      'cs': FileCode,
      'cpp': FileCode,
      'c': FileCode,
      'go': FileCode,
      'rs': FileCode,
      'html': FileCode,
      'css': FileCode,
      'scss': FileCode,
      'less': FileCode,
      'json': FileText,
      'xml': FileText,
      'yaml': FileText,
      'yml': FileText,
      'md': FileText,
      'txt': FileText,
    };

    return iconMap[extension || ''] || FileText;
  };

  const getLanguageFromExtension = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'php': 'php',
      'cs': 'csharp',
      'cpp': 'cpp',
      'c': 'cpp',
      'go': 'go',
      'rs': 'rust',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'sql': 'sql',
    };
    return langMap[extension || ''] || 'text';
  };

  const buildFileTree = (files: any[]): FileNode[] => {
    const tree: FileNode[] = [];
    const folderMap = new Map<string, FileNode>();

    // Sort files by path
    const sortedFiles = files.sort((a, b) => a.path.localeCompare(b.path));

    sortedFiles.forEach(file => {
      const pathParts = file.path.split('/');
      let currentPath = '';

      // Create folder structure
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i];
        const fullPath = currentPath ? `${currentPath}/${folderName}` : folderName;

        if (!folderMap.has(fullPath)) {
          const folderNode: FileNode = {
            id: -Math.random(), // Temporary ID for folders
            name: folderName,
            type: 'folder',
            path: fullPath,
            children: [],
          };

          folderMap.set(fullPath, folderNode);

          if (currentPath) {
            const parentFolder = folderMap.get(currentPath);
            if (parentFolder) {
              parentFolder.children!.push(folderNode);
            }
          } else {
            tree.push(folderNode);
          }
        }

        currentPath = fullPath;
      }

      // Add file
      const fileNode: FileNode = {
        id: file.id,
        name: pathParts[pathParts.length - 1],
        type: 'file',
        path: file.path,
        projectId: file.projectId,
        hasVulnerabilities: false, // This would come from vulnerability data
      };

      if (currentPath) {
        const parentFolder = folderMap.get(currentPath);
        if (parentFolder) {
          parentFolder.children!.push(fileNode);
        }
      } else {
        tree.push(fileNode);
      }
    });

    return tree;
  };

  const renderFileNode = (node: FileNode, depth: number = 0) => {
    const Icon = getFileIcon(node.name, node.type === 'folder');
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.id;

    return (
      <motion.div
        key={node.path}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.05 }}
      >
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={`file-tree-item ${isSelected ? 'selected' : ''}`}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
              onClick={() => {
                if (node.type === 'folder') {
                  toggleFolder(node.path);
                } else {
                  handleFileSelect(node.id);
                }
              }}
            >
              <Icon 
                className={`w-4 h-4 ${node.type === 'folder' ? 'file-tree-folder' : 'file-tree-file'}`} 
              />
              <span className="flex-1 text-sm">{node.name}</span>
              {node.hasVulnerabilities && (
                <AlertTriangle className="w-3 h-3 text-orange-500" />
              )}
              {node.type === 'file' && (
                <Badge variant="outline" className="text-xs ml-auto">
                  {getLanguageFromExtension(node.name).toUpperCase()}
                </Badge>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {node.type === 'file' ? (
              <>
                <ContextMenuItem onClick={() => onFileScan(node.id)}>
                  <Play className="w-4 h-4 mr-2" />
                  Scan File
                </ContextMenuItem>
                <ContextMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Path
                </ContextMenuItem>
                <ContextMenuItem>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Rename
                </ContextMenuItem>
                <ContextMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </ContextMenuItem>
              </>
            ) : (
              <>
                <ContextMenuItem>
                  <Plus className="w-4 h-4 mr-2" />
                  New File
                </ContextMenuItem>
                <ContextMenuItem>
                  <Folder className="w-4 h-4 mr-2" />
                  New Folder
                </ContextMenuItem>
                <ContextMenuItem>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Rename
                </ContextMenuItem>
                <ContextMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>

        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileNode(child, depth + 1))}
          </div>
        )}
      </motion.div>
    );
  };

  const filteredFiles = files.filter((file: any) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fileTree = buildFileTree(filteredFiles);

  return (
    <div className="w-80 bg-muted/30 border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Explorer</h3>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreatingFile(true)}
              disabled={!selectedProject}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectedProject && onProjectScan(selectedProject)}
              disabled={!selectedProject || isScanning}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Project Selector */}
        <div className="mb-3">
          <select
            className="w-full text-sm bg-background border border-border rounded px-2 py-1"
            value={selectedProject || ""}
            onChange={(e) => setSelectedProject(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Select Project</option>
            {projects.map((project: any) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 text-xs h-8"
          />
        </div>

        {/* New File Input */}
        {isCreatingFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 space-y-2"
          >
            <Input
              placeholder="Enter file name..."
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="text-xs h-8"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFile();
                } else if (e.key === 'Escape') {
                  setIsCreatingFile(false);
                  setNewFileName("");
                }
              }}
              autoFocus
            />
            <div className="flex space-x-1">
              <Button
                size="sm"
                onClick={handleCreateFile}
                disabled={!newFileName || createFileMutation.isPending}
                className="text-xs h-6"
              >
                Create
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreatingFile(false);
                  setNewFileName("");
                }}
                className="text-xs h-6"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {projectsLoading || filesLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground">Loading files...</p>
          </div>
        ) : !selectedProject ? (
          <div className="p-4 text-center">
            <Folder className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Select a project to view files</p>
          </div>
        ) : fileTree.length === 0 ? (
          <div className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground mb-2">No files found</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreatingFile(true)}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Create File
            </Button>
          </div>
        ) : (
          <div className="py-2">
            {fileTree.map(node => renderFileNode(node))}
          </div>
        )}
      </div>

      {/* Footer */}
      {selectedProject && (
        <div className="p-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onProjectScan(selectedProject)}
            disabled={isScanning}
            className="w-full text-xs"
          >
            {isScanning ? (
              <>
                <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full mr-2"></div>
                Scanning Project...
              </>
            ) : (
              <>
                <Search className="w-3 h-3 mr-2" />
                Scan Entire Project
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
