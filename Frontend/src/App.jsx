import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import AgentsPage from './pages/AgentsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import MasterAccountsPage from './pages/MasterAccountsPage.jsx';
import MasterGroupsPage from './pages/MasterGroupsPage.jsx';
import MasterTypesPage from './pages/MasterTypesPage.jsx';
import AdjustmentsPage from './pages/AdjustmentsPage.jsx';
import LogsPage from './pages/LogsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="master/accounts" element={<MasterAccountsPage />} />
            <Route path="master/groups" element={<MasterGroupsPage />} />
            <Route path="master/types" element={<MasterTypesPage />} />
            <Route path="adjustments" element={<AdjustmentsPage />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
