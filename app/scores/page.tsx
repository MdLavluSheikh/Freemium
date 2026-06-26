export default function ScoresPage() {
  return (
    <div className="min-h-screen px-4 lg:px-8 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">Live Scores</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { sport: 'Football', match: 'Barcelona vs Real Madrid', score: '2-1', status: 'Live 65\'', league: 'La Liga' },
          { sport: 'Cricket', match: 'India vs Australia', score: '245/4', status: 'Live - 42.3 Overs', league: 'ODI Series' },
          { sport: 'Basketball', match: 'Lakers vs Celtics', score: '98-92', status: 'Q4 2:34', league: 'NBA' },
          { sport: 'Tennis', match: 'Djokovic vs Alcaraz', score: '6-4, 3-6, 4-3', status: '3rd Set', league: 'Wimbledon' },
          { sport: 'Football', match: 'Bayern vs Dortmund', score: '3-0', status: 'Finished', league: 'Bundesliga' },
          { sport: 'Cricket', match: 'England vs Pakistan', score: '312/6', status: 'Live - 48.1 Overs', league: 'Test Series' },
        ].map((game, i) => (
          <div key={i} className="glass rounded-2xl p-5 hover:bg-white/[0.08] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{game.sport}</span>
              <span className="text-xs text-zinc-400">{game.league}</span>
            </div>
            <p className="text-sm font-medium text-zinc-200 mb-2">{game.match}</p>
            <p className="text-2xl font-bold text-white mb-2">{game.score}</p>
            <span className={`text-xs font-medium px-2 py-1 rounded-md ${
              game.status.includes('Live') ? 'bg-red-500/20 text-red-400' : 'text-zinc-500'
            }`}>
              {game.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
