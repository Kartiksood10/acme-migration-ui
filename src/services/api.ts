import axios from 'axios';

// Create an Axios instance with a base URL and default headers for making API requests to the backend server. This instance can be used throughout the application to interact with the backend API endpoints.
export const api = axios.create({
  // Uses the .env variable if it exists, otherwise falls back to localhost
  baseURL: import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

