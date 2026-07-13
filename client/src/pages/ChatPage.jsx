import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
  const { user, loading } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center futuristic-grid">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
          <div className="absolute w-8 h-8 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-full animate-pulse glow-gold"></div>
        </div>
        <p className="mt-4 text-slate-500 font-semibold text-sm">Synchronizing Secure Session...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#06080e]">
      
      {/* Sidebar Panel - slide-in drawer on mobile, static on desktop */}
      <div
        className={`fixed md:relative inset-y-0 left-0 w-80 shrink-0 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 bg-[#05070c] border-r border-slate-900 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay Backdrop for Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Main Chat Panel */}
      <div className="flex-grow h-full overflow-hidden flex flex-col relative">
        <ChatWindow toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      </div>

    </div>
  );
};

export default ChatPage;
