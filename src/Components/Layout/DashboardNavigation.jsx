import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { NotificationPanel } from './NotificationPanel';
import { SearchBar } from './SearchBar';
import Logo from './Logo';
import LogoutBtn from './LogoutBtn';

// Derive initials for the avatar from the stored user object.
function getInitials(userData) {
  if (!userData) return '?';
  if (userData.fullName) {
    const parts = userData.fullName.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }
  if (userData.username) return userData.username[0].toUpperCase();
  if (userData.email)    return userData.email[0].toUpperCase();
  return '?';
}

export function DashboardNavigation() {
  const navigate = useNavigate();
  const userData = useSelector((s) => s.auth.userData);

  const initials = getInitials(userData);
  const displayName = userData?.fullName?.split(' ')[0]
    ?? userData?.username
    ?? userData?.email?.split('@')[0]
    ?? 'You';

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4 justify-between">

        {/* Left — logo */}
        <Link to="/dashboard" className="shrink-0">
          <Logo />
        </Link>

        {/* Centre — search */}
        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>

        {/* Right — actions + user */}
        <div className="flex items-center gap-1">
          <NotificationPanel />
          <LogoutBtn />

          {/* Avatar — links to profile */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 ml-2 pl-3 border-l border-zinc-800
                       hover:opacity-80 transition-opacity duration-150"
            aria-label="Go to profile"
          >
            {userData?.avatar && userData.avatar !== 'default-avatar.png' ? (
              <img
                src={userData.avatar}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-zinc-700"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30
                           flex items-center justify-center text-emerald-400
                           text-xs font-semibold tracking-wide select-none"
              >
                {initials}
              </div>
            )}
            <span className="hidden md:inline text-sm font-medium text-zinc-200">
              {displayName}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
}