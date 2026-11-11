// Type definitions for migration-related data transfer objects (DTOs) used in the application. These interfaces define the structure of the data received from the backend API

// MigrationSummaryDTO represents the frontend-friendly structure of a migration summary, including additional fields for display purposes
export interface MigrationSummaryDTO {
  jobId: string;
  repositoryUrl: string;
  repoName: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  executionTimeMinutes: number;
  startedAt: string;
  timeTaken: string;
  rawDate: number;
}

// Exact migration summary DTO received from the backend API
export interface RawMigrationSummaryDTO {
  jobId: string;
  repositoryUrl?: string;
  status: string;
  executionTimeMinutes: number;
  createdAt?: string;
}

// Represents the state of our React form before submission
export interface MigrationTriggerForm {
  repositoryUrl: string;
  sourceType: 'FILE' | 'URL';
  targetType: 'FILE' | 'URL';
  sourceUrl?: string;
  sourceFile?: File | null;
  targetUrl?: string;
  targetFile?: File | null;
}

// Represents the 202 Accepted response from the backend
export interface MigrationTriggerResponseDTO {
  job_id: string;
  status: string;
  message: string;
}

// Endpoint status log received from backend API
export interface EndpointLogDTO {
  endpointName: string;
  status: string;
}

// Represents the detailed migration status response received from the backend API
export interface MigrationStatusResponse {
  jobId: string;
  status: string;
  errorMessage?: string;
  executionTimeMinutes: number;
  repositoryUrl: string;
  sourceType: string;
  targetType: string;
  triggeredAt: string;
  generatedPrs: string[];
  endpointLogs: EndpointLogDTO[];
}

// Represents the frontend-friendly structure of detailed migration information, including additional fields for display purposes
export interface MigrationDetailsUI extends MigrationStatusResponse {
  repoName: string;
  metrics: {
    total: number;
    migrated: number;
    failed: number;
    prs: number;
  };
}
