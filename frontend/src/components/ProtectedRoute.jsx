import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role.toUpperCase())) {
    // Redirect to their own dashboard if role doesn't match
    const userRole = user.role.toUpperCase();
    const dashboardMap = {
      MAHASISWA: '/mahasiswa/dashboard',
      DOSEN: '/dosen/dashboard',
      STAFF: '/staff/dashboard',
    };
    return <Navigate to={dashboardMap[userRole] || '/'} replace />;
  }

  // Jika ada children (rute biasa), render children. 
  // Jika tidak (rute parent), render Outlet untuk children bersarang.
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
