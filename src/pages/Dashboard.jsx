import { Users, Clock, Music } from 'lucide-react';
import { Sidebar } from '../Components/Layout/Sidebar';
import ConnectionRow from '../Components/Dashboard/ConnectionRow';
import { DashboardSection } from '../Components/Dashboard/DashboardSection';
import WelcomeBanner from '../Components/Dashboard/WelcomeBanner';
import { PartyCard } from '../Components/Dashboard/PartyCard';
import { StatCard } from '../Components/Dashboard/StatCard';
import { useSelector } from 'react-redux';
export default function Dashboard() {
  const recentConnections = [
    { name: 'Emma Watson', university: 'UCLA', major: 'Psychology', time: '2h ago' },
    { name: 'Michael Chen', university: 'MIT', major: 'Computer Science', time: '3h ago' },
    { name: 'Sophia Rodriguez', university: 'Stanford', major: 'Biology', time: 'Yesterday' },
    { name: 'James Wilson', university: 'Harvard', major: 'Economics', time: 'Yesterday' }
  ];

  const upcomingListeningParties = [
    { album: 'The Dark Side of the Moon', artist: 'Pink Floyd', time: 'Today, 3:00 PM', participants: 3, streams: 42 },
    { album: 'Random Access Memories', artist: 'Daft Punk', time: 'Tomorrow, 4:30 PM', participants: 5, streams: 87 },
    { album: 'To Pimp a Butterfly', artist: 'Kendrick Lamar', time: 'Apr 05, 2:00 PM', participants: 2, streams: 156 }
  ];

  const focusAreas = ['Psychology', 'Computer Science', 'Biology', 'Jazz', 'Indie Rock', 'Hip-Hop', 'Film', 'Economics'];
    const userData = useSelector((state) => state.auth.userData);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {console.log(userData)}
        <WelcomeBanner name="Jamie"/>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Connections" value="128" icon={Users} trend="+12" trendLabel="this week" />
          <StatCard title="Listening Parties" value="8" icon={Music} trend="2" trendLabel="upcoming" />
          <StatCard title="Chat Duration" value="37 hrs" icon={Clock} trend="+5.2 hrs" trendLabel="vs last week" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2">
            <DashboardSection title="Recent Connections" actionLabel="View All">
              <div className="space-y-1">
                {recentConnections.map((c, i) => <ConnectionRow key={i} connection={c} />)}
              </div>
            </DashboardSection>
          </div>

          <DashboardSection title="Focus Areas" actionLabel="Edit">
            <div className="flex flex-wrap gap-2 pt-1">
              {focusAreas.map((area, i) => (
                <span key={i} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 text-xs">
                  {area}
                </span>
              ))}
            </div>
          </DashboardSection>
        </div>

        <DashboardSection title="Upcoming Parties" actionLabel="Schedule New">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingListeningParties.map((p, i) => <PartyCard key={i} party={p} />)}
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}