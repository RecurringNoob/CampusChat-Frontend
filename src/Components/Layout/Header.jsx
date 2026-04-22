import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Logo from './Logo';

export default function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't render the public header at all when authenticated —
  // App.jsx will swap in DashboardNavigation instead.
  if (authStatus) return null;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        {/* Centre nav links — add more as needed */}
        <nav className="hidden md:flex items-center gap-1 text-sm text-zinc-400">
          {[
            { label: 'Home',    to: '/' },
            { label: 'About',   to: '/about' },
          ].map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-lg transition-colors duration-150
                ${location.pathname === to
                  ? 'text-white bg-zinc-800/70'
                  : 'hover:text-white hover:bg-zinc-800/40'}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-full text-sm text-zinc-300 hover:text-white
                       hover:bg-zinc-800/60 transition-colors duration-150"
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600
                       text-white text-sm font-medium rounded-full
                       transition-colors duration-150 shadow-lg shadow-emerald-900/30"
          >
            Sign up
          </button>
        </div>

      </div>
    </header>
  );
}