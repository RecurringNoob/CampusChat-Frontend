import { useState } from "react";
import { 
  BarChart2, Users, Settings, MessageSquare, 
  BookOpen, ChevronLeft, ChevronRight, LogOut 
} from 'lucide-react';
import { logout } from '../../store/authSlice';
import { logout as logoutAPI } from '../../api/auth';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
export function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  //let tab = current location and then use to initialize active tab
  const [activeTab, setActiveTab] = useState('home');
    const dispatch = useDispatch();
  const navigate = useNavigate();
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: BarChart2, badge: null },
    { id: 'connections', label: 'Connections', icon: Users, badge: null },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 3 },
    { id: 'streams', label: 'Scheduled Streams', icon: BookOpen, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];
    const handleLogout = async () => {
    await logoutAPI(); // clears cookie on backend
    dispatch(logout); // clears redux
    navigate('/'); // UI decides redirect
  };
  return (
    <aside className={`
      ${expanded ? 'w-64' : 'w-20'} 
      flex flex-col border-r border-zinc-800 h-screen sticky top-16 bg-zinc-900 transition-all duration-300
    `}>
      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`
              w-full flex items-center p-3 rounded-lg transition-colors group relative
              ${activeTab === item.id 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}
              ${!expanded && 'justify-center'}
            `}
          >
            <item.icon size={20} />
            
            {expanded && <span className="ml-3 font-medium">{item.label}</span>}
            
            {/* Badge handling */}
            {item.badge && (
              <span className={`
                bg-emerald-500 text-zinc-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full
                ${expanded ? 'ml-auto' : 'absolute top-2 right-2'}
              `}>
                {item.badge}
              </span>
            )}

            {/* Tooltip for collapsed mode */}
            {!expanded && (
              <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-emerald-500 text-zinc-900 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </div>
      
      {/* Bottom Section */}
      <div className="border-t border-zinc-800 p-4">
        {expanded && (
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center">
              <span className="bg-emerald-500 h-2 w-2 rounded-full animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 ml-2">Premium</span>
            </div>
            <span className="text-[10px] text-zinc-500">20d left</span>
          </div>
        )}
        
        <button className={`
          w-full flex items-center p-3 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors
          ${!expanded && 'justify-center'}
        `} onClick={handleLogout}>
          <LogOut size={20} />
          {expanded && <span className="ml-3 font-medium">Sign Out</span>}
        </button>
      </div>
      
      {/* Toggle button */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="absolute -right-3 top-6 bg-zinc-800 p-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:text-white shadow-lg"
      >
        {expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </aside>
  );
}