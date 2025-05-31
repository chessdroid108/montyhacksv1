import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import { z } from "zod";
import { insertProjectSchema, insertBugReportSchema, insertVulnerabilityScanSchema, insertAnalyticsEventSchema } from "@shared/schema";
import { scanCode, scanFile, scanProject } from "./vulnerabilityScanner";
import jsPDF from "jspdf";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get('/api/users/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({ ...req.body, userId });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Vulnerability scanning routes
  app.post('/api/scan/code', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code, language, fileName } = req.body;
      
      if (!code || !language) {
        return res.status(400).json({ message: "Code and language are required" });
      }

      const results = await scanCode(code, language);
      
      // Save scan results
      const scanData = insertVulnerabilityScanSchema.parse({
        userId,
        fileName: fileName || "untitled",
        vulnerabilities: results.vulnerabilities,
        securityScore: results.securityScore,
        scanType: "code"
      });
      
      await storage.createVulnerabilityScan(scanData);
      
      res.json(results);
    } catch (error) {
      console.error("Error scanning code:", error);
      res.status(500).json({ message: "Failed to scan code" });
    }
  });

  app.post('/api/scan/file', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { filePath, content } = req.body;
      
      if (!filePath || !content) {
        return res.status(400).json({ message: "File path and content are required" });
      }

      const results = await scanFile(filePath, content);
      
      const scanData = insertVulnerabilityScanSchema.parse({
        userId,
        fileName: filePath,
        vulnerabilities: results.vulnerabilities,
        securityScore: results.securityScore,
        scanType: "file"
      });
      
      await storage.createVulnerabilityScan(scanData);
      
      res.json(results);
    } catch (error) {
      console.error("Error scanning file:", error);
      res.status(500).json({ message: "Failed to scan file" });
    }
  });

  app.post('/api/scan/project', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { projectId } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }

      const project = await storage.getProject(projectId, userId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const results = await scanProject(project);
      
      const scanData = insertVulnerabilityScanSchema.parse({
        userId,
        projectId,
        vulnerabilities: results.vulnerabilities,
        securityScore: results.securityScore,
        scanType: "project"
      });
      
      await storage.createVulnerabilityScan(scanData);
      
      res.json(results);
    } catch (error) {
      console.error("Error scanning project:", error);
      res.status(500).json({ message: "Failed to scan project" });
    }
  });

  // Vulnerability scan history
  app.get('/api/scans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scans = await storage.getUserVulnerabilityScans(userId);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching scans:", error);
      res.status(500).json({ message: "Failed to fetch scans" });
    }
  });

  // Bug reports
  app.post('/api/bug-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bugReportData = insertBugReportSchema.parse({ ...req.body, userId });
      const bugReport = await storage.createBugReport(bugReportData);
      res.json(bugReport);
    } catch (error) {
      console.error("Error creating bug report:", error);
      res.status(500).json({ message: "Failed to create bug report" });
    }
  });

  // PDF Export
  app.post('/api/export/pdf', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { reportType, data } = req.body;
      
      const pdf = new jsPDF();
      pdf.setFontSize(20);
      pdf.text('SecureCode Security Report', 20, 30);
      
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);
      pdf.text(`Report Type: ${reportType}`, 20, 60);
      
      if (data && data.vulnerabilities) {
        pdf.text('Vulnerabilities Found:', 20, 80);
        let yPos = 90;
        data.vulnerabilities.forEach((vuln: any, index: number) => {
          pdf.text(`${index + 1}. ${vuln.type} - ${vuln.severity}`, 25, yPos);
          yPos += 10;
        });
      }
      
      const pdfBuffer = pdf.output('arraybuffer');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="security-report.pdf"');
      res.send(Buffer.from(pdfBuffer));
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Analytics events
  app.post('/api/analytics/event', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertAnalyticsEventSchema.parse({ ...req.body, userId });
      await storage.createAnalyticsEvent(eventData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating analytics event:", error);
      res.status(500).json({ message: "Failed to create analytics event" });
    }
  });

  // Admin routes (protected by admin check)
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Failed to verify admin status" });
    }
  };

  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/errors', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const errors = await storage.getSystemErrors();
      res.json(errors);
    } catch (error) {
      console.error("Error fetching system errors:", error);
      res.status(500).json({ message: "Failed to fetch system errors" });
    }
  });

  app.get('/api/admin/analytics', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { startDate, endDate, event } = req.query;
      const analytics = await storage.getAnalytics({
        startDate: startDate as string,
        endDate: endDate as string,
        event: event as string
      });
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/admin/vulnerabilities/common', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const commonVulns = await storage.getCommonVulnerabilities();
      res.json(commonVulns);
    } catch (error) {
      console.error("Error fetching common vulnerabilities:", error);
      res.status(500).json({ message: "Failed to fetch common vulnerabilities" });
    }
  });

  // Error logging middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Server error:", err);
    
    // Log error to database for admin monitoring
    if (req.user?.claims?.sub) {
      storage.createSystemError({
        type: err.name || "UnknownError",
        message: err.message,
        stack: err.stack,
        userId: req.user.claims.sub,
        metadata: { url: req.url, method: req.method }
      }).catch(console.error);
    }

    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  const httpServer = createServer(app);
  return httpServer;
}
