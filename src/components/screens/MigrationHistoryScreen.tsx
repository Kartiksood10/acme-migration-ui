import { useState } from 'react';
import { useMigrations } from '../../hooks/useMigrations';
import { Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MigrationHistoryScreen() {
  const { data: migrations, isLoading, error } = useMigrations();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Show 10 rows per page

  if (isLoading) {
    return <div className="p-6 text-slate-500">Loading migration history...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Failed to connect to backend on port 8081.</div>;
  }

  // Filter migrations based on search input
  const filteredMigrations = migrations?.filter(job => 
    job.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.repoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.repositoryUrl.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalItems = filteredMigrations.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Slice array for current page
  const startIndex = (currentPage - 1) * pageSize;
  const currentTableData = filteredMigrations.slice(startIndex, startIndex + pageSize);
  const endingIndex = Math.min(startIndex + pageSize, totalItems);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Migration History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Complete history of all API Contract Migrations</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input 
            type="text"
            placeholder="Search by repository or migration ID"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
            className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
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
            {currentTableData.map((job) => (
              <tr key={job.jobId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-6 font-semibold text-blue-600 dark:text-blue-400">{job.jobId}</td>
                <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium" title={job.repositoryUrl}>
                  {job.repoName}
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20' :
                    job.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20' :
                    'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/50 dark:border-red-500/20'
                  }`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{job.startedAt}</td>
                <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{job.timeTaken}</td>
                <td className="py-4 px-4 text-right">
                  <button className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {currentTableData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No matching migrations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Dynamic Pagination Controls */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Showing {totalItems > 0 ? startIndex + 1 : 0}–{endingIndex} of {totalItems}</span>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === page 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
