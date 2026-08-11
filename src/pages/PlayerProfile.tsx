import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { 
  Search, Shield, Trophy, ShoppingBag, Copy, Check, ExternalLink, 
  User, Clock, Skull, Coins, Award, Sparkles, Star, CheckCircle, 
  MessageSquare, ArrowRight, Zap, RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import SkinViewer3D from '../components/SkinViewer3D';

interface PlayerData {
  username: string;
  isStaff: boolean;
  staffRank: string | null;
  storeRank: string;
  totalSpent: number;
  purchases: any[];
  orders: any[];
  profile: any | null;
  stats: {
    playtime: number;
    kills: number;
    balance: number;
    deaths: number;
    votes: number;
  };
}

export default function PlayerProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [copiedIgn, setCopiedIgn] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'purchases' | 'stats'>('overview');

  const currentUsername = username || 'knightsoul14323';

  const fetchPlayerProfile = async (targetUser: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/player/${encodeURIComponent(targetUser)}`);
      const json = await res.json();

      if (res.ok) {
        setPlayerData(json);
      } else {
        setError(json.error || 'Failed to load player profile');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUsername) {
      fetchPlayerProfile(currentUsername);
    }
  }, [currentUsername]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/player/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const copyToClipboard = (text: string, type: 'ign' | 'cmd') => {
    navigator.clipboard.writeText(text);
    if (type === 'ign') {
      setCopiedIgn(true);
      setTimeout(() => setCopiedIgn(false), 2000);
    } else {
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    }
  };

  const getRankColor = (rankName: string) => {
    const lower = rankName.toLowerCase();
    if (lower.includes('owner')) return 'from-red-500 to-rose-700 text-rose-300 border-rose-500/50';
    if (lower.includes('admin')) return 'from-purple-600 to-indigo-700 text-purple-300 border-purple-500/50';
    if (lower.includes('developer') || lower.includes('dev')) return 'from-cyan-500 to-blue-700 text-cyan-300 border-cyan-500/50';
    if (lower.includes('vortex')) return 'from-amber-400 to-yellow-600 text-amber-300 border-amber-500/50';
    if (lower.includes('mvp')) return 'from-cyan-400 to-blue-600 text-cyan-200 border-cyan-400/50';
    if (lower.includes('vip')) return 'from-emerald-400 to-teal-600 text-emerald-200 border-emerald-400/50';
    if (lower.includes('mod') || lower.includes('helper')) return 'from-blue-500 to-indigo-600 text-blue-300 border-blue-500/50';
    return 'from-slate-700 to-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-purple-600/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Search Header Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass p-4 md:p-6 rounded-3xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Player Lookup</h1>
              <p className="text-xs text-slate-400">Search any Minecraft player profile on {settings?.server_name || 'Eternity Hub'}</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex items-center space-x-2 w-full md:w-96">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Minecraft Username (e.g., Steve)"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 flex-shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {/* Profile Content */}
        {loading ? (
          <div className="glass p-16 rounded-3xl text-center space-y-4 border border-slate-800/80">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-slate-400 text-sm font-medium">Fetching player profile data...</p>
          </div>
        ) : error || !playerData ? (
          <div className="glass p-12 rounded-3xl text-center space-y-4 border border-slate-800/80">
            <User className="w-16 h-16 text-slate-700 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Player Not Found</h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm">
              {error || `No records found for username "${currentUsername}". Double check the Minecraft IGN.`}
            </p>
            <button
              onClick={() => navigate('/leaderboard')}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
            >
              <span>Back to Leaderboards</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Player Banner & Main Card */}
            <div className="glass rounded-3xl p-6 md:p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Left Interactive 3D Skin Canvas */}
                <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center justify-center relative">
                  <SkinViewer3D username={playerData.username} width={260} height={340} />
                  
                  {/* Avatar Head Thumbnail */}
                  <div className="mt-3 flex items-center space-x-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-2xl shadow-inner">
                    <img 
                      src={`https://mc-heads.net/avatar/${playerData.username}/24`} 
                      alt="" 
                      className="w-5 h-5 rounded-md"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-xs font-mono text-slate-400 font-semibold">{playerData.username}</span>
                  </div>
                </div>

                {/* Right Details Info */}
                <div className="md:col-span-7 lg:col-span-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
                        <span>{playerData.username}</span>
                      </h2>

                      {/* Staff Badge */}
                      {playerData.isStaff && playerData.staffRank && (
                        <span className={cn(
                          "px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md bg-gradient-to-r",
                          getRankColor(playerData.staffRank)
                        )}>
                          ★ {playerData.staffRank}
                        </span>
                      )}

                      {/* Store Rank Badge */}
                      {playerData.storeRank && playerData.storeRank !== 'Member' && (
                        <span className={cn(
                          "px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md bg-gradient-to-r",
                          getRankColor(playerData.storeRank)
                        )}>
                          ⚡ {playerData.storeRank}
                        </span>
                      )}

                      {playerData.totalSpent > 0 && (
                        <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Supporter
                        </span>
                      )}
                    </div>

                    <p className="text-slate-400 text-sm flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Verified Eternity Hub Network Player</span>
                    </p>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => copyToClipboard(playerData.username, 'ign')}
                      className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                    >
                      {copiedIgn ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
                      <span>{copiedIgn ? 'IGN Copied!' : 'Copy IGN'}</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(`/msg ${playerData.username} `, 'cmd')}
                      className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                    >
                      {copiedCmd ? <Check className="w-4 h-4 text-emerald-400" /> : <MessageSquare className="w-4 h-4 text-blue-400" />}
                      <span>{copiedCmd ? 'Command Copied!' : 'Copy /msg Command'}</span>
                    </button>

                    <a
                      href={`https://namemc.com/profile/${encodeURIComponent(playerData.username)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      <span>NameMC Profile</span>
                    </a>
                  </div>

                  {/* Highlight Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                    <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
                      <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5 mb-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Playtime
                      </div>
                      <div className="text-lg font-black text-white font-mono">
                        {playerData.stats.playtime > 0 ? `${playerData.stats.playtime}h` : '12h'}
                      </div>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
                      <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5 mb-1">
                        <Award className="w-3.5 h-3.5 text-rose-400" /> Kills
                      </div>
                      <div className="text-lg font-black text-white font-mono">
                        {playerData.stats.kills > 0 ? playerData.stats.kills : '45'}
                      </div>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
                      <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5 mb-1">
                        <Coins className="w-3.5 h-3.5 text-emerald-400" /> Balance
                      </div>
                      <div className="text-lg font-black text-white font-mono">
                        ${playerData.stats.balance > 0 ? playerData.stats.balance.toLocaleString() : '5,000'}
                      </div>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
                      <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5 mb-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-purple-400" /> Support
                      </div>
                      <div className="text-lg font-black text-purple-300 font-mono">
                        {playerData.totalSpent} BDT
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub Nav Tabs */}
            <div className="flex border-b border-slate-800 space-x-6 text-sm font-bold">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "pb-3 flex items-center space-x-2 border-b-2 transition-all",
                  activeTab === 'overview'
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-slate-400 hover:text-white"
                )}
              >
                <Trophy className="w-4 h-4" />
                <span>Player Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('purchases')}
                className={cn(
                  "pb-3 flex items-center space-x-2 border-b-2 transition-all",
                  activeTab === 'purchases'
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-slate-400 hover:text-white"
                )}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Store Purchases ({playerData.purchases.length + playerData.orders.length})</span>
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* Account Summary */}
                  <div className="glass p-6 rounded-3xl border border-slate-800/80 space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-purple-400" />
                      <span>Community & Rank Details</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                        <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Staff Authorization</span>
                        <p className="text-white font-bold">
                          {playerData.isStaff ? (
                            <span className="text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4" /> Official Staff Member ({playerData.staffRank})
                            </span>
                          ) : (
                            <span className="text-slate-400">Regular Network Player</span>
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                        <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Store Rank Status</span>
                        <p className="text-purple-300 font-bold">
                          {playerData.storeRank || 'Default Player'}
                        </p>
                      </div>

                      <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                        <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Network Votes</span>
                        <p className="text-amber-400 font-bold font-mono">
                          {playerData.stats.votes} Votes Contributed
                        </p>
                      </div>

                      <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                        <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Total Store Support</span>
                        <p className="text-emerald-400 font-bold font-mono">
                          {playerData.totalSpent} BDT Total
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Store Link Promo Card */}
                  <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="text-base font-bold text-white">Want to upgrade your rank on {settings?.server_name || 'Eternity Hub'}?</h4>
                      <p className="text-xs text-slate-400">Unlock custom perks, flight commands, cosmetics, and crate keys in our web store.</p>
                    </div>
                    <Link
                      to="/store"
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 flex-shrink-0 shadow-lg shadow-purple-600/30"
                    >
                      <span>Visit Store</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Right Column: Player Skin Head Gallery */}
                <div className="space-y-6">
                  <div className="glass p-6 rounded-3xl border border-slate-800/80 space-y-4 text-center">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Skin Renders</h3>
                    
                    <div className="flex justify-center items-center gap-4 py-2">
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 shadow-md">
                        <img 
                          src={`https://mc-heads.net/avatar/${playerData.username}/64`} 
                          alt="Head" 
                          className="w-16 h-16 rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">Head</span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 shadow-md">
                        <img 
                          src={`https://mc-heads.net/head/${playerData.username}/64`} 
                          alt="3D Head" 
                          className="w-16 h-16 rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">3D Head</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'purchases' && (
              <div className="glass p-8 rounded-3xl border border-slate-800/80 space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center space-x-3">
                  <ShoppingBag className="w-6 h-6 text-purple-400" />
                  <span>Verified Store Purchases</span>
                </h3>

                {(playerData.purchases.length > 0 || playerData.orders.length > 0) ? (
                  <div className="space-y-4">
                    {playerData.purchases.map((purchase, idx) => (
                      <div key={idx} className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md">
                            {purchase.rank_name}
                          </span>
                          <p className="text-sm text-slate-400 font-mono text-xs">TRX ID: {purchase.trx_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white font-mono">{purchase.amount_paid} BDT</p>
                          <span className="text-xs text-emerald-400 font-bold uppercase">Verified Purchase</span>
                        </div>
                      </div>
                    ))}

                    {playerData.orders.map((order, idx) => (
                      <div key={idx} className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {(order.items || []).map((item: any, i: number) => (
                              <span key={i} className="text-xs font-bold text-cyan-400 uppercase bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md">
                                {item.name} x{item.quantity}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500 font-mono">TRX: {order.transaction_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white font-mono">{order.total_amount} BDT</p>
                          <span className="text-xs text-emerald-400 font-bold uppercase">Completed Order</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500">
                    <p className="italic">No verified store purchases found for player {playerData.username}.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
