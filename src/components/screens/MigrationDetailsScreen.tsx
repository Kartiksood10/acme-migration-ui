import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMigrationDetails } from '../../hooks/useMigrationDetails';
import { 
  ArrowLeft, 
  Check, 
  Loader2, 
  GitPullRequest, 
  ExternalLink, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

// Define the steps of the migration process for the progress stepper
const MIGRATION_STEPS = [
  { id: 'PROCESSING', label: 'Upload Received' },
  { id: 'CONTRACT_ANALYSIS', label: 'Contract Analysis' },
  { id: 'PLANNING', label: 'Migration Planning' },
  { id: 'CODE_GENERATION', label: 'Code Migration & Validation' },
  { id: 'COMPLETED', label: 'Pull Request Creation' }
];

type TabType = 'overview' | 'endpoints' | 'prs';

export default function MigrationDetailsScreen() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Define the tabs for the migration details screen
  const TABS: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'endpoints', label: 'Endpoint Results' },
    { id: 'prs', label: 'Generated PRs' }
  ];

  const { data: job, isLoading, isError } = useMigrationDetails(jobId);

  // State to track seconds elapsed for the live timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    // If the job is finished or missing a start time, do not run the timer
    if (!job?.triggeredAt || job.status === 'COMPLETED' || job.status === 'FAILED') {
      return;
    }

    const startTime = new Date(job.triggeredAt).getTime();

    const interval = setInterval(() => {
      setSecondsElapsed(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [job?.triggeredAt, job?.status]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium dark:text-slate-400">Loading migration details...</p>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-red-500">
        <XCircle className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Migration Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Could not load details for {jobId}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentStepIndex = MIGRATION_STEPS.findIndex(s => s.id === job.status);
  const progressPercentage = currentStepIndex === -1 ? 0 : (currentStepIndex / (MIGRATION_STEPS.length - 1)) * 100;
  const isFailed = job.status === 'FAILED';
  
// Helper to cleanly format any number of total seconds into "X min Y secs"
const formatTime = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  
  if (mins === 0) {
    return `${secs} secs`;
  }
  return `${mins} min ${secs} secs`;
};

// Derives the display string directly during render
// eslint-disable-next-line no-useless-assignment
let executionTimeFormatted = '0 secs';

if (job.status === 'COMPLETED' || job.status === 'FAILED') {
  const finalTotalSeconds = Math.round((job.executionTimeMinutes || 0) * 60);
  executionTimeFormatted = formatTime(finalTotalSeconds);
} else {
  executionTimeFormatted = formatTime(secondsElapsed);
}


  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Migration Details</h1>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="text-slate-500 dark:text-slate-400">
            Execution Time: <span className="text-slate-900 dark:text-slate-200">{executionTimeFormatted}</span>
          </span>
          
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            isFailed ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/50 dark:border-red-500/20' :
            job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20' :
            'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20'
          }`}>
            {isFailed ? <XCircle className="w-4 h-4" /> : job.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
            {job.status === 'IN_PROGRESS' || job.status === 'PROCESSING' || job.status === 'CONTRACT_ANALYSIS' || job.status === 'PLANNING' || job.status === 'CODE_GENERATION' ? 'In Progress' : job.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Sub-header Context */}
      <div className="flex items-center text-sm">
        <span className="text-slate-600 dark:text-slate-400">
          Repository: <a href={job.repositoryUrl} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">{job.repoName}</a>
        </span>
        <span className="mx-3 text-slate-300 dark:text-slate-600">|</span>
        <span className="text-slate-600 dark:text-slate-400">
          Task ID: <span className="text-blue-600 dark:text-blue-400 font-medium">{job.jobId}</span>
        </span>
      </div>

      {/* Progress Stepper */}
      <div className="py-8 px-4">
        <div className="relative flex items-center justify-between w-full max-w-4xl mx-auto">
          {/* Background Track Line */}
          <div className="absolute left-0 top-5 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
          {/* Active Progress Line */}
          <div 
            className={`absolute left-0 top-5 -translate-y-1/2 h-1 rounded-full transition-all duration-700 ${isFailed ? 'bg-red-500' : 'bg-emerald-500'}`} 
            style={{ width: `${progressPercentage}%` }} 
          />

          {MIGRATION_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex || job.status === 'COMPLETED';
            const isCurrent = index === currentStepIndex && !isFailed && job.status !== 'COMPLETED';
            const isError = isFailed && index === currentStepIndex;

            return (
              <div key={step.id} className="relative flex flex-col items-center group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-[#0f172a] z-10 transition-colors duration-300 ${
                  isCompleted ? 'bg-emerald-500' :
                  isCurrent ? 'bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/40' :
                  isError ? 'bg-red-500 ring-4 ring-red-100 dark:ring-red-900/40' :
                  'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> :
                   isCurrent ? <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" /> : 
                   isError ? <XCircle className="w-5 h-5 text-white" strokeWidth={2} /> : null}
                </div>
                <span className={`absolute top-14 text-xs font-semibold text-center w-32 ${
                  isCompleted || isCurrent ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mt-16">
        <div className="flex gap-8 border-b border-slate-200 dark:border-slate-800 px-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-semibold transition-colors relative ${
                activeTab === tab.id 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="pt-6 bg-slate-50/50 dark:bg-transparent rounded-b-2xl">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-5">
                  <div className="relative flex items-center justify-center w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-100 dark:border-blue-500/20">
                     {job.status === 'COMPLETED' ? (
                       <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                     ) : isFailed ? (
                       <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                     ) : (
                       <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                     )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {isFailed ? 'Migration Failed' : job.status === 'COMPLETED' ? 'Migration Completed' : `${MIGRATION_STEPS.find(s => s.id === job.status)?.label || 'Processing...'} in progress`}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {isFailed 
                        ? (job.errorMessage || 'An error occurred during migration.') 
                        : job.status === 'CODE_GENERATION' 
                          ? 'Agent is applying code patches in the Docker sandbox...' 
                          : job.status === 'COMPLETED'
                            ? 'All endpoints have been processed and pull requests are ready.'
                            : 'Analyzing repository and determining migration strategy...'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Total Endpoints', value: job.metrics.total === 0 ? '--' : job.metrics.total },
                    { label: 'Migrated', value: job.metrics.total === 0 ? '--' : job.metrics.migrated },
                    { label: 'Failed', value: job.metrics.total === 0 ? '--' : job.metrics.failed },
                    { label: 'Generated PRs', value: job.metrics.prs === 0 && job.status !== 'COMPLETED' ? '--' : job.metrics.prs },
                  ].map(metric => (
                    <div key={metric.label} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-center">
                      <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">{metric.value}</div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Job Configuration */}
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Job Configuration</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 mb-1">Repository</span>
                    <span className="font-medium text-slate-900 dark:text-slate-200 break-all">{job.repoName}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 mb-1">Source</span>
                    <span className="font-medium text-slate-900 dark:text-slate-200">{job.sourceType}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 mb-1">Target</span>
                    <span className="font-medium text-slate-900 dark:text-slate-200">{job.targetType}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 mb-1">Triggered At</span>
                    <span className="font-medium text-slate-900 dark:text-slate-200">
                      {job.triggeredAt ? new Date(job.triggeredAt).toLocaleString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENDPOINT RESULTS */}
          {activeTab === 'endpoints' && (
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold bg-slate-50 dark:bg-slate-800/50">
                    <th className="py-4 px-6">Endpoint</th>
                    <th className="py-4 px-6 w-48">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {(!job.endpointLogs || job.endpointLogs.length === 0) && (
                    <tr>
                      <td colSpan={2} className="py-6 px-6 text-center text-slate-500 dark:text-slate-400">
                        No endpoints have been processed yet.
                      </td>
                    </tr>
                  )}
                  {job.endpointLogs?.map((ep, i) => {
                    const isSuccess = ep.status?.toUpperCase() === 'SUCCESS';
                    const displayStatus = isSuccess ? 'Success' : 'Failed';

                    return (
                      <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-200">{ep.endpointName}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                            isSuccess 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' 
                              : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                          }`}>
                            {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {displayStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: GENERATED PRs */}
          {activeTab === 'prs' && (
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Generated Pull Requests</h3>
              <div className="space-y-4">
                {job.generatedPrs?.map((prUrl, i) => {
                  const prNumber = prUrl.split('/').pop();
                  return (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl">
                          <GitPullRequest className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          {/* Make the main title the clickable link with no raw URL clutter */}
                          <a 
                            href={prUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 transition-colors"
                          >
                            Pull Request #{prNumber || (i + 1)}
                            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400" />
                          </a>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Target Repository: <span className="font-medium text-slate-700 dark:text-slate-300">{job.repoName}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right-aligned action button */}
                      <a 
                        href={prUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        View on GitHub
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
                {(!job.generatedPrs || job.generatedPrs.length === 0) && (
                  <div className="text-slate-500 dark:text-slate-400 text-sm py-4">No pull requests have been generated yet.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
