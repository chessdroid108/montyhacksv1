// PDF export functionality using jsPDF
export async function exportSecurityReportToPDF(data: {
  projectName: string;
  scanDate: Date;
  securityScore: number;
  vulnerabilities: Array<{
    type: string;
    severity: string;
    fileName: string;
    line: number;
    description: string;
    suggestion: string;
  }>;
  summary: {
    totalFiles: number;
    totalVulnerabilities: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
}): Promise<void> {
  try {
    // Dynamic import to avoid bundling jsPDF unless needed
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;
    
    // Helper function to add new page if needed
    const checkPageSpace = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
    };
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Security Analysis Report', 20, yPosition);
    yPosition += 15;
    
    // Project info
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Project: ${data.projectName}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Scan Date: ${data.scanDate.toLocaleDateString()}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Security Score: ${data.securityScore}/100`, 20, yPosition);
    yPosition += 15;
    
    // Summary section
    checkPageSpace(60);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Executive Summary', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Files Scanned: ${data.summary.totalFiles}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Total Vulnerabilities: ${data.summary.totalVulnerabilities}`, 20, yPosition);
    yPosition += 6;
    
    // Severity breakdown
    doc.text('Vulnerability Breakdown:', 20, yPosition);
    yPosition += 6;
    doc.text(`  • Critical: ${data.summary.criticalCount}`, 30, yPosition);
    yPosition += 6;
    doc.text(`  • High: ${data.summary.highCount}`, 30, yPosition);
    yPosition += 6;
    doc.text(`  • Medium: ${data.summary.mediumCount}`, 30, yPosition);
    yPosition += 6;
    doc.text(`  • Low: ${data.summary.lowCount}`, 30, yPosition);
    yPosition += 15;
    
    // Recommendations
    checkPageSpace(40);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Recommendations', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    const recommendations = [
      'Address all critical vulnerabilities immediately',
      'Implement input validation and sanitization',
      'Use parameterized queries to prevent SQL injection',
      'Regularly update dependencies and libraries',
      'Conduct periodic security reviews and testing'
    ];
    
    recommendations.forEach(rec => {
      checkPageSpace(6);
      doc.text(`• ${rec}`, 20, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
    
    // Detailed vulnerabilities
    if (data.vulnerabilities.length > 0) {
      checkPageSpace(30);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Detailed Vulnerability Analysis', 20, yPosition);
      yPosition += 10;
      
      data.vulnerabilities.forEach((vuln, index) => {
        checkPageSpace(35);
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${vuln.type}`, 20, yPosition);
        yPosition += 8;
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Severity: ${vuln.severity}`, 25, yPosition);
        yPosition += 6;
        doc.text(`File: ${vuln.fileName} (Line ${vuln.line})`, 25, yPosition);
        yPosition += 6;
        
        // Description (wrap text if too long)
        const descriptionLines = doc.splitTextToSize(`Description: ${vuln.description}`, pageWidth - 50);
        descriptionLines.forEach((line: string) => {
          checkPageSpace(6);
          doc.text(line, 25, yPosition);
          yPosition += 6;
        });
        
        // Suggestion (wrap text if too long)
        const suggestionLines = doc.splitTextToSize(`Suggestion: ${vuln.suggestion}`, pageWidth - 50);
        suggestionLines.forEach((line: string) => {
          checkPageSpace(6);
          doc.text(line, 25, yPosition);
          yPosition += 6;
        });
        
        yPosition += 5;
      });
    }
    
    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(
        `SecureCode Security Report - Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    const fileName = `security-report-${data.projectName.replace(/[^a-zA-Z0-9]/g, '-')}-${data.scanDate.toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to generate PDF report');
  }
}

export async function exportDashboardToPDF(dashboardData: {
  userName: string;
  totalProjects: number;
  totalScans: number;
  averageSecurityScore: number;
  recentActivity: Array<{
    date: string;
    action: string;
    details: string;
  }>;
}): Promise<void> {
  try {
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('SecureCode Dashboard Report', 20, yPosition);
    yPosition += 15;
    
    // User info
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`User: ${dashboardData.userName}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;
    
    // Statistics
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Dashboard Overview', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Projects: ${dashboardData.totalProjects}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Total Scans: ${dashboardData.totalScans}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Average Security Score: ${dashboardData.averageSecurityScore}/100`, 20, yPosition);
    yPosition += 15;
    
    // Recent activity
    if (dashboardData.recentActivity.length > 0) {
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Recent Activity', 20, yPosition);
      yPosition += 10;
      
      dashboardData.recentActivity.forEach(activity => {
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`${activity.date}: ${activity.action}`, 20, yPosition);
        yPosition += 6;
        if (activity.details) {
          doc.text(`  ${activity.details}`, 25, yPosition);
          yPosition += 6;
        }
      });
    }
    
    const fileName = `dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('Dashboard PDF export error:', error);
    throw new Error('Failed to generate dashboard PDF');
  }
}
