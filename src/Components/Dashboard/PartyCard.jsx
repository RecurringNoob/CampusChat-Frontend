// src/components/dashboard/PartyCard.jsx
import { Clock, Headphones, Play } from 'lucide-react';

export const PartyCard = ({ party }) => {
  const isLive = party.time.includes("Today"); // Simplified logic for demo

  return (
    <div className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-xl hover:border-emerald-500/50 transition-all group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
              {party.album}
            </h3>
            {isLive && (
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Live Now" />
            )}
          </div>
          <p className="text-xs text-zinc-400">{party.artist}</p>
        </div>
        
        <div className="text-right">
          <div className="flex items-center text-[10px] bg-zinc-800 px-2 py-1 rounded-md text-zinc-300 border border-zinc-700">
            <Headphones size={12} className="mr-1 text-emerald-500" />
            {party.streams}
          </div>
        </div>
      </div>

      <div className="flex items-center text-xs text-zinc-500 mb-4">
        <Clock size={14} className="mr-1.5" />
        {party.time}
      </div>

      <button className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-semibold hover:bg-emerald-500 hover:text-zinc-900 transition-all">
        <Play size={14} fill="currentColor" />
        Join Party
      </button>
    </div>
  );
};