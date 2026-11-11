import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { MigrationDetailsUI, MigrationStatusResponse } from '../types/migration';

/**
 * Hook to fetch and poll live migration details from the Spring Boot backend.
 * Automatically stops polling when the migration reaches a terminal state.
 */
export function useMigrationDetails(jobId: string | undefined) {
  return useQuery<MigrationDetailsUI>({
    queryKey: ['migrationDetails', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error("Job ID is required");
      
      // Fetch migration details from the backend API
      const response = await api.get<MigrationStatusResponse>(`/migrations/${jobId}`);
      const data = response.data;
      
      const totalEndpoints = data.endpointLogs?.length || 0;
      const migratedEndpoints = data.endpointLogs?.filter(
        (log) => log.status?.toUpperCase() === 'SUCCESS'
      ).length || 0;
      const failedEndpoints = data.endpointLogs?.filter(
        (log) => log.status?.toUpperCase() === 'FAILED'
      ).length || 0;
      const totalPrs = data.generatedPrs?.length || 0;

      // Extract repo name from URL
      const repoName = data.repositoryUrl?.split('/').pop()?.replace('.git', '') || 'Unknown Repo';

      return {
        ...data,
        repoName,
        metrics: {
          total: totalEndpoints,
          migrated: migratedEndpoints,
          failed: failedEndpoints,
          prs: totalPrs
        }
      };
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Stop polling if the job is completely finished or has failed
      if (status === 'COMPLETED' || status === 'FAILED') {
        return false; 
      }
      return 3000;
    },
  });
}
