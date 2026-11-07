import { useMigrations } from '../../hooks/useMigrations';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle2, XCircle, Loader2, BarChart3, Plus } from 'lucide-react';

export default function DashboardScreen() {

  // migrations variable is used to store the migration summaries fetched from the backend API. The useMigrations hook provides the data, loading state, and error state for managing the API request.
  const { data: migrations, isLoading, error } = useMigrations();

  if (isLoading) {
    return <div className="p-6 text-slate-500">Loading dashboard metrics...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Failed to connect to backend on port 8081. Please check CORS configuration.</div>;
  }

  const totalCount = migrations?.length || 0;
  const completedCount = migrations?.filter(m => m.status === 'COMPLETED').length || 0;
  const failedCount = migrations?.filter(m => m.status === 'FAILED').length || 0;
  const inProgressCount = migrations?.filter(m => m.status === 'IN_PROGRESS').length || 0;

  const recentMigrations = migrations?.slice(0, 6) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Overview of API Contract Migrations</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-colors">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          New Migration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Migrations</div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalCount}</span>
            <BarChart3 className="w-8 h-8 text-blue-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed</div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedCount}</span>
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Failed</div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">{failedCount}</span>
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">In Progress</div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{inProgressCount}</span>
            <Loader2 className={`w-6 h-6 text-blue-500 ${inProgressCount > 0 ? 'animate-spin' : 'opacity-40'}`} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="font-bold text-slate-900 dark:text-white text-base">Recent Migrations</span>
          <Link to="/history" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            View All →
          </Link>
        </div>
        
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold text-xs uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
              <th className="py-3.5 px-6">Migration ID</th>
              <th className="py-3.5 px-6">Repository</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Started At</th>
              <th className="py-3.5 px-6">Time Taken</th>
              <th className="py-3.5 px-4 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {recentMigrations.map((job) => (
              <tr key={job.jobId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-6 font-semibold text-blue-600 dark:text-blue-400">{job.jobId}</td>
                <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium" title={job.repositoryUrl}>
                  {job.repoName}
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20' :
                    job.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20' :
                    'bg-red-50 text-red-700 dark:bg-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-500/20'
                  }`}>
                    {job.status === 'COMPLETED' && '✓'}
                    {job.status === 'IN_PROGRESS' && '●'}
                    {job.status === 'FAILED' && '✕'}
                    {job.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{job.startedAt}</td>
                <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{job.timeTaken}</td>
                <td className="py-4 px-4 text-right">
                  <button className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
