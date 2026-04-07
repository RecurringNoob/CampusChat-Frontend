// src/components/dashboard/Shared/DashboardSection.jsx
import { ChevronRight } from "lucide-react";
export const DashboardSection = ({ title, actionLabel, onAction, children }) => (
  <div className="bg-zinc-900/40 rounded-xl border border-zinc-800 p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-bold text-zinc-100">{title}</h2>
      {actionLabel && (
        <button onClick={onAction} className="text-emerald-400 text-sm font-medium hover:underline flex items-center gap-1">
          {actionLabel} <ChevronRight size={14} />
        </button>
      )}
    </div>
    {children}
  </div>
);
