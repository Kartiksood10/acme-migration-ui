import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { MigrationTriggerForm, MigrationTriggerResponseDTO } from '../types/migration';

export function useStartMigration() {
  // We access the QueryClient so we can force the dashboard to refresh after a successful POST
  const queryClient = useQueryClient();

  // useMutation is a React Query hook that handles asynchronous operations (like POST requests) and manages their state (loading, success, error). It provides a mutate function to trigger the mutation and automatically handles caching and invalidation.
  return useMutation({
    // mutationFn contains the actual asynchronous network request
    mutationFn: async (data: MigrationTriggerForm) => {
      // 1. Initialize native browser FormData (required for multipart/form-data)
      const formData = new FormData();

      // 2. Append core string fields exactly matching the Spring Boot DTO field names
      formData.append('repositoryUrl', data.repositoryUrl);

      // FIX: Map React's 'FILE' state to Java backend's expected 'UPLOAD' string
      formData.append('sourceContractType', data.sourceType === 'FILE' ? 'UPLOAD' : 'URL');
      formData.append('targetContractType', data.targetType === 'FILE' ? 'UPLOAD' : 'URL');

      // 3. Conditionally append Source files or URLs based on the user's toggle selection
      if (data.sourceType === 'URL' && data.sourceUrl) {
        formData.append('sourceUrl', data.sourceUrl);
      } else if (data.sourceType === 'FILE' && data.sourceFile) {
        formData.append('sourceFile', data.sourceFile);
      }

      // 4. Conditionally append Target files or URLs
      if (data.targetType === 'URL' && data.targetUrl) {
        formData.append('targetUrl', data.targetUrl);
      } else if (data.targetType === 'FILE' && data.targetFile) {
        formData.append('targetFile', data.targetFile);
      }

      // 5. Send POST request, explicitly setting the multipart header
      // Define the return type defined in the backend while calling api.post()
      const response = await api.post<MigrationTriggerResponseDTO>('/migrate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
    
    // onSuccess runs automatically when the backend returns a 2xx status code
    onSuccess: () => {
      // Invalidate the 'migrations' cache. This forces useMigrations() to instantly 
      // fetch fresh data, making the new job appear on the dashboard automatically!
      queryClient.invalidateQueries({ queryKey: ['migrations'] });
    },
  });
}
