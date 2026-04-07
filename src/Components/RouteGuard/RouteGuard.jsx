import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

/** Redirects to /login if the user is not authenticated */
export function ProtectedRoute() {
  const status = useSelector((state) => state.auth.status);
  return status ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Redirects to /dashboard if the user is already authenticated.
 *  Prevents logged-in users from seeing /login or /signup again. */
export function GuestRoute() {
  const status = useSelector((state) => state.auth.status);
  return status ? <Navigate to="/dashboard" replace /> : <Outlet />;
}