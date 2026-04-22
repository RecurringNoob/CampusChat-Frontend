import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout as logoutAction } from '../../store/authSlice';
import { logout as logoutAPI } from '../../api/auth.js';
import { LogOut } from 'lucide-react';

export default function LogoutBtn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await logoutAPI();        // clears httpOnly cookie on backend
    } catch {
      // proceed with local logout even if the API call fails
    } finally {
      dispatch(logoutAction()); // was: dispatch(logout) — missing the () call
      navigate('/');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      aria-label="Log out"
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400
                 hover:text-white hover:bg-zinc-800/70 transition-colors duration-150
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <LogOut size={15} strokeWidth={2} />
      <span className="hidden md:inline">{loading ? 'Logging out…' : 'Log out'}</span>
    </button>
  );
}