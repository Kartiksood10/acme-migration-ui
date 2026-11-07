import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardScreen from './components/screens/DashboardScreen';
import MigrationHistoryScreen from './components/screens/MigrationHistoryScreen';

// Main App component that sets up the routing for the application. It uses React Router to define routes for the dashboard and migration history screens, all wrapped within the AppLayout for consistent layout and navigation.
export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardScreen />} />
        <Route path="/history" element={<MigrationHistoryScreen />} />
      </Routes>
    </AppLayout>
  );
}
