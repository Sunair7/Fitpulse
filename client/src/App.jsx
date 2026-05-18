import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AppLayout } from './components/AppLayout.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { WorkoutsPage } from './pages/WorkoutsPage.jsx';
import { WorkoutFormPage } from './pages/WorkoutFormPage.jsx';
import { NutritionPage } from './pages/NutritionPage.jsx';
import { GoalsPage } from './pages/GoalsPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { SupportPage } from './pages/SupportPage.jsx';
import { SearchPage } from './pages/SearchPage.jsx';
import { RemindersPage } from './pages/RemindersPage.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/workouts" element={<WorkoutsPage />} />
        <Route path="/workouts/log" element={<WorkoutFormPage />} />
        <Route path="/workouts/:id/edit" element={<WorkoutFormPage />} />
        <Route path="/nutrition" element={<NutritionPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
