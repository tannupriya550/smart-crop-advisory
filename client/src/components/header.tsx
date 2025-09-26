import { Link } from 'wouter';
import { Sprout, User } from 'lucide-react';
import { LanguageSelector } from './language-selector';

interface HeaderProps {
  farmerName?: string;
}

export function Header({ farmerName }: HeaderProps) {
  return (
    <header className="header-3d sticky top-0 z-50 header-3d-bg header-3d-shadow">
      <div className="header-3d-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="header-3d-link flex items-center space-x-3 hover:opacity-90 transition-all duration-300"
          >
            <Sprout className="header-3d-icon text-primary text-3xl" />
            {/* ✅ 3D App Title */}
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
          </div>
        </div>
      </div>
    </header>
  );
}
