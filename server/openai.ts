import OpenAI from "openai";

/*
Follow these instructions when using this blueprint:
1. Note that the newest OpenAI model is "gpt-4o", not "gpt-4". gpt-4o was released after your knowledge cutoff. Always prefer using gpt-4o as it is the latest model. When copying code from this blueprint, ensure you also mention this information verbatim as a comment so that you don't revert it to "gpt-4": `// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user`
2. Use the response_format: { type: "json_object" } option
3. Request output in JSON format in the prompt
*/

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

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
  try {
    const prompt = `Analyze the following ${language} code for security vulnerabilities. Provide a comprehensive security analysis in JSON format with the following structure:

{
  "vulnerabilities": [
    {
      "type": "string (e.g., 'SQL Injection', 'XSS', 'Hardcoded Secrets')",
      "severity": "low|medium|high|critical",
      "line": number (optional, line number where vulnerability is found),
      "column": number (optional, column number),
      "message": "string (description of the vulnerability)",
      "suggestion": "string (how to fix the vulnerability)",
      "confidence": number (0.0 to 1.0, confidence in detection)
    }
  ],
  "securityScore": number (0.0 to 10.0, overall security score),
  "summary": {
    "critical": number,
    "high": number,
    "medium": number,
    "low": number
  },
  "recommendations": ["array of general security recommendations"]
}

Look for common vulnerabilities including:
- SQL Injection
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Hardcoded secrets/credentials
- Path traversal
- Command injection
- Insecure random number generation
- Weak cryptographic algorithms
- Missing input validation
- Insecure CORS configuration
- Information disclosure
- Authentication bypass
- Authorization flaws
- Buffer overflows (for C/C++)
- Deserialization vulnerabilities

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Respond with valid JSON only.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert security analyst specializing in code vulnerability detection. Analyze code thoroughly and provide detailed security assessments in the exact JSON format requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Low temperature for consistent, focused analysis
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const analysis = JSON.parse(content) as SecurityAnalysis;

    // Validate and sanitize the response
    if (!analysis.vulnerabilities || !Array.isArray(analysis.vulnerabilities)) {
      analysis.vulnerabilities = [];
    }

    // Ensure security score is within valid range
    if (typeof analysis.securityScore !== 'number' || analysis.securityScore < 0 || analysis.securityScore > 10) {
      analysis.securityScore = calculateFallbackScore(analysis.vulnerabilities);
    }

    // Ensure summary exists and is valid
    if (!analysis.summary) {
      analysis.summary = {
        critical: analysis.vulnerabilities.filter(v => v.severity === 'critical').length,
        high: analysis.vulnerabilities.filter(v => v.severity === 'high').length,
        medium: analysis.vulnerabilities.filter(v => v.severity === 'medium').length,
        low: analysis.vulnerabilities.filter(v => v.severity === 'low').length,
      };
    }

    // Ensure recommendations exist
    if (!analysis.recommendations || !Array.isArray(analysis.recommendations)) {
      analysis.recommendations = generateDefaultRecommendations(analysis.vulnerabilities);
    }

    return analysis;

  } catch (error) {
    console.error("OpenAI security analysis failed:", error);
    return null; // Fall back to pattern-based detection only
  }
}

export async function generateSecurityReport(vulnerabilities: Vulnerability[], codeMetrics: any): Promise<string> {
  try {
    const prompt = `Generate a comprehensive security report based on the following vulnerability data and code metrics. The report should be professional, actionable, and suitable for both technical and non-technical stakeholders.

Vulnerabilities found: ${JSON.stringify(vulnerabilities, null, 2)}
Code metrics: ${JSON.stringify(codeMetrics, null, 2)}

Please provide a detailed security report in markdown format that includes:
1. Executive summary
2. Security score explanation
3. Critical findings
4. Detailed vulnerability breakdown
5. Remediation recommendations
6. Best practices for prevention

The report should be thorough but concise, focusing on actionable insights.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a cybersecurity expert writing professional security assessment reports. Your reports are clear, actionable, and help development teams improve their security posture."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000
    });

    return response.choices[0].message.content || "Failed to generate security report.";

  } catch (error) {
    console.error("Failed to generate security report:", error);
    return "# Security Report\n\nUnable to generate detailed report due to technical issues. Please review the vulnerability list manually.";
  }
}

function calculateFallbackScore(vulnerabilities: Vulnerability[]): number {
  if (vulnerabilities.length === 0) return 10.0;

  const weights = { critical: 25, high: 15, medium: 8, low: 3 };
  let penalty = 0;

  for (const vuln of vulnerabilities) {
    penalty += weights[vuln.severity] * (vuln.confidence || 0.8);
  }

  // Normalize penalty and calculate score
  const score = Math.max(0, 10 - (penalty / 10));
  return Math.round(score * 10) / 10;
}

function generateDefaultRecommendations(vulnerabilities: Vulnerability[]): string[] {
  const recommendations = [
    "Implement comprehensive input validation for all user inputs",
    "Use parameterized queries to prevent SQL injection attacks",
    "Sanitize and escape output to prevent XSS vulnerabilities",
    "Store sensitive configuration in environment variables",
    "Implement proper error handling without information disclosure",
    "Use HTTPS for all communications",
    "Implement proper authentication and authorization checks",
    "Keep all dependencies up to date",
    "Use static analysis tools in your CI/CD pipeline",
    "Conduct regular security code reviews"
  ];

  // Add specific recommendations based on vulnerabilities found
  const vulnTypes = new Set(vulnerabilities.map(v => v.type.toLowerCase()));
  
  if (vulnTypes.has('sql injection')) {
    recommendations.unshift("CRITICAL: Replace string concatenation in SQL queries with parameterized statements");
  }
  
  if (vulnTypes.has('xss') || vulnTypes.has('cross-site scripting')) {
    recommendations.unshift("HIGH: Implement output encoding and Content Security Policy (CSP)");
  }
  
  if (vulnTypes.has('hardcoded secrets') || vulnTypes.has('hardcoded credentials')) {
    recommendations.unshift("HIGH: Remove all hardcoded secrets and use secure secret management");
  }

  return recommendations.slice(0, 8); // Limit to top 8 recommendations
}
