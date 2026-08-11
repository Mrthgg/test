import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { Trophy, Clock, Skull, Coins, Award, ChevronDown, ChevronUp, RefreshCw, Sparkles, Shield, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface LeaderboardEntry {
  rank: number;
  username: string;
  value: number;
}

type MetricType = 'playtime' | 'kills' | 'balance' | 'deaths';

export default function Leaderboard() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<MetricType>('playtime');
  const [limit, setLimit] = useState<number>(10);
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'playtime' as MetricType, name: 'Playtime', icon: Clock, color: 'from-amber-500 to-yellow-500', unit: 'hrs' },
    { id: 'kills' as MetricType, name: 'Kills', icon: Award, color: 'from-red-500 to-rose-600', unit: 'kills' },
    { id: 'balance' as MetricType, name: 'Balance', icon: Coins, color: 'from-emerald-500 to-teal-600', unit: '$' },
    { id: 'deaths' as MetricType, name: 'Deaths', icon: Skull, color: 'from-purple-500 to-indigo-600', unit: 'deaths' },
  ];

  const fetchLeaderboard = async (metric: MetricType, currentLimit: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leaderboard/${metric}?limit=${currentLimit}`);
      const json = await res.json();
      if (res.ok) {
        setData(json.data || []);
        setConnected(json.connected || false);
      } else {
        setError(json.error || 'Failed to fetch leaderboard data.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching leaderboards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeTab, limit);
  }, [activeTab, limit]);

  const handleTabChange = (tab: MetricType) => {
    setActiveTab(tab);
    setLimit(10); // reset to top 10 on tab change
  };

  const toggleExpand = () => {
    if (limit === 10) {
      setLimit(50);
    } else {
      setLimit(10);
    }
  };

  const formatValue = (val: number, metric: MetricType) => {
    if (metric === 'balance') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    }
    if (metric === 'playtime') {
      const hours = Math.floor(val);
      const mins = Math.round((val - hours) * 60);
      return `${hours}h ${mins}m`;
    }
    return new Intl.NumberFormat('en-US').format(val);
  };

  const activeCategory = categories.find(c => c.id === activeTab) || categories[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-300 backdrop-blur shadow-xl">
            <span className={cn("w-2 h-2 rounded-full animate-pulse", connected ? "bg-emerald-400" : "bg-amber-400")} />
            <span>{connected ? "Connected to MySQL ajLeaderboards" : "Leaderboard MySQL Data Stream"}</span>
            <span className="text-slate-600">•</span>
            <span className="text-purple-400 text-[11px] font-bold">Only Leaderboard uses MySQL</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
            SERVER <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">LEADERBOARD</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Live rankings fetched directly from your Minecraft MySQL database (ajLeaderboards).
          </p>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleTabChange(cat.id)}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-2xl border transition-all duration-300 text-left",
                  isActive 
                    ? "bg-slate-900 border-purple-500/50 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30" 
                    : "bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 text-slate-400"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-md",
                  cat.color,
                  isActive ? "scale-105" : "opacity-75"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className={cn("text-xs uppercase font-bold tracking-wider", isActive ? "text-purple-300" : "text-slate-500")}>
                    Rankings
                  </div>
                  <div className={cn("text-sm sm:text-base font-black", isActive ? "text-white" : "text-slate-300")}>
                    {cat.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Leaderboard Table Card */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn("w-3 h-8 rounded-full bg-gradient-to-b", activeCategory.color)} />
              <div>
                <h2 className="text-lg font-bold text-white capitalize">{activeCategory.name} Leaderboard</h2>
              </div>
            </div>
            <button
              onClick={() => fetchLeaderboard(activeTab, limit)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-950/40 text-slate-400 text-xs uppercase tracking-wider font-mono">
                  <th className="py-4 px-6 w-20 text-center">Rank</th>
                  <th className="py-4 px-6">Player</th>
                  <th className="py-4 px-6 text-right uppercase">{activeCategory.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {loading && data.length === 0 ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-6 text-center">
                        <div className="w-8 h-8 bg-slate-800 rounded-lg mx-auto" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-800 rounded-lg" />
                          <div className="w-32 h-4 bg-slate-800 rounded" />
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="w-20 h-4 bg-slate-800 rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-red-400">
                      {error}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center text-slate-400">
                      <div className="max-w-md mx-auto space-y-2">
                        <p className="font-bold text-white text-base">No players found</p>
                        <p className="text-xs text-slate-500">Please configure your MySQL ajLeaderboards database credentials in the Admin Panel to display live rankings.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((entry) => {
                    const isTop1 = entry.rank === 1;
                    const isTop2 = entry.rank === 2;
                    const isTop3 = entry.rank === 3;

                    return (
                      <tr 
                        key={entry.rank}
                        className={cn(
                          "transition-colors hover:bg-slate-800/30",
                          isTop1 && "bg-amber-500/5 font-semibold",
                          isTop2 && "bg-slate-400/5 font-semibold",
                          isTop3 && "bg-amber-700/5 font-semibold"
                        )}
                      >
                        <td className="py-4 px-6 text-center font-mono">
                          <div className="inline-flex items-center justify-center">
                            {isTop1 ? (
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/20 text-xs">
                                #1
                              </div>
                            ) : isTop2 ? (
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-300 to-slate-500 text-slate-950 font-black flex items-center justify-center shadow-md text-xs">
                                #2
                              </div>
                            ) : isTop3 ? (
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white font-black flex items-center justify-center shadow-md text-xs">
                                #3
                              </div>
                            ) : (
                              <span className="text-slate-500 font-bold text-xs">
                                #{entry.rank}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Link to={`/player/${encodeURIComponent(entry.username)}`} className="flex items-center space-x-3 group/player">
                            <div className="w-8 h-8 rounded-xl bg-slate-800 overflow-hidden border border-slate-700/50 flex items-center justify-center group-hover/player:border-purple-500 transition-colors">
                              <img 
                                src={`https://mc-heads.net/avatar/${entry.username}/32`} 
                                alt={entry.username}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <span className="font-bold text-white tracking-wide group-hover/player:text-purple-400 transition-colors">{entry.username}</span>
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-purple-300">
                          {formatValue(entry.value, activeTab)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Expand / Collapse Button */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-center">
            <button
              onClick={toggleExpand}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold transition-all shadow-md active:scale-95"
            >
              <span>{limit === 10 ? 'Expand to Top 50 Players' : 'Show Top 10 Only'}</span>
              {limit === 10 ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
