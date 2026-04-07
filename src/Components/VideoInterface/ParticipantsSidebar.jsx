import React from 'react';
import { X, ChevronRight, Volume2, VideoOff, MoreHorizontal, Shield, UserPlus } from 'lucide-react';

export const ParticipantsSidebar = ({ participants, onClose }) => {
  return (
    <div className="w-full md:w-80 border-l border-zinc-800 flex flex-col bg-zinc-900/50 backdrop-blur-xl h-full animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="font-bold text-lg">Participants ({participants.length})</h2>
        <button 
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors" 
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      
      {/* List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 border-b border-zinc-800/50">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">In this session</h3>
            <button className="text-emerald-400 text-xs font-bold flex items-center hover:underline">
              Invite <ChevronRight size={14} />
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-zinc-800/50">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors group">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                    {participant.avatar ? (
                      <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-emerald-400">{participant.name.charAt(0)}</span>
                    )}
                  </div>
                  {participant.isActive && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-zinc-900"></span>
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-sm flex items-center">
                    {participant.name}
                    {participant.isYou && <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded ml-2 text-zinc-400 font-normal">You</span>}
                  </p>
                  <p className="text-[11px] text-zinc-500">{participant.university}</p>
                </div>
              </div>
              
              {/* Quick Actions (Hidden on mobile or visible on hover) */}
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!participant.isYou && (
                  <>
                    <button className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-white">
                      <Volume2 size={14} />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-white">
                      <MoreHorizontal size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/20">
        <div className="flex items-center text-[11px] text-zinc-500 mb-4 bg-zinc-800/40 p-2 rounded-lg">
          <Shield className="text-emerald-500 mr-2 shrink-0" size={14} />
          <span>All students are verified via University SSO</span>
        </div>
        <button className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center">
          <UserPlus size={16} className="mr-2" />
          Invite Study Buddies
        </button>
      </div>
    </div>
  );
};