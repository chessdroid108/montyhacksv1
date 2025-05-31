import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface BugReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BugReportData {
  type: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  severity: string;
  browser?: string;
}

const BUG_TYPES = [
  { value: "ui-ux", label: "UI/UX Issue" },
  { value: "scanner", label: "Scanner Error" },
  { value: "performance", label: "Performance Problem" },
  { value: "authentication", label: "Authentication Issue" },
  { value: "data", label: "Data Issue" },
  { value: "api", label: "API Error" },
  { value: "other", label: "Other" }
];

const SEVERITY_LEVELS = [
  { value: "low", label: "Low", description: "Minor issue, doesn't affect core functionality" },
  { value: "medium", label: "Medium", description: "Moderate issue, some features affected" },
  { value: "high", label: "High", description: "Major issue, significant functionality impacted" },
  { value: "critical", label: "Critical", description: "System down or data loss" }
];

const BROWSERS = [
  { value: "chrome", label: "Google Chrome" },
  { value: "firefox", label: "Mozilla Firefox" },
  { value: "safari", label: "Safari" },
  { value: "edge", label: "Microsoft Edge" },
  { value: "opera", label: "Opera" },
  { value: "other", label: "Other" }
];

export default function BugReportModal({ open, onOpenChange }: BugReportModalProps) {
  const [formData, setFormData] = useState<BugReportData>({
    type: "",
    title: "",
    description: "",
    stepsToReproduce: "",
    severity: "",
    browser: ""
  });
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async (data: BugReportData) => {
      const response = await fetch("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bug report submitted",
        description: "Thank you for helping us improve SecureCode! We'll review your report shortly.",
      });
      onOpenChange(false);
      setFormData({
        type: "",
        title: "",
        description: "",
        stepsToReproduce: "",
        severity: "",
        browser: ""
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
        title: "Failed to submit bug report",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.type || !formData.title || !formData.description || !formData.severity) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate(formData);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600 border-red-500";
      case "high": return "text-orange-600 border-orange-500";
      case "medium": return "text-yellow-600 border-yellow-500";
      case "low": return "text-blue-600 border-blue-500";
      default: return "text-gray-600 border-gray-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <i className="fas fa-bug text-red-600 mr-2"></i>
            Report a Bug
          </DialogTitle>
          <DialogDescription>
            Help us improve SecureCode by reporting any issues you encounter. Your feedback is valuable to us.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Bug Type and Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Bug Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bug type" />
                </SelectTrigger>
                <SelectContent>
                  {BUG_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="browser">Browser</Label>
              <Select 
                value={formData.browser} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, browser: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select browser" />
                </SelectTrigger>
                <SelectContent>
                  {BROWSERS.map((browser) => (
                    <SelectItem key={browser.value} value={browser.value}>
                      {browser.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Bug Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of what happened, what you expected to happen, and any error messages you saw"
              rows={4}
              required
            />
          </div>

          {/* Steps to Reproduce */}
          <div>
            <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>
            <Textarea
              id="stepsToReproduce"
              value={formData.stepsToReproduce}
              onChange={(e) => setFormData(prev => ({ ...prev, stepsToReproduce: e.target.value }))}
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Help us reproduce the issue by providing clear steps
            </p>
          </div>

          {/* Severity */}
          <div>
            <Label>Severity *</Label>
            <RadioGroup 
              value={formData.severity} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
              className="mt-2"
            >
              {SEVERITY_LEVELS.map((level) => (
                <div key={level.value} className="flex items-start space-x-3">
                  <RadioGroupItem value={level.value} id={level.value} className="mt-1" />
                  <div className="flex-1">
                    <Label 
                      htmlFor={level.value} 
                      className={`font-medium cursor-pointer ${getSeverityColor(level.value)}`}
                    >
                      {level.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              <i className="fas fa-info-circle mr-2"></i>
              Additional Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Include screenshots if the issue is visual</li>
              <li>• Mention your operating system if relevant</li>
              <li>• Provide console error messages if available</li>
              <li>• Be as specific as possible about the conditions when the bug occurs</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={submitMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitMutation.isPending}
              className="bg-red-600 hover:bg-red-700 min-w-32"
            >
              {submitMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
