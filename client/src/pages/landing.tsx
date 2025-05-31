import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Shield, 
  Code, 
  Zap, 
  BarChart3, 
  Users, 
  Download,
  Play,
  ChevronRight,
  Bug,
  FileText,
  Settings
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { BugReportModal } from "@/components/bug-report-modal";
import { DocumentationModal } from "@/components/documentation-modal";

export default function Landing() {
  const [showBugReport, setShowBugReport] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);

  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: Code,
      title: "Web-Based IDE",
      description: "Full-featured development environment with WebAssembly support for secure code execution and real-time collaboration.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "AI-Powered Scanning",
      description: "Advanced vulnerability detection using machine learning algorithms and sophisticated pattern matching.",
      gradient: "from-red-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Security Analytics",
      description: "Comprehensive dashboards with interactive charts, vulnerability trends, and exportable security reports.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Real-time Protection",
      description: "Continuous monitoring with instant vulnerability alerts and automated fix suggestions.",
      gradient: "from-purple-500 to-violet-500"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share security insights, assign vulnerabilities, and track resolution progress across your team.",
      gradient: "from-orange-500 to-amber-500"
    },
    {
      icon: Download,
      title: "Export & Reporting",
      description: "Generate detailed PDF reports, export data for compliance, and integrate with existing workflows.",
      gradient: "from-indigo-500 to-blue-500"
    }
  ];

  const stats = [
    { value: "99.7%", label: "Accuracy Rate", icon: Shield },
    { value: "50+", label: "Vulnerability Types", icon: Bug },
    { value: "10k+", label: "Developers Trust Us", icon: Users },
    { value: "24/7", label: "Real-time Monitoring", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onDocumentation={() => setShowDocumentation(true)}
        onBugReport={() => setShowBugReport(true)}
      />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-xl"
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-xl"
            animate={{
              y: [0, 20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm border-primary/20">
              <Zap className="w-4 h-4 mr-2" />
              Advanced Security Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
              Secure Your Code,
              <br />
              Protect Your Future
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
              Advanced AI-powered vulnerability detection platform with comprehensive security analysis for modern development teams.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Scanning
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setShowDocumentation(true)}
                className="px-8 py-4 text-lg font-semibold border-2"
              >
                <FileText className="w-5 h-5 mr-2" />
                View Documentation
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Security Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive security analysis tools designed for modern development workflows
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Secure Your Code?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers who trust SecureCode to protect their applications.
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started Now
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* Modals */}
      <BugReportModal 
        open={showBugReport} 
        onOpenChange={setShowBugReport} 
      />
      
      <DocumentationModal
        open={showDocumentation}
        onOpenChange={setShowDocumentation}
      />
    </div>
  );
}
