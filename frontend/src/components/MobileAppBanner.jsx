import { useState, useEffect } from 'react';
import { Smartphone, X, Download, Clock } from 'lucide-react';

export default function MobileAppBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | coming-soon

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('app_banner_dismissed');
    if (!wasDismissed) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('app_banner_dismissed', '1');
  };

  const downloadApk = async () => {
    setStatus('loading');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiUrl}/download/apk`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'financial-habit-builder.apk';
        a.click();
        URL.revokeObjectURL(url);
        dismiss();
      } else {
        setStatus('coming-soon');
      }
    } catch {
      setStatus('coming-soon');
    }
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-bounce-once">
      <div className="card   p-4">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-11 h-11   bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-semibold text-[var(--color-ink)]">Get Our Mobile App</p>
            {status === 'coming-soon' ? (
              <>
                <p className="text-xs text-sub mt-0.5">
                  Mobile app is coming soon. Stay tuned!
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-amber-500 text-xs font-medium">
                  <Clock className="w-3 h-3" />
                  Coming Soon
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-sub mt-0.5">
                  Track habits, expenses & wealth on the go.
                </p>
                <button
                  onClick={downloadApk}
                  disabled={status === 'loading'}
                  className="mt-3 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-medium px-3.5 py-1.5   transition-colors"
                >
                  <Download className="w-3 h-3" />
                  {status === 'loading' ? 'Checking...' : 'Download APK'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
