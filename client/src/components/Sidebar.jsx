import React, { useContext, useState } from 'react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { 
  Plus, Search, Pin, Star, Trash2, Edit3, LogOut, BarChart3, 
  Settings, Folder, Calendar, Sun, Moon, Check, X, Bot, Info, ChevronRight
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
    <div className="h-full flex flex-col bg-slate-900 text-slate-300 font-sans select-none">
      
      {/* Header Profile Branding */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white line-clamp-1">{user?.name}</h2>
            <span className="text-xs text-slate-500 line-clamp-1">{user?.email}</span>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <button
          onClick={() => {
            startNewChat();
            if (closeSidebar) closeSidebar();
          }}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/35 transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-5 h-5" /> New Conversation
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-800 focus:border-slate-700 focus:ring-1 focus:ring-slate-700 rounded-xl text-sm outline-none text-slate-200 placeholder-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Horizontal Filter Tags */}
      <div className="px-4 pb-2">
        <span className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">Categories</span>
        <div className="flex gap-1.5 overflow-x-auto py-2 scrollbar-none">
          {['All', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Conversation Groups */}
      <div className="flex-grow overflow-y-auto px-2 space-y-4">
        
        {Object.entries(chatGroups).map(([groupName, groupChats]) => {
          if (groupChats.length === 0) return null;
          
          return (
            <div key={groupName} className="space-y-1">
              <span className="px-3 text-[10px] font-bold tracking-widest text-slate-600 uppercase flex items-center gap-1.5">
                {groupName === 'Pinned' && <Pin className="w-3 h-3 text-indigo-400 fill-indigo-400" />}
                {groupName}
              </span>
              <div className="space-y-0.5">
                {groupChats.map(chat => {
                  const isActive = currentConversation?._id === chat._id;
                  const isEditing = editingChatId === chat._id;

                  return (
                    <div
                      key={chat._id}
                      className={`group relative flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-800/90 text-white'
                          : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-grow">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleSaveRename(chat._id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(chat._id)}
                            className="bg-slate-700/60 text-white px-2 py-0.5 rounded text-sm w-full outline-none focus:ring-1 focus:ring-indigo-500"
                            autoFocus
                          />
                          <button onClick={() => handleSaveRename(chat._id)} className="text-emerald-400 p-0.5">
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            selectConversation(chat._id);
                            if (closeSidebar) closeSidebar();
                          }}
                          className="flex items-center gap-2.5 flex-grow overflow-hidden pr-8"
                        >
                          <Folder className="w-4 h-4 shrink-0 text-slate-500" />
                          <span className="text-sm font-medium truncate">{chat.title}</span>
                        </div>
                      )}

                      {/* Quick Hover Controls */}
                      {!isEditing && (
                        <div className="absolute right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-slate-900 group-hover:from-slate-800/90 pl-3">
                          <button
                            onClick={() => handleStartEdit(chat)}
                            className="p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
                            title="Rename"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Toggle Pin */}
                          <button
                            onClick={() => updateConversation(chat._id, { isPinned: !chat.isPinned })}
                            className={`p-1 rounded transition-colors ${
                              chat.isPinned ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-500 hover:text-slate-200'
                            }`}
                            title={chat.isPinned ? 'Unpin' : 'Pin'}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Favorite */}
                          <button
                            onClick={() => updateConversation(chat._id, { isFavorite: !chat.isFavorite })}
                            className={`p-1 rounded transition-colors ${
                              chat.isFavorite ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-500 hover:text-slate-200'
                            }`}
                            title={chat.isFavorite ? 'Remove Favorite' : 'Favorite'}
                          >
                            <Star className={`w-3.5 h-3.5 ${chat.isFavorite ? 'fill-yellow-400' : ''}`} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteConversation(chat._id)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
          <div className="text-center py-8 text-xs text-slate-600">No chats found.</div>
        )}
      </div>

      {/* Footer Navigation panel */}
      <div className="p-3 border-t border-slate-800/80 space-y-2.5">
        
        {/* Stats button */}
        <button
          onClick={() => setShowStatsModal(true)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-xl transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Conversation Insights</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full py-2.5 bg-slate-850 hover:bg-rose-950/20 hover:text-rose-400 text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-800 hover:border-rose-900/30 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* STATISTICS MODAL */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowStatsModal(false)}
              className="absolute right-4 top-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" /> Conversation Analytics
            </h3>

            {stats ? (
              <div className="space-y-5 text-sm">
                
                {/* Metric cards */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-800">
                    <span className="text-2xl font-black text-indigo-400">{stats.totalConversations}</span>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Total Chats</p>
                  </div>
                  <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-800">
                    <span className="text-2xl font-black text-emerald-400">{stats.totalMessages}</span>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Total Messages</p>
                  </div>
                </div>

                {/* Category breakdown progress bars */}
                <div className="space-y-2 bg-slate-800/30 p-4 rounded-2xl border border-slate-800/50">
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
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Frequency chart summary */}
                <div className="space-y-2 bg-slate-800/30 p-4 rounded-2xl border border-slate-800/50">
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
