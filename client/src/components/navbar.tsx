import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { 
  Shield, 
  Moon, 
  Sun, 
  FileText, 
  Bug, 
  Settings, 
  LogOut, 
  User,
  Crown,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  onDocumentation?: () => void;
  onBugReport?: () => void;
  onSettings?: () => void;
  showUserMenu?: boolean;
  isAdmin?: boolean;
}

export function Navbar({ 
  onDocumentation, 
  onBugReport, 
  onSettings, 
  showUserMenu = false,
  isAdmin = false 
}: NavbarProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">SecureCode</span>
              {isAdmin && (
                <Badge variant="secondary" className="ml-2">
                  <Crown className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {!showUserMenu && (
                <>
                  <a href="#home" className="text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </a>
                  <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                    Features
                  </a>
                </>
              )}
              <button 
                onClick={onDocumentation}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Documentation
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <Button variant="ghost" onClick={onBugReport}>
                <Bug className="w-4 h-4 mr-2" />
                Report Bug
              </Button>

              {showUserMenu && isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        {user?.profileImageUrl ? (
                          <img 
                            src={user.profileImageUrl} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span>{user?.firstName || 'User'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center space-x-2 p-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        {user?.profileImageUrl ? (
                          <img 
                            src={user.profileImageUrl} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onSettings}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDocumentation}>
                      <FileText className="w-4 h-4 mr-2" />
                      Documentation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onBugReport}>
                      <Bug className="w-4 h-4 mr-2" />
                      Report Bug
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={handleLogin}>
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-0 right-0 z-40 bg-background border-b border-border md:hidden"
        >
          <div className="px-4 py-6 space-y-4">
            {!showUserMenu && (
              <>
                <a href="#home" className="block text-muted-foreground hover:text-primary transition-colors">
                  Home
                </a>
                <a href="#features" className="block text-muted-foreground hover:text-primary transition-colors">
                  Features
                </a>
              </>
            )}
            <button 
              onClick={onDocumentation}
              className="block text-muted-foreground hover:text-primary transition-colors"
            >
              Documentation
            </button>
            <button 
              onClick={onBugReport}
              className="block text-muted-foreground hover:text-primary transition-colors"
            >
              Report Bug
            </button>
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {isDark ? 'Light' : 'Dark'} Mode
              </Button>
              
              {showUserMenu && isAuthenticated ? (
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Button size="sm" onClick={handleLogin}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
