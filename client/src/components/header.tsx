import { useState } from 'react';
import { Link } from 'wouter';
import { Sprout, User } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { LanguageSelector } from './language-selector';

interface HeaderProps {
  farmerName?: string;
}

export function Header({ farmerName }: HeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Sprout className="text-primary text-2xl" />
            <h1 className="text-xl font-bold text-foreground" data-testid="app-title">
              {t('appName')}
            </h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            
            <Link 
              href="/profile" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              data-testid="link-profile"
            >
              <User className="text-2xl text-muted-foreground" />
              <span className="text-sm font-medium" data-testid="text-farmer-name">
                {farmerName || 'Guest User'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
