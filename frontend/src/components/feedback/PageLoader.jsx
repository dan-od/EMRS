import { Loader2 } from 'lucide-react';

export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto" />
        <p className="mt-4 text-text-secondary">{message}</p>
      </div>
    </div>
  );
};

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <Loader2 className={`${sizes[size]} text-primary-500 animate-spin ${className}`} />
  );
};

export const InlineLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <Spinner size="md" />
      <span className="ml-3 text-text-secondary">{message}</span>
    </div>
  );
};

export const ContentLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
  </div>
);
