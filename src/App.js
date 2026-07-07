import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login            from './pages/Login';
import Dashboard        from './pages/Dashboard';
import Submit           from './pages/Submit';
import Approvals        from './pages/Approvals';
import Admin            from './pages/Admin';
import Settings         from './pages/Settings';
import DirectorateDetail from './pages/DirectorateDetail';

function ProtectedRoute({ children, allowedRoles }) {
  const { role } = useApp();
  if (!role) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/submit"    element={<ProtectedRoute><Submit /></ProtectedRoute>} />
      <Route path="/approvals" element={<ProtectedRoute allowedRoles={['owner','admin']}><Approvals /></ProtectedRoute>} />
      <Route path="/admin"     element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
      <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/directorate/:directorate" element={<ProtectedRoute><DirectorateDetail /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
