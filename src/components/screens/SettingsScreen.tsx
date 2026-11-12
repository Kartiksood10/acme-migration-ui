import { useState, useEffect } from 'react';
import { Monitor, Check } from 'lucide-react';

// Supported appearance modes for the application
export type ThemeMode = 'system' | 'light' | 'dark';

// Shared localStorage keys used across Settings, AppLayout, and NewMigrationModal
export const DEFAULT_REPO_STORAGE_KEY = 'acme_default_repo';
export const THEME_STORAGE_KEY = 'acme_theme_mode';

// The SettingsScreen component allows users to configure application-wide preferences, including the visual theme (System, Light, or Dark) and a default consumer Git repository URL that automatically pre-fills when initiating a new migration.
export default function SettingsScreen() {
  // Initialize theme preference from localStorage, falling back to 'system'
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'system';
  });

  // Initialize default repository URL from localStorage
  const [defaultRepo, setDefaultRepo] = useState<string>(() => {
    return localStorage.getItem(DEFAULT_REPO_STORAGE_KEY) || '';
  });

  // Controls the temporary "Saved" confirmation badge after saving the repository URL
  const [isSaved, setIsSaved] = useState(false);

  // Sync the selected theme with the document root and notify AppLayout
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const applyTheme = (mode: ThemeMode) => {
      if (mode === 'dark') {
        root.classList.add('dark');
      } else if (mode === 'light') {
        root.classList.remove('dark');
      } else {
        // Resolve OS-level dark/light preference when 'system' is active
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme(theme);
    // Broadcast custom event so the top header theme toggle stays in sync
    window.dispatchEvent(new Event('theme-changed'));
  }, [theme]);

  // Listen for theme changes triggered from the top header toggle in AppLayout
  useEffect(() => {
    const syncFromHeader = () => {
      const storedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'system';
      setTheme(storedTheme);
    };

    window.addEventListener('header-theme-changed', syncFromHeader);
    return () => window.removeEventListener('header-theme-changed', syncFromHeader);
  }, []);

  // Persist the default repository URL to localStorage and trigger visual feedback
  const handleSaveRepo = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(DEFAULT_REPO_STORAGE_KEY, defaultRepo.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your application preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Appearance Configuration */}
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-start gap-3.5">
            <div className="text-blue-600 dark:text-blue-400 mt-0.5">
              <Monitor className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Appearance</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Choose how ACME looks.</p>
            </div>
          </div>

          {/* 3-Way Segmented Theme Control (System / Light / Dark) */}
          <div className="mt-6 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl grid grid-cols-3 gap-1 border border-slate-200/60 dark:border-slate-700/50">
            {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => {
              const isActive = theme === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  className={`py-2 px-4 rounded-lg text-xs font-semibold capitalize transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 2: Default Repository Configuration */}
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 12 12 17 22 12" />
                  <polyline points="2 17 12 22 22 17" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Default Repository</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pre-filled Git repository for new migrations.
                </p>
              </div>
            </div>

            {/* Confirmation badge shown briefly upon saving */}
            {isSaved && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-500/20">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
          </div>

          {/* Repository input form with inline Save button */}
          <form onSubmit={handleSaveRepo} className="mt-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-700 dark:text-slate-200" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </div>
              <input
                type="url"
                value={defaultRepo}
                onChange={(e) => setDefaultRepo(e.target.value)}
                placeholder="https://github.com/your-org/your-repo"
                className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-20 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
