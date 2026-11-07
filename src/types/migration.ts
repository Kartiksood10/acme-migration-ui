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
