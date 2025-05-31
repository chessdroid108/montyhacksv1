import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Bug, Send, X } from "lucide-react";

interface BugReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BugReportModal({ open, onOpenChange }: BugReportModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bugType: "",
    severity: "",
    stepsToReproduce: "",
    browser: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.bugType || !formData.severity) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/bug-reports", formData);
      
      toast({
        title: "Bug Report Submitted",
        description: "Thank you for your feedback! We'll investigate this issue.",
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        bugType: "",
        severity: "",
        stepsToReproduce: "",
        browser: ""
      });
      
      onOpenChange(false);
    } catch (error: any) {
      if (isUnauthorizedError(error)) {
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
        title: "Submission Failed",
        description: "Unable to submit bug report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bug className="w-5 h-5" />
            <span>Report a Bug</span>
          </DialogTitle>
          <DialogDescription>
            Help us improve SecureCode by reporting any issues you encounter. 
            Your feedback is valuable and helps us provide a better experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bug Type and Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bugType">Bug Type *</Label>
              <Select value={formData.bugType} onValueChange={(value) => updateFormData("bugType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bug type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ui-ux">UI/UX Issue</SelectItem>
                  <SelectItem value="scanner-error">Scanner Error</SelectItem>
                  <SelectItem value="performance">Performance Problem</SelectItem>
                  <SelectItem value="authentication">Authentication Issue</SelectItem>
                  <SelectItem value="data-corruption">Data Corruption</SelectItem>
                  <SelectItem value="api-error">API Error</SelectItem>
                  <SelectItem value="security">Security Concern</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Severity *</Label>
              <RadioGroup 
                value={formData.severity} 
                onValueChange={(value) => updateFormData("severity", value)}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="critical" id="critical" />
                  <Label htmlFor="critical">Critical</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Bug Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              maxLength={255}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what happened, what you expected to happen, and any error messages you saw..."
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Steps to Reproduce */}
          <div className="space-y-2">
            <Label htmlFor="steps">Steps to Reproduce</Label>
            <Textarea
              id="steps"
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
              value={formData.stepsToReproduce}
              onChange={(e) => updateFormData("stepsToReproduce", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Browser/Environment */}
          <div className="space-y-2">
            <Label htmlFor="browser">Browser/Environment</Label>
            <Select value={formData.browser} onValueChange={(value) => updateFormData("browser", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your browser" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chrome">Google Chrome</SelectItem>
                <SelectItem value="firefox">Mozilla Firefox</SelectItem>
                <SelectItem value="safari">Safari</SelectItem>
                <SelectItem value="edge">Microsoft Edge</SelectItem>
                <SelectItem value="opera">Opera</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.description || !formData.bugType || !formData.severity}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "Submitting..." : "Submit Bug Report"}
            </Button>
          </div>
        </form>

        {/* Additional Information */}
        <div className="border-t pt-4 text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>Privacy Note:</strong> Your bug report will be reviewed by our development team. 
            Please don't include sensitive information like passwords or API keys.
          </p>
          <p>
            <strong>Response Time:</strong> We typically respond to bug reports within 24-48 hours. 
            Critical security issues are prioritized and addressed immediately.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
