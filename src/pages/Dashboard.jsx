import { useReducer, useEffect } from 'react';
import {
  Users, Clock, Zap, WifiOff, RefreshCw, ArrowRight,
  Video, Music, Plus, ChevronRight, Sparkles,
} from 'lucide-react';
import { Sidebar } from '../Components/Layout/Sidebar';
import { DashboardSection } from '../Components/Dashboard/DashboardSection';
import { StatCard } from '../Components/Dashboard/StatCard';
import { PartyCard } from '../Components/Dashboard/PartyCard';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../store/authSlice';
import axiosInstance from '../api/axios';

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return (
    <div className={`rounded-xl bg-zinc-800/50 animate-pulse ${className}`} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick-action pill button
// ─────────────────────────────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, href = '#', accent = false }) {
  return (
    <a
      href={href}
      className={`
        group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200 border
        ${accent
          ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-400 hover:border-emerald-400'
          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600 hover:text-white'}
      `}
    >
      <Icon size={15} strokeWidth={2} />
      {label}
      <ArrowRight size={13} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150" />
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Interest tag
// ─────────────────────────────────────────────────────────────────────────────
function InterestTag({ label, muted = false }) {
  if (muted) {
    return (
      <span className="inline-flex items-center gap-1 bg-zinc-800/60 text-zinc-500 border border-zinc-700/60 rounded-full px-3 py-1 text-xs cursor-pointer hover:border-emerald-500/40 hover:text-emerald-400 transition-colors">
        <Plus size={10} strokeWidth={2.5} />
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 text-xs font-medium">
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state card
// ─────────────────────────────────────────────────────────────────────────────
function EmptyCard({ icon: Icon, title, body, action, actionHref = '#' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 rounded-2xl border border-dashed border-zinc-800 text-center">
      <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-500">
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-400">{title}</p>
        <p className="text-xs text-zinc-600 mt-0.5">{body}</p>
      </div>
      {action && (
        <a
          href={actionHref}
          className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
        >
          {action}
          <ChevronRight size={12} />
        </a>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section header — consistent across all panels
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({ title, action, actionHref = '#' }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-zinc-300 tracking-wide uppercase">
        {title}
      </h2>
      {action && (
        <a
          href={actionHref}
          className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
        >
          {action}
          <ChevronRight size={12} />
        </a>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getFirstName(userData) {
  if (!userData) return '';
  if (userData.fullName) return userData.fullName.split(' ')[0];
  if (userData.username) return userData.username;
  if (userData.email) return userData.email.split('@')[0];
  return 'there';
}

function fmt(val, fallback = '—') {
  if (val === null || val === undefined) return fallback;
  return String(val);
}

function getRelativeDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function fetchReducer(state, action) {
  switch (action.type) {
    case 'LOADING': return { loading: true, error: null };
    case 'SUCCESS': return { loading: false, error: null };
    case 'ERROR':   return { loading: false, error: action.payload };
    default:        return state;
  }
}

const SUGGESTED_INTERESTS = ['Music', 'Film', 'Tech', 'Sports', 'Art', 'Design'];

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const dispatch = useDispatch();
  const userData = useSelector((s) => s.auth.userData);
  const accessToken = useSelector((s) => s.auth.accessToken);

  const [fetchState, dispatchFetch] = useReducer(fetchReducer, {
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    dispatchFetch({ type: 'LOADING' });

    axiosInstance
      .get('/auth/me')
      .then((res) => {
        if (!cancelled) {
          dispatch(updateUser(res.data));
          dispatchFetch({ type: 'SUCCESS' });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          dispatchFetch({
            type: 'ERROR',
            payload: err?.response?.data?.error || 'Could not refresh profile.',
          });
        }
      });

    return () => { cancelled = true; };
  }, [accessToken, dispatch]);

  // ── Derived data ────────────────────────────────────────────────────────────
  const firstName     = getFirstName(userData);
  const interests     = userData?.interests ?? [];
  const friendsCount  = userData?.friends?.length ?? null;
  const hostingPoints = userData?.hostingPoints ?? null;

  const isLoading     = fetchState.loading && !userData;

  const stats = [
    {
      label: 'Connections',
      value: friendsCount !== null ? fmt(friendsCount) : '—',
      icon: Users,
      sub: 'total friends',
    },
    {
      label: 'Hosting Points',
      value: hostingPoints !== null ? fmt(hostingPoints) : '—',
      icon: Zap,
      sub: 'earned so far',
    },
    {
      label: 'Last Active',
      value: getRelativeDate(userData?.lastActive),
      icon: Clock,
      sub: 'session',
    },
  ];

  const upcomingParties = []; // swap when persistence API exists

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">

          {/* ── Stale-data warning ──────────────────────────────────────────── */}
          {fetchState.error && (
            <div className="flex items-center gap-2.5 text-xs text-amber-400 bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-2.5">
              <WifiOff size={13} className="shrink-0" />
              <span>{fetchState.error} — showing cached data.</span>
            </div>
          )}

          {/* ── Welcome ─────────────────────────────────────────────────────── */}
          <section>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-medium text-emerald-500 tracking-widest uppercase">
                      CampusChat
                    </p>
                    {fetchState.loading && (
                      <RefreshCw size={11} className="text-zinc-600 animate-spin" />
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Hey, {firstName || 'there'}{' '}
                    <span className="inline-block animate-[wave_1.5s_ease-in-out_1]">👋</span>
                  </h1>
                  <p className="text-zinc-500 text-sm mt-1.5">
                    {userData?.university
                      ? `${userData.university} · `
                      : ''}
                    {userData?.major || 'Student'} ·{' '}
                    <span className="text-emerald-500/80">verified</span>
                  </p>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <QuickAction icon={Video}  label="Random chat"    href="/waiting-room" accent />
                  <QuickAction icon={Music}  label="Watch party"    href="/watch-party" />
                  <QuickAction icon={Sparkles} label="Discover"     href="/discover" />
                </div>
              </div>
            )}
          </section>

          {/* ── Stat cards ──────────────────────────────────────────────────── */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-28" />
                  ))
                : stats.map((s) => (
                    <div
                      key={s.label}
                      className="flex flex-col justify-between bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                          {s.label}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                          <s.icon size={14} strokeWidth={2} />
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white tabular-nums">{s.value}</p>
                        <p className="text-xs text-zinc-600 mt-0.5">{s.sub}</p>
                      </div>
                    </div>
                  ))}
            </div>
          </section>

          {/* ── Connections + Interests ──────────────────────────────────────── */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Connections — wider */}
            <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6">
              <SectionHeader title="Connections" action="Find people" actionHref="/discover" />

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-xl" />
                  ))}
                </div>
              ) : friendsCount && friendsCount > 0 ? (
                <div>
                  <p className="text-xs text-zinc-600 mb-3">
                    {friendsCount} connection{friendsCount !== 1 ? 's' : ''}
                  </p>
                  {/* When a friends endpoint is available, map userData.friends here */}
                  <EmptyCard
                    icon={Users}
                    title="Full profiles coming soon"
                    body="Friend details will appear here once the endpoint is ready."
                  />
                </div>
              ) : (
                <EmptyCard
                  icon={Users}
                  title="No connections yet"
                  body="Jump into a random chat to meet fellow students."
                  action="Start chatting"
                  actionHref="/waiting-room"
                />
              )}
            </div>

            {/* Interests — narrower */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6">
              <SectionHeader title="Interests" action="Edit profile" actionHref="/profile" />

              {isLoading ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-16 rounded-full" />
                  ))}
                </div>
              ) : interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {interests.map((tag) => (
                    <InterestTag key={tag} label={tag} />
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-xs text-zinc-600 mb-3">
                    Add interests to get better matches.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_INTERESTS.map((s) => (
                      <InterestTag key={s} label={s} muted />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Upcoming parties ────────────────────────────────────────────── */}
          <section className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6">
            <SectionHeader title="Upcoming Parties" action="Schedule new" actionHref="/watch-party" />

            {upcomingParties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingParties.map((p, i) => (
                  <PartyCard key={i} party={p} />
                ))}
              </div>
            ) : (
              <EmptyCard
                icon={Music}
                title="No parties scheduled"
                body="Create a watch party and invite friends to watch together."
                action="Create a party"
                actionHref="/watch-party"
              />
            )}
          </section>

          {/* ── DEV snapshot ────────────────────────────────────────────────── */}
          {import.meta.env.DEV && userData && (
            <details className="border border-zinc-800 rounded-xl text-xs font-mono text-zinc-600">
              <summary className="px-4 py-2 cursor-pointer text-zinc-500 hover:text-zinc-400 list-none">
                DEV — userData snapshot
              </summary>
              <div className="px-4 pb-4 pt-2 space-y-1">
                <p>email: {userData.email}</p>
                <p>provider: {userData.authProvider}</p>
                <p>verified: {String(userData.isVerified)}</p>
                <p>role: {userData.role}</p>
                <p>university: {userData.university ?? '—'}</p>
                <p>major: {userData.major ?? '—'}</p>
              </div>
            </details>
          )}

        </div>
      </main>

      <style>{`
        @keyframes wave {
          0%,100% { transform: rotate(0deg); }
          25%      { transform: rotate(18deg); }
          75%      { transform: rotate(-10deg); }
        }
      `}</style>
    </div>
  );
}