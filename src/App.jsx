import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Header, Footer, DashboardNavigation } from './Components/index.js';
import './App.css';

// Routes where the public footer should be suppressed even if unauthenticated
// (e.g. the OAuth callback page is layout-free by design).
const NO_FOOTER_ROUTES = ['/auth/callback'];

// Dashboard-style routes that use a full-bleed layout (Sidebar handles their
// own scrolling; the top-level <main> must not add extra padding).
const FULL_BLEED_ROUTES = ['/dashboard', '/random-chat', '/waiting-room', '/watch-party'];

export default function App() {
  const authStatus = useSelector((state) => state.auth.status);
  const location = useLocation();

  const pathname = location.pathname;
  const showFooter = !authStatus && !NO_FOOTER_ROUTES.some((r) => pathname.startsWith(r));
  const isFullBleed = FULL_BLEED_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">

      {authStatus ? <DashboardNavigation /> : <Header />}

      <main className={`flex-1 ${isFullBleed ? '' : 'max-w-7xl mx-auto w-full px-6'}`}>
        <Outlet />
      </main>

      {showFooter && <Footer />}

    </div>
  );
}