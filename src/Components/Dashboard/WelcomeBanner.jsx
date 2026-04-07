
function WelcomeBanner({ name }) {
  return (
    <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-2xl border border-zinc-700 p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Welcome back, {name} 👋</h1>
          <p className="text-zinc-400">You have 3 unread messages and 2 upcoming listening parties</p>
        </div>
        <button className="mt-4 md:mt-0 bg-emerald-500 hover:bg-emerald-600 rounded-full px-5 py-2 text-sm font-medium transition-colors">
          Start Random Chat
        </button>
      </div>
    </div>
  );
}

export default WelcomeBanner;