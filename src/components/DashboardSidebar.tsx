import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  CheckCircle, 
  Users, 
  Settings,
  LogOut,
  ClipboardCheck,
  Shield
} from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['merchant', 'onboarding_officer', 'compliance_officer', 'admin'] },
  { label: 'My Applications', href: '/applications', icon: FileText, roles: ['merchant'] },
  { label: 'New Application', href: '/apply', icon: Upload, roles: ['merchant'] },
  { label: 'Review Applications', href: '/onboarding/review', icon: ClipboardCheck, roles: ['onboarding_officer', 'admin'] },
  { label: 'Compliance Review', href: '/compliance/review', icon: Shield, roles: ['compliance_officer', 'admin'] },
  { label: 'All Applications', href: '/admin/applications', icon: FileText, roles: ['admin'] },
  { label: 'Users', href: '/admin/users', icon: Users, roles: ['admin'] },
];

export const DashboardSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case 'merchant':
        return 'bg-info/10 text-info';
      case 'onboarding_officer':
        return 'bg-warning/10 text-warning';
      case 'compliance_officer':
        return 'bg-status-compliance/10 text-status-compliance';
      case 'admin':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'merchant':
        return 'Merchant';
      case 'onboarding_officer':
        return 'Onboarding Officer';
      case 'compliance_officer':
        return 'Compliance Officer';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Logo size="md" />
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1',
              getRoleBadgeStyles(user.role)
            )}>
              {getRoleLabel(user.role)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};
