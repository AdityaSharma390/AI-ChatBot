import React, { useContext, useState, useRef, useEffect } from 'react';
import { ChatContext } from '../context/ChatContext';
import { useVoice } from '../hooks/useVoice';
import MessageItem from './MessageItem';
import { jsPDF } from 'jspdf';
import { 
  Send, Paperclip, Mic, MicOff, Image, Sparkles, Star, Pin, 
  Download, Trash2, X, ChevronDown, Bot, FileText, Menu, AlertCircle
} from 'lucide-react';

const ChatWindow = ({ toggleSidebar, sidebarOpen }) => {
  const {
    currentConversation,
    messages,
    sending,
    loading,
    error,
    categories,
    sendMessage,
    updateConversation,
    deleteConversation,
    generateImage
  } = useContext(ChatContext);

  const {
    isListening,
    transcript,
    browserSupportsSpeech,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  } = useVoice();

  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [imageGenMode, setImageGenMode] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync speech recognition transcript with input box
  useEffect(() => {
    if (transcript) {
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    }
  }, [transcript]);

  // Scroll to bottom whenever messages list grows
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Drag & Drop Handler
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Reuse file validator
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/markdown'
    ];
    if (!allowedTypes.includes(file.type)) {
      alert('Unsupported file type. Please upload a PDF, Image, or Text file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File exceeds 10MB limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || sending) return;

    const promptText = input;
    setInput('');
    const fileToSend = selectedFile;
    setSelectedFile(null);

    // Cancel speech synthesis playback when sending a new prompt
    stopSpeaking();

    if (imageGenMode) {
      await generateImage(promptText);
      setImageGenMode(false);
    } else {
      await sendMessage(promptText, fileToSend);
    }
  };

  // Trigger file dialog
  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  // EXPORT UTILITIES
  const handleExport = (format) => {
    if (messages.length === 0) return;
    const title = currentConversation?.title || 'AI-Chat-Export';

    if (format === 'txt') {
      const txtContent = messages
        .map(m => `[${m.role.toUpperCase()} - ${new Date(m.timestamp).toLocaleString()}]\n${m.content}\n\n`)
        .join('');
      downloadFile(txtContent, `${title}.txt`, 'text/plain');
    } else if (format === 'md') {
      const mdContent = `# ${title}\n\nExported on: ${new Date().toLocaleString()}\n\n---\n\n` + 
        messages.map(m => `### **${m.role === 'user' ? 'User' : 'Assistant'}**\n\n${m.content}\n\n---\n\n`).join('');
      downloadFile(mdContent, `${title}.md`, 'text/markdown');
    } else if (format === 'pdf') {
      // Direct PDF Export using jsPDF text wrapping
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(title, 20, 20);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Exported: ${new Date().toLocaleString()}`, 20, 28);
      doc.line(20, 32, 190, 32);

      let yPos = 40;
      doc.setFontSize(11);
      doc.setTextColor(40);

      messages.forEach(m => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        // Render role header
        doc.setFont("helvetica", "bold");
        const role = m.role === 'user' ? 'User:' : 'Assistant:';
        doc.text(role, 20, yPos);
        yPos += 6;

        // Render content
        doc.setFont("helvetica", "normal");
        // Strip markdown for pdf simplicity or print raw
        const cleanContent = m.content.replace(/[*#`_\-]/g, '');
        const splitText = doc.splitTextToSize(cleanContent, 170);
        
        splitText.forEach(line => {
          if (yPos > 275) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, 20, yPos);
          yPos += 5.5;
        });

        yPos += 8; // spacing between messages
      });

      doc.save(`${title}.pdf`);
    }
    setShowExportMenu(false);
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="flex-grow h-full flex flex-col bg-chatBg-light dark:bg-chatBg-dark transition-colors duration-300 relative"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {/* DRAG & DROP OVERLAY DROPZONE */}
      {isDragActive && (
        <div className="absolute inset-4 rounded-3xl border-3 border-dashed border-indigo-500 bg-indigo-500/10 dark:bg-indigo-600/5 backdrop-blur-md z-50 flex flex-col items-center justify-center pointer-events-none transition-all">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col items-center gap-3">
            <Paperclip className="w-10 h-10 text-indigo-600 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Drop to Attach File</h3>
            <p className="text-xs text-slate-500 max-w-[200px] text-center">Supports PDF documents, plain Text, or PNG/JPG Images.</p>
          </div>
        </div>
      )}

      {/* TOP HEADER NAVIGATION */}
      <header className="h-16 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-4 shrink-0 bg-white/70 dark:bg-slate-950/20 backdrop-blur-md z-20">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Hamburger toggle button for Mobile */}
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-xl md:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {currentConversation ? (
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-950 dark:text-white truncate">{currentConversation.title}</h1>
                {currentConversation.isPinned && <Pin className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500 shrink-0" />}
              </div>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                Category: {currentConversation.category}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              <h1 className="text-sm font-bold text-slate-950 dark:text-white">AI Assistant Chat</h1>
            </div>
          )}
        </div>

        {/* Toolbar menu if conversation is selected */}
        {currentConversation && (
          <div className="flex items-center gap-2">
            
            {/* Category dropdown toggle */}
            <div className="relative group/cat">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors">
                <span>Category</span> <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover/cat:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 min-w-[120px] z-50">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => updateConversation(currentConversation._id, { category: cat })}
                    className="w-full text-left px-4 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Favorite Star */}
            <button
              onClick={() => updateConversation(currentConversation._id, { isFavorite: !currentConversation.isFavorite })}
              className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all ${
                currentConversation.isFavorite ? 'text-yellow-400' : 'text-slate-400 hover:text-slate-900 dark:text-slate-500'
              }`}
            >
              <Star className={`w-4 h-4 ${currentConversation.isFavorite ? 'fill-yellow-400' : ''}`} />
            </button>

            {/* Pin Toggle */}
            <button
              onClick={() => updateConversation(currentConversation._id, { isPinned: !currentConversation.isPinned })}
              className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all ${
                currentConversation.isPinned ? 'text-indigo-500' : 'text-slate-400 hover:text-slate-900 dark:text-slate-500'
              }`}
            >
              <Pin className={`w-4 h-4 ${currentConversation.isPinned ? 'fill-indigo-500' : ''}`} />
            </button>

            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 transition-colors"
                title="Export conversation"
              >
                <Download className="w-4 h-4" />
              </button>
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 min-w-[140px] z-50">
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      Export as PDF (.pdf)
                    </button>
                    <button
                      onClick={() => handleExport('md')}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      Export as Markdown (.md)
                    </button>
                    <button
                      onClick={() => handleExport('txt')}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      Export as Text (.txt)
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Delete conversation */}
            <button
              onClick={() => deleteConversation(currentConversation._id)}
              className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
              title="Delete conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>

          </div>
        )}
      </header>

      {/* ERROR BOX BANNER */}
      {error && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* MESSAGES LIST BOX AREA */}
      <div className="flex-grow overflow-y-auto px-4 py-6 md:px-8 space-y-6">
        
        {loading && messages.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center flex-col gap-3">
            <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Loading conversation history...</p>
          </div>
        ) : messages.length === 0 ? (
          /* Blank state welcome prompt screen */
          <div className="h-full max-w-2xl mx-auto flex flex-col justify-center items-center text-center space-y-8 select-none py-12">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full animate-pulse-slow">
              <Bot className="w-12 h-12" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">What can I help with today?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md leading-relaxed">
                Send a question, upload a PDF, attach a PNG/JPG for visual analysis, or speak directly to talk to the model.
              </p>
            </div>
            
            {/* Quick click suggestions */}
            <div className="grid grid-cols-2 gap-3.5 w-full pt-4">
              <button
                onClick={() => setInput('Explain standard bubble sort algorithm in Javascript.')}
                className="p-4 text-left border border-slate-200 dark:border-slate-800 bg-white/50 hover:bg-slate-50 dark:bg-slate-900/30 dark:hover:bg-slate-900/60 text-xs font-semibold rounded-2xl text-slate-700 dark:text-slate-300 hover:scale-[1.01] active:scale-100 transition-all cursor-pointer"
              >
                💡 Javascript Sort Code
              </button>
              <button
                onClick={() => {
                  setInput('A beautiful sunset behind futuristic glass towers, digital art');
                  setImageGenMode(true);
                }}
                className="p-4 text-left border border-slate-200 dark:border-slate-800 bg-white/50 hover:bg-slate-50 dark:bg-slate-900/30 dark:hover:bg-slate-900/60 text-xs font-semibold rounded-2xl text-slate-700 dark:text-slate-300 hover:scale-[1.01] active:scale-100 transition-all cursor-pointer"
              >
                🎨 Generate Sunset Image
              </button>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <MessageItem key={msg._id} message={msg} onSpeak={speakText} />
          ))
        )}

        {/* AI Typing Thinking Indicator */}
        {sending && (
          <div className="flex gap-4 p-4 rounded-3xl bg-chatBubble-ai-light dark:bg-chatBubble-ai-dark border border-slate-100 dark:border-slate-800/40 w-fit">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 rounded-full typing-dot" />
              <div className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 rounded-full typing-dot" />
              <div className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 rounded-full typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* BOTTOM INPUT CONTAINER PANEL */}
      <footer className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md shrink-0 z-20">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto space-y-3">
          
          {/* File Attachment preview */}
          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl text-xs text-indigo-700 dark:text-indigo-400">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-semibold truncate max-w-sm">{selectedFile.name}</span>
                <span className="text-[10px] text-slate-400">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Combined Controls Input row */}
          <div className="flex gap-2">
            
            {/* Choose file upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.md"
            />
            <button
              type="button"
              onClick={triggerFileDialog}
              className="p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl transition-colors cursor-pointer"
              title="Attach File (PDF, text, images)"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Text prompt */}
            <div className="flex-grow relative flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                rows={1}
                className="w-full pl-4 pr-12 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-sm outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none transition-all"
                placeholder={imageGenMode ? "Describe the image you want to generate..." : "Type your prompt or question..."}
                style={{ maxHeight: '160px' }}
              />

              {/* Speech recognition toggle */}
              {browserSupportsSpeech && (
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`absolute right-3 p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse'
                      : 'text-slate-400 hover:text-slate-650'
                  }`}
                  title={isListening ? "Listening... click to stop" : "Speak message"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Image Gen Mode Toggle */}
            <button
              type="button"
              onClick={() => setImageGenMode(!imageGenMode)}
              className={`p-3.5 border rounded-2xl transition-colors cursor-pointer ${
                imageGenMode
                  ? 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Generate Image instead"
            >
              <Image className="w-5 h-5" />
            </button>

            {/* Send trigger */}
            <button
              type="submit"
              disabled={(!input.trim() && !selectedFile) || sending}
              className="p-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/40 text-white rounded-2xl shadow-md disabled:shadow-none hover:shadow-indigo-500/35 flex items-center justify-center transition-all cursor-pointer font-bold"
            >
              <Send className="w-5 h-5" />
            </button>

          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center block pt-1 select-none">
            AI Chat Assistant may make errors. Verify important information.
          </span>
        </form>
      </footer>

    </div>
  );
};

export default ChatWindow;
