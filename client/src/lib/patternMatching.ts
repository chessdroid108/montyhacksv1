import { Vulnerability } from "./vulnerabilityScanner";

interface VulnerabilityPattern {
  id: string;
  name: string;
  pattern: RegExp;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  description: string;
  suggestion: string;
  languages: string[];
}

// Comprehensive vulnerability patterns
const VULNERABILITY_PATTERNS: VulnerabilityPattern[] = [
  // SQL Injection patterns
  {
    id: "sql_injection_1",
    name: "SQL Injection - String Concatenation",
    pattern: /(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE).*\+.*[\'"]/gi,
    severity: "CRITICAL",
    description: "SQL query constructed using string concatenation, vulnerable to SQL injection",
    suggestion: "Use parameterized queries or prepared statements instead of string concatenation",
    languages: ["javascript", "typescript", "php", "python", "java", "c#"]
  },
  {
    id: "sql_injection_2",
    name: "SQL Injection - Template Literals",
    pattern: /(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE).*\$\{.*\}/gi,
    severity: "CRITICAL",
    description: "SQL query using template literals with variables, vulnerable to SQL injection",
    suggestion: "Use parameterized queries instead of template literals for SQL queries",
    languages: ["javascript", "typescript"]
  },
  {
    id: "sql_injection_3",
    name: "SQL Injection - Dynamic Query Building",
    pattern: /\.(query|execute|executeSql)\s*\(\s*['"]\s*(SELECT|INSERT|UPDATE|DELETE).*[\+\$]/gi,
    severity: "CRITICAL",
    description: "Dynamic SQL query construction detected",
    suggestion: "Use ORM methods or parameterized queries",
    languages: ["javascript", "typescript", "python", "java"]
  },

  // Cross-Site Scripting (XSS) patterns
  {
    id: "xss_1",
    name: "XSS - innerHTML Assignment",
    pattern: /\.innerHTML\s*=\s*(?!['"][^<>]*['"])/gi,
    severity: "HIGH",
    description: "Direct assignment to innerHTML without sanitization",
    suggestion: "Use textContent instead of innerHTML, or sanitize input with a library like DOMPurify",
    languages: ["javascript", "typescript"]
  },
  {
    id: "xss_2",
    name: "XSS - Document Write",
    pattern: /document\.write\s*\(/gi,
    severity: "HIGH",
    description: "Using document.write() which can lead to XSS vulnerabilities",
    suggestion: "Use safer DOM manipulation methods like createElement and appendChild",
    languages: ["javascript", "typescript"]
  },
  {
    id: "xss_3",
    name: "XSS - Eval Function",
    pattern: /\beval\s*\(/gi,
    severity: "CRITICAL",
    description: "Using eval() function which can execute arbitrary code",
    suggestion: "Avoid using eval(). Use JSON.parse() for JSON data or other safe alternatives",
    languages: ["javascript", "typescript", "python"]
  },

  // Authentication and Authorization vulnerabilities
  {
    id: "auth_1",
    name: "Hardcoded Credentials",
    pattern: /(password|passwd|pwd|secret|key|token|api_key)\s*[:=]\s*['"][^'"]{3,}['"]/gi,
    severity: "CRITICAL",
    description: "Hardcoded credentials found in source code",
    suggestion: "Use environment variables or secure credential storage instead of hardcoding sensitive data",
    languages: ["javascript", "typescript", "python", "java", "c#", "php"]
  },
  {
    id: "auth_2",
    name: "Weak Password Validation",
    pattern: /password.*\.length\s*[<>=]+\s*[1-7]\b/gi,
    severity: "MEDIUM",
    description: "Weak password length validation (less than 8 characters)",
    suggestion: "Enforce strong password policies with minimum 8 characters, mixed case, numbers, and symbols",
    languages: ["javascript", "typescript", "python", "java", "c#"]
  },
  {
    id: "auth_3",
    name: "Missing Authentication Check",
    pattern: /\.(delete|update|create|admin).*\((?![^)]*auth|[^)]*token|[^)]*session)/gi,
    severity: "HIGH",
    description: "Potentially sensitive operation without authentication check",
    suggestion: "Add proper authentication and authorization checks before sensitive operations",
    languages: ["javascript", "typescript", "python", "java", "c#", "php"]
  },

  // Cryptographic vulnerabilities
  {
    id: "crypto_1",
    name: "Weak Cryptographic Algorithm",
    pattern: /\b(md5|sha1|des|rc4)\b/gi,
    severity: "HIGH",
    description: "Use of weak or deprecated cryptographic algorithm",
    suggestion: "Use strong cryptographic algorithms like SHA-256, AES-256, or bcrypt for hashing",
    languages: ["javascript", "typescript", "python", "java", "c#", "php"]
  },
  {
    id: "crypto_2",
    name: "Hardcoded Encryption Key",
    pattern: /(encrypt|decrypt|cipher).*['"][a-zA-Z0-9+/=]{16,}['"]/gi,
    severity: "CRITICAL",
    description: "Hardcoded encryption key detected",
    suggestion: "Use secure key management systems and never hardcode encryption keys",
    languages: ["javascript", "typescript", "python", "java", "c#", "php"]
  },

  // Input Validation vulnerabilities
  {
    id: "input_1",
    name: "Missing Input Validation",
    pattern: /req\.(body|params|query)\.[a-zA-Z_][a-zA-Z0-9_]*(?![^;]*\.(validate|sanitize|escape|length|match|test))/gi,
    severity: "MEDIUM",
    description: "Direct use of user input without validation",
    suggestion: "Validate and sanitize all user inputs before processing",
    languages: ["javascript", "typescript"]
  },
  {
    id: "input_2",
    name: "Path Traversal Risk",
    pattern: /\.\.(\/|\\)|\.\.%2f|\.\.%5c/gi,
    severity: "HIGH",
    description: "Potential path traversal vulnerability",
    suggestion: "Validate file paths and restrict access to allowed directories only",
    languages: ["javascript", "typescript", "python", "java", "c#", "php"]
  },

  // File Upload vulnerabilities
  {
    id: "file_1",
    name: "Unrestricted File Upload",
    pattern: /\.(upload|multer|formidable)(?![^;]*\.(fileFilter|limits|fileSize))/gi,
    severity: "HIGH",
    description: "File upload without proper restrictions",
    suggestion: "Implement file type validation, size limits, and virus scanning for uploads",
    languages: ["javascript", "typescript"]
  },

  // Information Disclosure
  {
    id: "info_1",
    name: "Error Information Disclosure",
    pattern: /\.(stack|stackTrace|printStackTrace|error)(?![^;]*log)/gi,
    severity: "MEDIUM",
    description: "Potential information disclosure through error messages",
    suggestion: "Log detailed errors server-side but return generic error messages to users",
    languages: ["javascript", "typescript", "python", "java", "c#"]
  },

  // Session Management
  {
    id: "session_1",
    name: "Insecure Session Configuration",
    pattern: /session.*secure:\s*false|session.*httpOnly:\s*false/gi,
    severity: "MEDIUM",
    description: "Insecure session cookie configuration",
    suggestion: "Set secure: true and httpOnly: true for session cookies in production",
    languages: ["javascript", "typescript"]
  },

  // CORS vulnerabilities
  {
    id: "cors_1",
    name: "Permissive CORS Policy",
    pattern: /Access-Control-Allow-Origin.*\*|cors.*origin:\s*true/gi,
    severity: "MEDIUM",
    description: "Overly permissive CORS policy",
    suggestion: "Restrict CORS to specific trusted domains instead of allowing all origins",
    languages: ["javascript", "typescript"]
  }
];

export function detectPatterns(code: string, fileName: string): Vulnerability[] {
  const lines = code.split('\n');
  const vulnerabilities: Vulnerability[] = [];
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Map file extensions to languages
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cs': 'c#',
    'php': 'php'
  };
  
  const currentLanguage = languageMap[fileExtension] || 'unknown';
  
  // Filter patterns based on current language
  const applicablePatterns = VULNERABILITY_PATTERNS.filter(pattern => 
    pattern.languages.includes(currentLanguage) || pattern.languages.includes('all')
  );
  
  lines.forEach((line, lineIndex) => {
    applicablePatterns.forEach(pattern => {
      const matches = line.match(pattern.pattern);
      if (matches) {
        matches.forEach(match => {
          const columnIndex = line.indexOf(match);
          
          vulnerabilities.push({
            id: `${pattern.id}_${lineIndex}_${columnIndex}`,
            type: pattern.name,
            severity: pattern.severity,
            line: lineIndex + 1,
            column: columnIndex,
            message: pattern.description,
            suggestion: pattern.suggestion,
            confidence: calculateConfidence(pattern, match, line),
            detectionMethod: "PATTERN"
          });
        });
      }
    });
  });
  
  return vulnerabilities;
}

function calculateConfidence(pattern: VulnerabilityPattern, match: string, line: string): number {
  let confidence = 70; // Base confidence for pattern matches
  
  // Increase confidence for more specific patterns
  if (pattern.severity === "CRITICAL") {
    confidence += 20;
  } else if (pattern.severity === "HIGH") {
    confidence += 15;
  } else if (pattern.severity === "MEDIUM") {
    confidence += 10;
  }
  
  // Increase confidence if the match is not in a comment
  if (!line.trim().startsWith('//') && !line.trim().startsWith('/*') && !line.trim().startsWith('#')) {
    confidence += 10;
  }
  
  // Decrease confidence if it looks like test code
  if (line.toLowerCase().includes('test') || line.toLowerCase().includes('mock')) {
    confidence -= 20;
  }
  
  return Math.min(100, Math.max(30, confidence));
}

export function getVulnerabilityTypeDescription(type: string): string {
  const pattern = VULNERABILITY_PATTERNS.find(p => p.name === type);
  return pattern?.description || "Unknown vulnerability type";
}

export function getVulnerabilityTypeSuggestion(type: string): string {
  const pattern = VULNERABILITY_PATTERNS.find(p => p.name === type);
  return pattern?.suggestion || "Review and fix this security issue";
}
