import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';

// Create a new instance of QueryClient for managing server state and caching in the application
const queryClient = new QueryClient();

// Render the root of the React application, wrapping it with StrictMode for highlighting potential problems, QueryClientProvider for React Query state management, and BrowserRouter for routing capabilities. The App component serves as the main entry point of the application.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
