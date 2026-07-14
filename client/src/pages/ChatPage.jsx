import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

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
