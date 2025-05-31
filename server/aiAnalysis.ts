import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AIVulnerabilityAnalysis {
  vulnerabilities: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: {
      line: number;
      column?: number;
    };
    recommendation: string;
    confidence: number;
    cweId?: string;
  }>;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  recommendations: string[];
}

export class AIVulnerabilityAnalyzer {
  async analyzeCode(filename: string, code: string): Promise<AIVulnerabilityAnalysis | null> {
    try {
      const prompt = `
Analyze the following code for security vulnerabilities. You are an expert security analyst.

Filename: ${filename}
Code:
\`\`\`
${code}
\`\`\`

Analyze for:
1. Common vulnerability types (OWASP Top 10, CWE)
2. Language-specific security issues
3. Logic flaws and security anti-patterns
4. Input validation issues
5. Authentication and authorization flaws
6. Cryptographic issues
7. Error handling problems

Provide a comprehensive security analysis in JSON format with the following structure:
{
  "vulnerabilities": [
    {
      "type": "vulnerability type",
      "severity": "low|medium|high|critical",
      "description": "detailed description",
      "location": {"line": number, "column": number},
      "recommendation": "specific fix recommendation",
      "confidence": 0.0-1.0,
      "cweId": "CWE-XXX if applicable"
    }
  ],
  "overallRisk": "low|medium|high|critical",
  "summary": "overall security assessment",
  "recommendations": ["general security recommendations"]
}

Be thorough and accurate. Only report actual vulnerabilities with high confidence.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a senior security analyst specializing in code vulnerability assessment. Provide accurate, actionable security analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1, // Low temperature for consistent, accurate results
      });

      const result = response.choices[0].message.content;
      if (!result) {
        throw new Error("No response from AI analysis");
      }

      return JSON.parse(result) as AIVulnerabilityAnalysis;
    } catch (error) {
      console.error("AI vulnerability analysis failed:", error);
      return null;
    }
  }

  async analyzeMultipleFiles(files: Array<{ filename: string; content: string }>): Promise<AIVulnerabilityAnalysis | null> {
    try {
      const filesContent = files.map(f => `File: ${f.filename}\n\`\`\`\n${f.content}\n\`\`\`\n`).join('\n\n');
      
      const prompt = `
Analyze the following codebase for security vulnerabilities. Consider the interactions between files and overall architecture security.

${filesContent}

Provide a comprehensive security analysis focusing on:
1. Cross-file security issues
2. Architecture-level vulnerabilities
3. Data flow security problems
4. Configuration and deployment issues
5. Business logic flaws

Respond in JSON format with the same structure as single file analysis but consider the entire codebase context.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a senior security architect specializing in application security assessment. Analyze the entire codebase for systemic security issues."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const result = response.choices[0].message.content;
      if (!result) {
        throw new Error("No response from AI analysis");
      }

      return JSON.parse(result) as AIVulnerabilityAnalysis;
    } catch (error) {
      console.error("AI multi-file vulnerability analysis failed:", error);
      return null;
    }
  }

  async generateSecurityRecommendations(vulnerabilities: any[]): Promise<string[]> {
    try {
      const prompt = `
Based on the following vulnerabilities found in a codebase, generate comprehensive security recommendations:

Vulnerabilities:
${JSON.stringify(vulnerabilities, null, 2)}

Provide actionable security recommendations in JSON format:
{
  "recommendations": [
    "specific actionable recommendation 1",
    "specific actionable recommendation 2",
    ...
  ]
}

Focus on:
1. Immediate fixes for critical issues
2. Security best practices
3. Development process improvements
4. Architecture recommendations
5. Security tools and practices to adopt
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a security consultant providing practical security recommendations for development teams."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const result = response.choices[0].message.content;
      if (!result) {
        return [];
      }

      const parsed = JSON.parse(result);
      return parsed.recommendations || [];
    } catch (error) {
      console.error("Failed to generate security recommendations:", error);
      return [];
    }
  }
}

export const aiVulnerabilityAnalyzer = new AIVulnerabilityAnalyzer();
