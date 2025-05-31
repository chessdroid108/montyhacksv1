import { Vulnerability } from "./vulnerabilityScanner";

interface AIAnalysisResult {
  vulnerabilities: Array<{
    type: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    line: number;
    description: string;
    suggestion: string;
    confidence: number;
  }>;
  explanation: string;
}

export async function analyzeWithAI(code: string, fileName: string): Promise<Vulnerability[]> {
  const apiKey = process.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not available");
  }

  try {
    const prompt = `
Analyze the following ${fileName} code for security vulnerabilities. 
Identify potential security issues and provide detailed analysis.

Code:
\`\`\`
${code}
\`\`\`

Please respond with a JSON object containing:
{
  "vulnerabilities": [
    {
      "type": "vulnerability_name",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "line": line_number,
      "description": "detailed_description",
      "suggestion": "how_to_fix",
      "confidence": confidence_score_0_to_100
    }
  ],
  "explanation": "overall_security_assessment"
}

Focus on common vulnerabilities like:
- SQL Injection
- Cross-Site Scripting (XSS)
- Authentication bypasses
- Authorization flaws
- Input validation issues
- Cryptographic weaknesses
- Information disclosure
- Insecure configurations
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a security expert specializing in code vulnerability analysis. Provide detailed, accurate security assessments."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1, // Low temperature for consistent results
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from OpenAI API");
    }

    const analysisResult: AIAnalysisResult = JSON.parse(content);
    
    // Convert AI results to our Vulnerability format
    return analysisResult.vulnerabilities.map((vuln, index) => ({
      id: `ai_${fileName}_${vuln.line}_${index}`,
      type: vuln.type,
      severity: vuln.severity,
      line: vuln.line,
      column: 0,
      message: vuln.description,
      suggestion: vuln.suggestion,
      confidence: Math.min(100, Math.max(0, vuln.confidence)),
      detectionMethod: "AI" as const
    }));

  } catch (error) {
    console.error("AI analysis error:", error);
    
    // If AI analysis fails, return empty array so pattern matching can still work
    if (error instanceof Error && error.message.includes("API key")) {
      throw error;
    }
    
    // For other errors (network, parsing, etc.), return empty array
    return [];
  }
}

export function combineAnalysisResults(
  patternResults: Vulnerability[],
  aiResults: Vulnerability[]
): Vulnerability[] {
  const combined = [...patternResults];
  
  // Add AI results that don't overlap with pattern results
  aiResults.forEach(aiVuln => {
    const hasOverlap = patternResults.some(patternVuln => 
      Math.abs(patternVuln.line - aiVuln.line) <= 1 && 
      patternVuln.type.toLowerCase().includes(aiVuln.type.toLowerCase().split(' ')[0])
    );
    
    if (!hasOverlap) {
      // Mark as hybrid if AI found something patterns didn't
      combined.push({
        ...aiVuln,
        detectionMethod: "HYBRID",
        confidence: Math.min(aiVuln.confidence + 10, 100) // Boost confidence for AI-only findings
      });
    } else {
      // If there's overlap, boost confidence of the pattern match
      const overlappingPattern = patternResults.find(patternVuln => 
        Math.abs(patternVuln.line - aiVuln.line) <= 1
      );
      if (overlappingPattern) {
        overlappingPattern.confidence = Math.min(overlappingPattern.confidence + 15, 100);
        overlappingPattern.detectionMethod = "HYBRID";
        // Enhance the suggestion with AI insights
        if (aiVuln.suggestion && aiVuln.suggestion !== overlappingPattern.suggestion) {
          overlappingPattern.suggestion += ` AI suggests: ${aiVuln.suggestion}`;
        }
      }
    }
  });
  
  return combined;
}
