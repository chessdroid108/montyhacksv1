import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bug, AlertCircle, CheckCircle } from "lucide-react";

const bugReportSchema = z.object({
  type: z.string().min(1, "Please select a bug type"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  severity: z.string().min(1, "Please select a severity level"),
  stepsToReproduce: z.string().optional(),
});

type BugReportFormData = z.infer<typeof bugReportSchema>;

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const { toast } = useToast();
  
  const form = useForm<BugReportFormData>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      type: "",
      title: "",
      description: "",
      severity: "",
      stepsToReproduce: "",
    },
  });

  const submitBugReport = useMutation({
    mutationFn: async (data: BugReportFormData) => {
      const response = await apiRequest("POST", "/api/bug-reports", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bug Report Submitted",
        description: "Thank you for helping us improve SecureCode!",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit bug report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const onSubmit = (data: BugReportFormData) => {
    submitBugReport.mutate(data);
  };

  const bugTypes = [
    { value: "ui", label: "UI/UX Issue" },
    { value: "scanner", label: "Scanner Error" },
    { value: "performance", label: "Performance Problem" },
    { value: "auth", label: "Authentication Issue" },
    { value: "data", label: "Data Issue" },
    { value: "other", label: "Other" },
  ];

  const severityLevels = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <Bug className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Report a Bug</DialogTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Help us improve by reporting any issues you encounter
              </p>
            </div>
          </div>
        </DialogHeader>

        {submitBugReport.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {submitBugReport.error.message || "Failed to submit bug report"}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bug Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bug type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bugTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {severityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bug Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Brief description of the issue" 
                      {...field}
                      disabled={submitBugReport.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed description of what happened and what you expected to happen"
                      rows={4}
                      {...field}
                      disabled={submitBugReport.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stepsToReproduce"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Steps to Reproduce (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                      rows={3}
                      {...field}
                      disabled={submitBugReport.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitBugReport.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitBugReport.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {submitBugReport.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <>
                    <Bug className="w-4 h-4 mr-2" />
                    Submit Bug Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
