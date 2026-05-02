import { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle } from 'lucide-react';

export const MobileAppSection = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-dark-border dark:bg-dark-surface">
      <div className="flex items-center gap-3 p-6 pb-0">
        <Smartphone className="w-5 h-5 text-primary-500" />
        <h3 className="text-base font-semibold text-text-primary dark:text-dark-text">Mobile App</h3>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary dark:text-dark-muted">
              Install EMRS on your device for quick access and offline functionality.
            </p>
            <p className="text-xs text-text-muted dark:text-dark-muted mt-1">
              Works on Android, iOS, and Desktop browsers.
            </p>
          </div>
          {installed || isStandalone ? (
            <span className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              Installed
            </span>
          ) : (
            <button
              onClick={handleInstall}
              disabled={!deferredPrompt}
              className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {deferredPrompt ? 'Install App' : 'Open in Browser to Install'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
