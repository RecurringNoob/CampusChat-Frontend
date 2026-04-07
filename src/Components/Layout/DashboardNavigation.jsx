
import { NotificationPanel } from './NotificationPanel'; // Import the component
import { SearchBar } from './SearchBar';
import Logo from './Logo';
import { Link } from 'react-router-dom';
import {User} from 'lucide-react'

export function DashboardNavigation() {
  return (
    <nav className="backdrop-blur-lg bg-zinc-900/70 sticky top-0 z-50 border-b border-zinc-800 py-3 px-6 flex justify-between items-center">
      <Link to="/">
      <Logo/>
      </Link>
      <SearchBar/>
      <div className="flex items-center space-x-3">
        {/* Notification Panel Component */}
        <NotificationPanel />
        
        <div className="flex items-center space-x-2">
          <User alt="Profile" className="rounded-full w-8 h-8" />
          <span className="hidden md:inline text-sm font-medium">Jamie Edwards</span>
        </div>
      </div>
    </nav>
  );
}