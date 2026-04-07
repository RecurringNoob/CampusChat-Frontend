import { useState } from 'react';
import { 
  Bell, 
  X, 
  Settings,
  Check
} from 'lucide-react';

export  function NotificationPanel() {
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Sample notifications
  const notifications = [
    { id: 1, title: 'New Connection Request', user: 'Michael Chen', time: '2h ago', read: false },
    { id: 2, title: 'Study Session Reminder', user: 'Organic Chemistry', time: 'Tomorrow, 4:30 PM', read: false },
    { id: 3, title: 'Message from Emma', user: 'Let\'s connect for the project!', time: '5h ago', read: true },
    { id: 4, title: 'Premium Subscription', user: 'Your subscription will renew in 20 days', time: 'Yesterday', read: true },
  ];
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)} 
        className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-emerald-400"></span>
        )}
      </button>
      
      {showNotifications && (
        <div className="absolute top-12 right-0 w-80 bg-zinc-800 rounded-xl border border-zinc-700 shadow-lg z-50">
          <div className="flex justify-between items-center p-4 border-b border-zinc-700">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex gap-2">
              <button 
                className="p-1 rounded-full hover:bg-zinc-700 text-zinc-400"
                title="Settings"
              >
                <Settings size={16} />
              </button>
              <button 
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-full hover:bg-zinc-700 text-zinc-400"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          {notifications.length > 0 ? (
            <>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-zinc-700 cursor-pointer border-b border-zinc-700 ${
                      !notification.read ? 'border-l-2 border-emerald-400' : ''
                    }`}
                  >
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <span className="text-xs text-zinc-500">{notification.time}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{notification.user}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 flex justify-between items-center">
                <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center">
                  <Check size={14} className="mr-1" /> Mark all as read
                </button>
                <button className="text-xs text-zinc-400 hover:text-white">
                  View all
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-zinc-400 text-sm">No new notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}