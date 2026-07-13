import React, { useContext, useState } from 'react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { 
  Plus, Search, Pin, Star, Trash2, Edit3, LogOut, BarChart3, 
  Settings, Folder, Calendar, Sun, Moon, Check, X, Bot, Info, ChevronRight,
  Lock, ArrowUpRight
} from 'lucide-react';

const Sidebar = ({ closeSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const {
    conversations,
    currentConversation,
    selectConversation,
    startNewChat,
    updateConversation,
    deleteConversation,
    categories,
    stats,
    fetchHistory
  } = useContext(ChatContext);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Trigger search filters
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearch(term);
    fetchHistory({ search: term, category: selectedCategory });
  };

  // Filter conversations by category
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchHistory({ search, category });
  };

  const handleStartEdit = (chat) => {
    setEditingChatId(chat._id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = async (id) => {
    if (editTitle.trim()) {
      await updateConversation(id, { title: editTitle });
    }
    setEditingChatId(null);
  };

  const handleCategoryChange = async (id, cat) => {
    await updateConversation(id, { category: cat });
  };

  // Groups chats by Date for visual separation
  const groupChatsByDate = (chats) => {
    const groups = { Pinned: [], Today: [], Yesterday: [], Older: [] };
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    chats.forEach(chat => {
      if (chat.isPinned) {
        groups.Pinned.push(chat);
      } else {
        const chatDate = new Date(chat.updatedAt).toDateString();
        if (chatDate === today) {
          groups.Today.push(chat);
        } else if (chatDate === yesterday) {
          groups.Yesterday.push(chat);
        } else {
          groups.Older.push(chat);
        }
      }
    });
    return groups;
  };

  const chatGroups = groupChatsByDate(conversations);

  return (
    <div className="h-full flex flex-col bg-[#05070c] text-slate-300 font-sans select-none border-r border-slate-900">
      
      {/* Top Header Section - Controls */}
      <div className="p-4 flex items-center justify-between border-b border-slate-900/60">
        <div className="flex items-center gap-1.5">
          <button 
            onClick={startNewChat}
            className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-900/60 rounded-xl transition-all"
            title="New Chat"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteConversation(currentConversation?._id)}
            disabled={!currentConversation}
            className="p-2 text-slate-500 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-slate-500 rounded-xl transition-all"
            title="Delete current chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-yellow-400 transition-all duration-200"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={closeSidebar}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900/60 rounded-xl md:hidden transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons & Search */}
      <div className="p-4">
        {/* Rounded Pill Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search"
            className="w-full pl-4 pr-10 py-2.5 bg-slate-950/80 border border-slate-850 focus:border-yellow-500/50 rounded-full text-xs outline-none text-slate-200 placeholder-slate-500 transition-all shadow-inner"
          />
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* Categories horizontal list if desired (Styled elegantly to match the aesthetic) */}
      <div className="px-4 pb-2">
        <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {['All', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-yellow-500 text-slate-950'
                  : 'bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Conversation List */}
      <div className="flex-grow overflow-y-auto px-2 py-2 space-y-4">
        {Object.entries(chatGroups).map(([groupName, groupChats]) => {
          if (groupChats.length === 0) return null;
          
          return (
            <div key={groupName} className="space-y-1">
              <span className="px-4 text-[10px] font-bold tracking-widest text-slate-600 uppercase flex items-center gap-1.5">
                {groupName === 'Pinned' && <Pin className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                {groupName}
              </span>
              <div className="space-y-1">
                {groupChats.map(chat => {
                  const isActive = currentConversation?._id === chat._id;
                  const isEditing = editingChatId === chat._id;

                  return (
                    <div
                      key={chat._id}
                      className={`group relative flex items-center justify-between py-2.5 px-4 mx-1 rounded-full transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm border border-slate-800'
                          : 'hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 flex-grow pr-4">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleSaveRename(chat._id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(chat._id)}
                            className="bg-slate-800 text-white px-2 py-0.5 rounded-full text-xs w-full outline-none focus:ring-1 focus:ring-yellow-500"
                            autoFocus
                          />
                          <button onClick={() => handleSaveRename(chat._id)} className="text-emerald-400 p-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            selectConversation(chat._id);
                            if (closeSidebar) closeSidebar();
                          }}
                          className="flex items-center gap-2 flex-grow overflow-hidden pr-8"
                        >
                          <Folder className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-yellow-500' : 'text-slate-500'}`} />
                          <span className="text-xs font-semibold truncate leading-none">{chat.title}</span>
                        </div>
                      )}

                      {/* Hover controls matching the sleek dark/gold look */}
                      {!isEditing && (
                        <div className="absolute right-3.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all bg-gradient-to-l from-slate-950 group-hover:from-slate-900 pl-4 py-1">
                          <button
                            onClick={() => handleStartEdit(chat)}
                            className="p-1 text-slate-500 hover:text-yellow-400 rounded-lg hover:bg-slate-800/40 transition-colors"
                            title="Rename"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          
                          <button
                            onClick={() => updateConversation(chat._id, { isPinned: !chat.isPinned })}
                            className={`p-1 rounded-lg transition-colors ${
                              chat.isPinned ? 'text-yellow-500' : 'text-slate-500 hover:text-slate-200'
                            }`}
                            title={chat.isPinned ? 'Unpin' : 'Pin'}
                          >
                            <Pin className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => updateConversation(chat._id, { isFavorite: !chat.isFavorite })}
                            className={`p-1 rounded-lg transition-colors ${
                              chat.isFavorite ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-200'
                            }`}
                            title={chat.isFavorite ? 'Remove Favorite' : 'Favorite'}
                          >
                            <Star className={`w-3 h-3 ${chat.isFavorite ? 'fill-yellow-400' : ''}`} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {conversations.length === 0 && (
          <div className="text-center py-8 text-[11px] text-slate-600">No chats found.</div>
        )}
      </div>

      {/* Subscription Promo & User Profile Footer */}
      <div className="mt-auto border-t border-slate-900/60 bg-[#05070c]">
        {/* Subscription Gold Box */}
        <div className="m-4 p-4 rounded-3xl bg-gradient-to-br from-yellow-950/40 via-yellow-900/20 to-transparent border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.04)] relative overflow-hidden flex items-center justify-between group">
          <div className="space-y-1.5 pr-2">
            <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Purchase</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              a subscription to unlock over 15 new features
            </p>
          </div>
          <button 
            onClick={() => alert("Subscription feature coming soon in production!")}
            className="w-7 h-7 shrink-0 rounded-full bg-white hover:bg-yellow-500 flex items-center justify-center text-slate-950 hover:scale-105 active:scale-100 transition-all cursor-pointer shadow-md"
          >
            <ArrowUpRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>

        {/* Footer Navigation panel */}
        <div className="p-3 border-t border-slate-900/60 flex flex-col gap-2">
          {/* Insights Button */}
          <button
            onClick={() => setShowStatsModal(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-900 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-yellow-500" />
              <span>Conversation Insights</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* User profile & Logout bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-950/30 rounded-2xl border border-slate-900/40">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-white truncate leading-none mb-0.5">{user?.name || 'User'}</p>
                <p className="text-[9px] text-slate-500 truncate leading-none">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* STATISTICS MODAL (Preserved features) */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0b0e17] border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowStatsModal(false)}
              className="absolute right-4 top-4 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-yellow-500" /> Conversation Analytics
            </h3>

            {stats ? (
              <div className="space-y-5 text-sm">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3.5 bg-slate-900/50 rounded-2xl border border-slate-900">
                    <span className="text-2xl font-black text-yellow-500">{stats.totalConversations}</span>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Total Chats</p>
                  </div>
                  <div className="p-3.5 bg-slate-900/50 rounded-2xl border border-slate-900">
                    <span className="text-2xl font-black text-emerald-400">{stats.totalMessages}</span>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Total Messages</p>
                  </div>
                </div>

                <div className="space-y-2 bg-slate-900/30 p-4 rounded-2xl border border-slate-900/50">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">Category Usage</span>
                  <div className="space-y-2 pt-1.5">
                    {Object.entries(stats.categoryBreakdown).map(([cat, count]) => {
                      const percentage = Math.round((count / stats.totalConversations) * 100);
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-300">{cat}</span>
                            <span className="text-slate-400">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 bg-slate-900/30 p-4 rounded-2xl border border-slate-900/50">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">Active Frequency</span>
                  <div className="space-y-1.5 pt-1.5">
                    {stats.messageStats && stats.messageStats.map(stat => (
                      <div key={stat._id} className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{new Date(stat._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${Math.min(stat.count * 8, 120)}px` }} />
                          <span className="font-semibold text-slate-300">{stat.count} msg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">No analytics available yet. Make a few chats!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
