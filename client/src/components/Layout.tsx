import { Navigation } from './Navigation';
import { FloatingActionButton } from './FloatingActionButton';
import { BugReportModal } from './BugReportModal';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  showFAB?: boolean;
}

export function Layout({ children, showFAB = false }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {children}
      </main>
      {isAuthenticated && showFAB && <FloatingActionButton />}
      <BugReportModal />
      <Toaster />
    </div>
  );
}
