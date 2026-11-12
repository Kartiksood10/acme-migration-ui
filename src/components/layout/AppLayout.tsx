import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Settings, Bell, Moon, Sun, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { THEME_STORAGE_KEY, type ThemeMode } from '../screens/SettingsScreen';
import { useMigrations } from '../../hooks/useMigrations';

interface AppLayoutProps {
  children: ReactNode;
}

interface MigrationNotification {
  id: string;
  jobId: string;
  repoName: string;
  status: 'COMPLETED' | 'FAILED';
  timestamp: string;
  read: boolean;
}

const NOTIFICATIONS_STORAGE_KEY = 'acme_migration_notifications';

// Main App layout component that wraps the entire application, providing a sidebar and header for navigation and theme toggling across the application. It uses React Router for navigation and manages dark/light theme state.
export default function AppLayout({ children }: AppLayoutProps) {
  // Initialize dark mode state based on saved preference in localStorage or system setting
  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'system';
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Fetch migrations from shared TanStack Query cache to detect live job completions across all screens
  const { data: migrations } = useMigrations();

  // Notification dropdown visibility and persisted notification list
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<MigrationNotification[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Refs to track previous job statuses without triggering cascading re-renders
  const prevStatusesRef = useRef<Record<string, string> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Listen for theme updates triggered from the SettingsScreen or OS preference changes
  useEffect(() => {
    const syncTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleOsThemeChange = (e: MediaQueryListEvent) => {
      const currentMode = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'system';
      if (currentMode === 'system') {
        setIsDark(e.matches);
      }
    };

    window.addEventListener('theme-changed', syncTheme);
    mediaQuery.addEventListener('change', handleOsThemeChange);

    return () => {
      window.removeEventListener('theme-changed', syncTheme);
      mediaQuery.removeEventListener('change', handleOsThemeChange);
    };
  }, []);

  // Persist notifications to localStorage whenever they update
  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Detect when any migration transitions from IN_PROGRESS to COMPLETED or FAILED
  useEffect(() => {
    if (!migrations) return;

    // On initial load, record baseline statuses so old completed jobs don't spam notifications
    if (prevStatusesRef.current === null) {
      const initialMap: Record<string, string> = {};
      migrations.forEach((job) => {
        initialMap[job.jobId] = job.status;
      });
      prevStatusesRef.current = initialMap;
      return;
    }

    const newlyFinished: MigrationNotification[] = [];
    const updatedMap: Record<string, string> = { ...prevStatusesRef.current };

    migrations.forEach((job) => {
      const prevStatus = prevStatusesRef.current![job.jobId];
      const isNowTerminal = job.status === 'COMPLETED' || job.status === 'FAILED';
      const wasActive = prevStatus !== undefined && prevStatus !== 'COMPLETED' && prevStatus !== 'FAILED';

      if (wasActive && isNowTerminal) {
        newlyFinished.push({
          id: `${job.jobId}-${Date.now()}`,
          jobId: job.jobId,
          repoName: job.repoName || job.jobId,
          status: job.status as 'COMPLETED' | 'FAILED',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
        });
      }

      updatedMap[job.jobId] = job.status;
    });

    prevStatusesRef.current = updatedMap;

    if (newlyFinished.length > 0) {
      // Defer state update via microtask to avoid synchronous setState inside effect
      queueMicrotask(() => {
        setNotifications((prev) => [...newlyFinished, ...prev].slice(0, 20));
      });
    }
  }, [migrations]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to toggle theme from the top navbar and keep SettingsScreen in sync
  const handleHeaderThemeChange = (dark: boolean) => {
    setIsDark(dark);
    localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
    window.dispatchEvent(new Event('header-theme-changed'));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notif: MigrationNotification) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === notif.id ? { ...item, read: true } : item))
    );
    setIsNotifOpen(false);
    navigate(`/migrations/${notif.jobId}`);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const isDashboard = location.pathname === '/';
  const isHistory = location.pathname === '/history';
  const isSettings = location.pathname === '/settings';

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0B1121] text-slate-900 dark:text-slate-50 flex font-sans transition-colors duration-200">
      
      {/* Sidebar */}
      <aside className="w-70 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col transition-colors duration-200">
        <div className="h-16 flex items-center px-5 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight hover:opacity-90 transition-opacity whitespace-nowrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-600">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 12 12 17 22 12" />
              <polyline points="2 17 12 22 22 17" />
            </svg>
            ACME
          </Link>

          <div className="ml-2.5 text-[9px] uppercase tracking-wider text-slate-500 font-semibold border-l border-slate-300 dark:border-slate-700 pl-2.5 leading-3">
            <div>API Contract</div>
            <div>Migration Engine</div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <Link 
            to="/" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              isDashboard 
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" strokeWidth={2.5} />
            Dashboard
          </Link>
          <Link 
            to="/history" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              isHistory 
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <CheckSquare className="w-5 h-5" strokeWidth={2} />
            Migration History
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Link 
            to="/settings" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              isSettings 
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium'
            }`}
          >
            <Settings className="w-5 h-5" strokeWidth={2} />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex items-center justify-end px-6 gap-5 transition-colors duration-200">
          
          {/* Notification Bell & Dropdown Popover */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsNotifOpen((prev) => !prev)}
              title="Notifications"
              className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/70 transition-colors"
            >
              <Bell className="w-5 h-5" strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none ring-2 ring-white dark:ring-[#0f172a] shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={clearNotifications}
                        title="Clear all"
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center text-xs text-slate-400">
                      No notifications yet. You'll be alerted here when a migration completes.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                          !notif.read ? 'bg-blue-50/40 dark:bg-blue-500/5' : ''
                        }`}
                      >
                        {notif.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {notif.repoName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Migration <span className="font-mono text-blue-600 dark:text-blue-400">{notif.jobId}</span>{' '}
                            {notif.status === 'COMPLETED' ? 'completed successfully.' : 'failed.'}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{notif.timestamp}</span>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-full p-1 border border-slate-200 dark:border-slate-700/50">
            <button 
              onClick={() => handleHeaderThemeChange(false)}
              className={`p-1.5 rounded-full transition-all duration-200 ${!isDark ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <Sun className="w-4 h-4" strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => handleHeaderThemeChange(true)}
              className={`p-1.5 rounded-full transition-all duration-200 ${isDark ? 'bg-[#1e293b] shadow-sm text-blue-400 border border-slate-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Moon className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>

          <div className="w-9 h-9 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center text-sm font-semibold tracking-wide shadow-sm">
            KS
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
