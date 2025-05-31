import { GoogleGenerativeAI } from "@google/generative-ai";

interface Vulnerability {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  line?: number;
  column?: number;
  message: string;
  suggestion?: string;
  confidence: number;
}

interface SecurityAnalysis {
  vulnerabilities: Vulnerability[];
  securityScore: number;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
}

export async function analyzeCodeSecurity(code: string, language: string): Promise<SecurityAnalysis | null> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not provided, skipping AI analysis");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this ${language} code for security vulnerabilities. Provide detailed analysis in JSON format with the following structure:

{
  "vulnerabilities": [
    {
      "type": "vulnerability_type",
      "severity": "low|medium|high|critical",
      "line": line_number,
      "message": "description",
      "suggestion": "how_to_fix",
      "confidence": 0.0-1.0
    }
  ],
  "securityScore": 0-100,
  "recommendations": ["general_recommendations"]
}

Focus on common security issues like:
- SQL injection vulnerabilities
- Cross-site scripting (XSS)
- Command injection
- Path traversal
- Hardcoded secrets/passwords
- Weak cryptography
- Input validation issues
- Authentication/authorization flaws
- Information disclosure

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Respond only with valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const analysis = JSON.parse(text);
      
      // Validate and normalize the response
      const vulnerabilities: Vulnerability[] = Array.isArray(analysis.vulnerabilities) 
        ? analysis.vulnerabilities.map((vuln: any) => ({
            type: vuln.type || "Unknown",
            severity: ["low", "medium", "high", "critical"].includes(vuln.severity) 
              ? vuln.severity 
              : "medium",
            line: vuln.line || 1,
            column: vuln.column,
            message: vuln.message || "Security vulnerability detected",
            suggestion: vuln.suggestion || "Review and fix this issue",
            confidence: Math.max(0, Math.min(1, vuln.confidence || 0.8))
          }))
        : [];

      const securityScore = Math.max(0, Math.min(100, analysis.securityScore || calculateFallbackScore(vulnerabilities)));
      
      const summary = {
        critical: vulnerabilities.filter(v => v.severity === "critical").length,
        high: vulnerabilities.filter(v => v.severity === "high").length,
        medium: vulnerabilities.filter(v => v.severity === "medium").length,
        low: vulnerabilities.filter(v => v.severity === "low").length
      };

      const recommendations = Array.isArray(analysis.recommendations) 
        ? analysis.recommendations 
        : generateDefaultRecommendations(vulnerabilities);

      return {
        vulnerabilities,
        securityScore,
        summary,
        recommendations
      };

    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      return null;
    }

  } catch (error) {
    console.error("Gemini API error:", error);
    return null;
  }
}

export async function generateSecurityReport(vulnerabilities: Vulnerability[], codeMetrics: any): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "Security report generation requires Gemini API key.";
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate a comprehensive security report based on the following vulnerability analysis:

Vulnerabilities found: ${vulnerabilities.length}
Critical: ${vulnerabilities.filter(v => v.severity === "critical").length}
High: ${vulnerabilities.filter(v => v.severity === "high").length}
Medium: ${vulnerabilities.filter(v => v.severity === "medium").length}
Low: ${vulnerabilities.filter(v => v.severity === "low").length}

Vulnerability details:
${vulnerabilities.map(v => `- ${v.type}: ${v.message} (${v.severity})`).join('\n')}

Please provide:
1. Executive summary
2. Risk assessment
3. Prioritized remediation steps
4. Best practices recommendations

Keep the report professional and actionable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Error generating security report:", error);
    return "Failed to generate security report.";
  }
}

function calculateFallbackScore(vulnerabilities: Vulnerability[]): number {
  const weights = { critical: 25, high: 15, medium: 8, low: 3 };
  const penalty = vulnerabilities.reduce((total, vuln) => total + weights[vuln.severity], 0);
  return Math.max(0, 100 - penalty);
}

function generateDefaultRecommendations(vulnerabilities: Vulnerability[]): string[] {
  const recommendations = [
    "Implement regular security code reviews",
    "Use automated security scanning tools",
    "Follow secure coding best practices",
    "Keep dependencies up to date"
  ];

  if (vulnerabilities.some(v => v.type.toLowerCase().includes("sql"))) {
    recommendations.push("Use parameterized queries to prevent SQL injection");
  }

  if (vulnerabilities.some(v => v.type.toLowerCase().includes("xss"))) {
    recommendations.push("Sanitize and validate all user inputs");
  }

  if (vulnerabilities.some(v => v.type.toLowerCase().includes("secret"))) {
    recommendations.push("Use environment variables for sensitive data");
  }

  return recommendations;
}