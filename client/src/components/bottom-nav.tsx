import { Link, useLocation } from 'wouter';
import { Home, CloudSun, Sprout, Wrench, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { href: '/', icon: Home, label: t('home'), testId: 'nav-home' },
    { href: '/weather', icon: CloudSun, label: t('weather'), testId: 'nav-weather' },
    { href: '/recommendations', icon: Sprout, label: t('crops'), testId: 'nav-crops' },
    { href: '/calculator', icon: Wrench, label: t('tools'), testId: 'nav-tools' },
    { href: '/chat', icon: MessageCircle, label: t('assistant'), testId: 'nav-assistant' }
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg lg:hidden z-50">
        <div className="grid grid-cols-5 h-16">
          {navItems.map(({ href, icon: Icon, label, testId }) => {
            const isActive = location === href;
            return (
              <Link key={href} href={href} data-testid={testId}>
                <div className={cn(
                  "flex flex-col items-center justify-center space-y-1 h-full transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  <Icon className="text-lg" />
                  <span className="text-xs">{label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="h-16 lg:hidden" />
    </>
  );
}
