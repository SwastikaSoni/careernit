import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ContactUs from './pages/ContactUs';
import DashboardHome from './pages/DashboardHome';
import Placeholder from './pages/Placeholder';
import DepartmentList from './pages/departments/DepartmentList';
import StudentProfilePage from './pages/profile/StudentProfilePage';
import VerificationPage from './pages/verification/VerificationPage';
import AdminStudentsPage from './pages/dashboards/AdminStudentsPage';
import OfficersPage from './pages/officers/OfficersPage';
import CompaniesPage from './pages/companies/CompaniesPage';
import DrivesPage from './pages/drives/DrivesPage';
import BrowseDrivesPage from './pages/drives/BrowseDrivesPage';
import ApplicationsPage from './pages/applications/ApplicationsPage';
import MyApplicationsPage from './pages/applications/MyApplicationsPage';
import InterviewsPage from './pages/interviews/InterviewsPage';
import MyInterviewsPage from './pages/interviews/MyInterviewsPage';
import QuestionsPage from './pages/preparation/QuestionsPage';
import BrowseQuestionsPage from './pages/preparation/BrowseQuestionsPage';
import ResourcesPage from './pages/preparation/ResourcesPage';
import BrowseResourcesPage from './pages/preparation/BrowseResourcesPage';
import MockTestsPage from './pages/mockTests/MockTestsPage';
import BrowseMockTestsPage from './pages/mockTests/BrowseMockTestsPage';
import TakeTestPage from './pages/mockTests/TakeTestPage';
import TestResultPage from './pages/mockTests/TestResultPage';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import AnalyticsDashboard from './pages/dashboards/AnalyticsDashboard';
import UserProfilePage from './pages/profile/UserProfilePage';
import ReportsPage from './pages/reports/ReportsPage';
import OffersPage from './pages/offers/OffersPage';
import { useAuth } from './context/AuthContext';

const DrivesRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'student') return <BrowseDrivesPage />;
  return <DrivesPage />;
};

const InterviewsRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'student') return <MyInterviewsPage />;
  return <InterviewsPage />;
};

const QuestionsRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'student') return <BrowseQuestionsPage />;
  return <QuestionsPage />;
};

const ResourcesRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'student') return <BrowseResourcesPage />;
  return <ResourcesPage />;
};

const MockTestsRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'student') return <BrowseMockTestsPage />;
  return <MockTestsPage />;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <BrowserRouter>
          <AuthProvider>
            <SocketProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/contact" element={<ContactUs />} />

                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardHome />} />

                  {/* Admin Routes */}
                  <Route path="verification" element={<ProtectedRoute roles={['admin']}><VerificationPage /></ProtectedRoute>} />
                  <Route path="students" element={<ProtectedRoute roles={['admin']}><AdminStudentsPage /></ProtectedRoute>} />
                  <Route path="officers" element={<ProtectedRoute roles={['admin']}><OfficersPage /></ProtectedRoute>} />
                  <Route path="departments" element={<ProtectedRoute roles={['admin']}><DepartmentList /></ProtectedRoute>} />
                  <Route path="analytics" element={<ProtectedRoute roles={['admin']}><AnalyticsDashboard /></ProtectedRoute>} />

                  {/* Officer Routes */}
                  <Route path="companies" element={<ProtectedRoute roles={['placement_officer']}><CompaniesPage /></ProtectedRoute>} />
                  <Route path="applications" element={<ProtectedRoute roles={['placement_officer']}><ApplicationsPage /></ProtectedRoute>} />
                  <Route path="reports" element={<ProtectedRoute roles={['placement_officer']}><Placeholder /></ProtectedRoute>} />

                  {/* Student Routes */}
                  <Route path="my-profile" element={<ProtectedRoute roles={['student']}><StudentProfilePage /></ProtectedRoute>} />
                  <Route path="my-applications" element={<ProtectedRoute roles={['student']}><MyApplicationsPage /></ProtectedRoute>} />

                  {/* Shared — role-specific rendering */}
                  <Route path="drives" element={<DrivesRouter />} />
                  <Route path="interviews" element={<InterviewsRouter />} />
                  <Route path="offers" element={<OffersPage />} />
                  <Route path="questions" element={<QuestionsRouter />} />
                  <Route path="resources" element={<ResourcesRouter />} />
                  <Route path="mock-tests" element={<MockTestsRouter />} />
                  <Route path="mock-tests/:id/take" element={<ProtectedRoute roles={['student']}><TakeTestPage /></ProtectedRoute>} />
                  <Route path="mock-tests/:id/result" element={<TestResultPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="reports" element={<ProtectedRoute roles={['admin', 'placement_officer']}><ReportsPage /></ProtectedRoute>} />
                  <Route path="profile" element={<ProtectedRoute roles={['admin', 'placement_officer']}><UserProfilePage /></ProtectedRoute>} />
                </Route>

                {/* Redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </SocketProvider>
          </AuthProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;