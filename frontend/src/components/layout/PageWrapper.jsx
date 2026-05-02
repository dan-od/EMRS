import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { Header } from './Header';
import { ArrowLeft } from 'lucide-react';

export const PageWrapper = ({ 
  title, 
  subtitle,
  actions,
  children, 
  className,
  noPadding = false,
  backButton = false,
  backTo
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Header title={title} />
      
      <main className={cn('flex-1 animate-fadeIn', !noPadding && 'p-4 pb-8 lg:p-6 lg:pb-6')}>
        {/* Page header with actions */}
        {(subtitle || actions || backButton) && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              {backButton && (
                <button
                  onClick={handleBack}
                  className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              )}
              <div>
                {title && <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text sm:hidden">{title}</h1>}
                {subtitle && <div className="text-text-secondary dark:text-dark-muted">{subtitle}</div>}
              </div>
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        )}

        <div className={className}>{children}</div>
      </main>
    </div>
  );
};

export const PageSection = ({ title, description, children, className, actions }) => (
  <section className={cn('mb-8', className)}>
    {(title || actions) && (
      <div className="flex items-center justify-between mb-4">
        <div>
          {title && <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text">{title}</h2>}
          {description && <p className="text-sm text-text-secondary dark:text-dark-muted mt-0.5">{description}</p>}
        </div>
        {actions}
      </div>
    )}
    {children}
  </section>
);
