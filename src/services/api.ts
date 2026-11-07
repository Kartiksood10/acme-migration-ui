import axios from 'axios';

// Create an Axios instance with a base URL and default headers for making API requests to the backend server. This instance can be used throughout the application to interact with the backend API endpoints.
export const api = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
