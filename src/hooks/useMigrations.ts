import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { MigrationSummaryDTO, RawMigrationSummaryDTO } from '../types/migration';

// Helper function to extract the repository name from a given URL
function extractRepoName(url?: string): string {
  if (!url) return 'unknown-service';
  const cleanUrl = url.replace(/\.git$/, '');
  const parts = cleanUrl.split('/');
  return parts[parts.length - 1] || url;
}

// Helper function to format a timestamp string into a more readable format and return both the formatted string and the raw timestamp in milliseconds
function formatTimestamp(timestamp?: string): { formatted: string; raw: number } {
  if (!timestamp) return { formatted: 'N/A', raw: 0 };
  try {
    const date = new Date(timestamp);
    const rawTime = date.getTime();
    if (isNaN(rawTime)) return { formatted: timestamp, raw: 0 };
    
    return {
      formatted: date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      raw: rawTime,
    };
  } catch {
    return { formatted: timestamp, raw: 0 };
  }
}

// Custom hook to fetch and manage migration summaries from the backend API. It uses React Query for data fetching, caching, and automatic refetching every 5 seconds. The hook transforms the raw data into a more frontend-friendly format, including extracting repository names and formatting timestamps for display.
export function useMigrations() {
  return useQuery<MigrationSummaryDTO[]>({
    // Query key for caching and refetching same data
    queryKey: ['migrations'],
    queryFn: async () => {

      // Fetch the raw migration data from the backend API (http://localhost:8081/api/v1/migrations)
      // We always define the return type while calling api.get() to ensure TypeScript knows the expected structure of the response data.
      const response = await api.get<RawMigrationSummaryDTO[]>('/migrations');
      
      // Map the raw data to the frontend-friendly structure
      const mapped = (response.data || []).map((item) => {
        const fullUrl = item.repositoryUrl || '';
        const timeVal = item.executionTimeMinutes ?? 0;
        const formattedTime = timeVal > 0 ? `${timeVal.toFixed(2)} min` : '0.00 min';
        const parsedDate = formatTimestamp(item.createdAt);

        let cleanStatus = item.status?.toUpperCase() || 'COMPLETED';
        // Map backend's 'PROCESSING' to the frontend's expected 'IN_PROGRESS'
        if (cleanStatus === 'PROCESSING') {
          cleanStatus = 'IN_PROGRESS';
        }

        // Return the mapped object with additional fields for frontend display
        return {
          jobId: item.jobId || 'N/A',
          repositoryUrl: fullUrl,
          repoName: extractRepoName(fullUrl),
          status: cleanStatus as 'IN_PROGRESS' | 'COMPLETED' | 'FAILED',
          executionTimeMinutes: timeVal,
          startedAt: parsedDate.formatted,
          timeTaken: formattedTime,
          rawDate: parsedDate.raw,
        };
      });

      // Sort by most recent first (descending order of timestamp)
      return mapped.sort((a, b) => b.rawDate - a.rawDate);
    },
    refetchInterval: 5000,
  });
}
