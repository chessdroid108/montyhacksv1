import { useState } from "react";
import { Navbar } from "@/components/navigation/navbar";
import { BugReportModal } from "@/components/modals/bug-report-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Book, 
  Search, 
  Shield, 
  Code, 
  Zap, 
  Users, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Download
} from "lucide-react";

export default function Documentation() {
  const [showBugReport, setShowBugReport] = useState(false);
  const [activeSection, setActiveSection] = useState("getting-started");
  const [searchQuery, setSearchQuery] = useState("");

  const sections = [
    { id: "getting-started", title: "Getting Started", icon: Zap },
    { id: "vulnerability-scanning", title: "Vulnerability Scanning", icon: Shield },
    { id: "ide-features", title: "IDE Features", icon: Code },
    { id: "security-scoring", title: "Security Scoring", icon: CheckCircle },
    { id: "team-collaboration", title: "Team Collaboration", icon: Users },
    { id: "api-reference", title: "API Reference", icon: Settings },
    { id: "troubleshooting", title: "Troubleshooting", icon: AlertTriangle },
  ];

  const vulnerabilityTypes = [
    {
      name: "SQL Injection",
      severity: "Critical",
      description: "Occurs when user input is directly concatenated into SQL queries without proper sanitization.",
      example: `// Vulnerable
query = "SELECT * FROM users WHERE id = " + userId;

// Secure
query = "SELECT * FROM users WHERE id = ?";`,
      prevention: "Use parameterized queries or prepared statements"
    },
    {
      name: "Cross-Site Scripting (XSS)",
      severity: "High",
      description: "Allows attackers to inject malicious scripts into web pages viewed by other users.",
      example: `// Vulnerable
innerHTML = userInput;

// Secure
textContent = userInput;`,
      prevention: "Use textContent or properly sanitize HTML content"
    },
    {
      name: "Hardcoded Credentials",
      severity: "High",
      description: "Hardcoded passwords or API keys in source code.",
      example: `// Vulnerable
const apiKey = "sk-1234567890abcdef";

// Secure
const apiKey = process.env.API_KEY;`,
      prevention: "Store credentials in environment variables or secure configuration files"
    }
  ];

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onShowBugReport={() => setShowBugReport(true)} />
      
      <div className="pt-16">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-2">
                <Book className="w-8 h-8" />
                <span>Documentation</span>
              </h1>
              <p className="text-muted-foreground">Learn how to use SecureCode effectively</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search documentation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors flex items-center space-x-2 ${
                          activeSection === section.id ? "bg-muted border-r-2 border-primary" : ""
                        }`}
                      >
                        <section.icon className="w-4 h-4" />
                        <span>{section.title}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="space-y-8">
                {activeSection === "getting-started" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Getting Started with SecureCode</CardTitle>
                        <CardDescription>
                          Welcome to SecureCode, the advanced vulnerability detection platform designed for modern development teams.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Quick Start</h3>
                          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                            <li>Create your account and verify your email</li>
                            <li>Upload your first project or use our web IDE</li>
                            <li>Run your first security scan</li>
                            <li>Review results and implement suggested fixes</li>
                          </ol>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                          <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                              <span><strong>AI-Powered Analysis:</strong> Advanced machine learning algorithms detect complex vulnerabilities</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                              <span><strong>Pattern Matching:</strong> Sophisticated pattern recognition for common security flaws</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                              <span><strong>Real-time Scanning:</strong> Continuous monitoring as you code</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                              <span><strong>Comprehensive Reports:</strong> Detailed analysis with actionable recommendations</span>
                            </li>
                          </ul>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-semibold mb-3">Supported Languages</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {["JavaScript", "TypeScript", "Python", "Java", "C/C++", "C#", "PHP", "Ruby", "Go", "Rust"].map((lang) => (
                              <Badge key={lang} variant="secondary">{lang}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === "vulnerability-scanning" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Vulnerability Scanning</CardTitle>
                        <CardDescription>
                          Our scanning engine uses multiple detection methods to identify security vulnerabilities.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Pattern Matching</h4>
                            <p className="text-sm text-muted-foreground">
                              Advanced regex and syntax analysis to detect common vulnerability patterns.
                            </p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">AI Analysis</h4>
                            <p className="text-sm text-muted-foreground">
                              Machine learning models trained on millions of code samples.
                            </p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Context Analysis</h4>
                            <p className="text-sm text-muted-foreground">
                              Understanding code context to reduce false positives.
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-semibold mb-4">Common Vulnerability Types</h3>
                          <div className="space-y-4">
                            {vulnerabilityTypes.map((vuln, index) => (
                              <Card key={index}>
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{vuln.name}</CardTitle>
                                    <Badge variant={vuln.severity === "Critical" ? "destructive" : "secondary"}>
                                      {vuln.severity}
                                    </Badge>
                                  </div>
                                  <CardDescription>{vuln.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    <div>
                                      <h5 className="font-medium mb-2">Example:</h5>
                                      <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                                        <code>{vuln.example}</code>
                                      </pre>
                                    </div>
                                    <div>
                                      <h5 className="font-medium mb-1">Prevention:</h5>
                                      <p className="text-sm text-muted-foreground">{vuln.prevention}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === "security-scoring" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Scoring Algorithm</CardTitle>
                        <CardDescription>
                          Understanding how SecureCode calculates security scores for your code.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Scoring Factors</h3>
                          <ul className="space-y-2 text-muted-foreground">
                            <li>• Number and severity of vulnerabilities found</li>
                            <li>• Code complexity and attack surface</li>
                            <li>• Industry-specific risk factors</li>
                            <li>• Historical vulnerability patterns</li>
                          </ul>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-semibold mb-3">Score Ranges</h3>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <Badge className="bg-green-500">90-100</Badge>
                              <span>Excellent - Minimal security risks</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary">70-89</Badge>
                              <span>Good - Some minor issues to address</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge className="bg-yellow-500">50-69</Badge>
                              <span>Fair - Multiple vulnerabilities present</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge variant="destructive">0-49</Badge>
                              <span>Poor - Critical security issues found</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === "api-reference" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>API Reference</CardTitle>
                        <CardDescription>
                          Complete API documentation for integrating SecureCode into your workflow.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                          <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>API documentation coming soon</p>
                          <Button variant="outline" className="mt-4">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Request API Access
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Default content for other sections */}
                {!["getting-started", "vulnerability-scanning", "security-scoring", "api-reference"].includes(activeSection) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{sections.find(s => s.id === activeSection)?.title}</CardTitle>
                      <CardDescription>
                        Documentation for this section is being prepared.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Content coming soon</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BugReportModal open={showBugReport} onOpenChange={setShowBugReport} />
    </div>
  );
}
