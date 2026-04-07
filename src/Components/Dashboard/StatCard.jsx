const colorMap = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-400'  },
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400'    },
};
//eslint-disable-next-line
export const StatCard = ({ title, value, icon: IconComponent, trend, trendLabel, color = 'emerald' }) => {
  const { bg, text } = colorMap[color] ?? colorMap.emerald;

  return (
    <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 p-5 backdrop-blur-sm transition-all hover:border-emerald-500/30">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-zinc-100">{value}</h3>
        </div>
        <div className={`${bg} p-2 rounded-lg`}>
          <IconComponent className={text} size={20} />
        </div>
      </div>
      <div className="flex items-center mt-4 text-[11px]">
        <span className="text-emerald-400 font-semibold">{trend}</span>
        <span className="text-zinc-500 ml-1">{trendLabel}</span>
      </div>
    </div>
  );
};