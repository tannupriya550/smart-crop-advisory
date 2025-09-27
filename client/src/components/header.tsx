// client/src/components/header.tsx
import { Link, useLocation } from 'wouter';
import { Sprout, User, LogOut } from 'lucide-react';
import { LanguageSelector } from './language-selector';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  farmerName?: string;
}

export function Header({ farmerName }: HeaderProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token'); // ✅ clear token
    toast({
      title: '👋 Logged Out',
      description: 'You have been logged out successfully.',
    });
    setLocation('/login'); // ✅ redirect
  };

  return (
    <header className="header-3d sticky top-0 z-50 header-3d-bg header-3d-shadow">
      <div className="header-3d-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="header-3d-link flex items-center space-x-3 hover:opacity-90 transition-all duration-300"
          >
            <Sprout className="header-3d-icon text-primary text-3xl" />
            <h1
              className="header-3d-title text-2xl font-extrabold header-3d-text-shadow"
              data-testid="app-title"
            >
              Smart Crop Advisory System
            </h1>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="header-3d-button">
              <LanguageSelector />
            </div>

            <Link
              href="/profile"
              className="header-3d-profile flex items-center space-x-2 hover:opacity-90 transition-all duration-300"
              data-testid="link-profile"
            >
              <User className="header-3d-profile-icon text-2xl text-muted-foreground" />
              <span
                className="text-sm font-medium header-3d-text-shadow"
                data-testid="text-farmer-name"
              >
                {farmerName || 'Guest User'}
              </span>
            </Link>

            {/* ✅ Logout button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-1"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
