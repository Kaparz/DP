import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import PrivateRoute      from './PrivateRoute';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import DashboardPage     from './pages/DashboardPage';
import ProjectsPage      from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import BoardPage         from './pages/BoardPage';
import Navbar            from './components/Navbar';
import './styles.css';

const AppRoutes = () => {
  const { pathname } = useLocation();
  const hideNavbar    = pathname === '/login' || pathname === '/register';

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* публичные */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* защищённые */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <ProjectsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects/new"
          element={
            <PrivateRoute roles={['admin', 'manager']}>
              <CreateProjectPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects/:id/board"
          element={
            <PrivateRoute>
              <BoardPage />
            </PrivateRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
