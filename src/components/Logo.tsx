import React from 'react';
import cbzLogo from '@/assets/cbz-logo.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={cbzLogo} 
        alt="CBZ Bank Logo" 
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-foreground ${textClasses[size]}`}>
            CBZ Bank
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            E-Commerce Services
          </span>
        </div>
      )}
    </div>
  );
};
