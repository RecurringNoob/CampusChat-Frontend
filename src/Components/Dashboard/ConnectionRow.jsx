// Sub-component for Connection Rows
import { User,MessageSquare,ChevronRight } from "lucide-react";
const ConnectionRow = ({ connection }) => (
  <div className="group flex items-center justify-between p-3 hover:bg-emerald-500/5 rounded-xl border border-transparent hover:border-emerald-500/20 transition-all duration-300">
    <div className="flex items-center">
      <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300 border border-zinc-600 group-hover:border-emerald-500/50 transition-colors">
        <User size={20} />
      </div>
      <div className="ml-3">
        <p className="font-semibold text-zinc-100 group-hover:text-white">{connection.name}</p>
        <p className="text-xs text-zinc-500">{connection.university} • {connection.major}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="p-2 hover:bg-zinc-800 rounded-lg text-emerald-400">
        <MessageSquare size={18} />
      </button>
      <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400">
        <ChevronRight size={18} />
      </button>
    </div>
  </div>
);
export default ConnectionRow;