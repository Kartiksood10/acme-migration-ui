import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Settings, Bell, Moon, Sun } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

// Main App layout component that wraps the entire application, providing a sidebar and header for navigation and theme toggling across the application. It uses React Router for navigation and manages dark/light theme state.
export default function AppLayout({ children }: AppLayoutProps) {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const isDashboard = location.pathname === '/';
  const isHistory = location.pathname === '/history';

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
          <Link to="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg font-medium text-sm transition-colors">
            <Settings className="w-5 h-5" strokeWidth={2} />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex items-center justify-end px-6 gap-5 transition-colors duration-200">
          <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
            <Bell className="w-5 h-5" strokeWidth={2} />
          </button>
          
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-full p-1 border border-slate-200 dark:border-slate-700/50">
            <button 
              onClick={() => setIsDark(false)}
              className={`p-1.5 rounded-full transition-all duration-200 ${!isDark ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <Sun className="w-4 h-4" strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => setIsDark(true)}
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
