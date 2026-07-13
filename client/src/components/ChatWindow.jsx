import React, { useContext, useState, useRef, useEffect } from 'react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { useVoice } from '../hooks/useVoice';
import MessageItem from './MessageItem';
import { jsPDF } from 'jspdf';
import { 
  Send, Paperclip, Mic, MicOff, Image, Sparkles, Star, Pin, 
  Download, Trash2, X, ChevronDown, Bot, FileText, Menu, AlertCircle,
  Truck, Layers, Calculator, ArrowUpRight
} from 'lucide-react';

const ChatWindow = ({ toggleSidebar, sidebarOpen }) => {
  const { user } = useContext(AuthContext);
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

  const renderInputForm = (isCenter = false) => {
    return (
      <form onSubmit={handleSend} className={`w-full max-w-3xl mx-auto ${isCenter ? 'px-0' : 'px-4'} space-y-3`}>
        {/* File Attachment preview */}
        {selectedFile && (
          <div className="flex items-center justify-between p-3 bg-yellow-950/20 border border-yellow-500/20 rounded-2xl text-xs text-yellow-500">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold truncate max-w-sm">{selectedFile.name}</span>
              <span className="text-[10px] text-slate-500">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-white"
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

          <div className="flex-grow flex items-center gap-3 w-full bg-[#090c14]/80 border border-slate-850 focus-within:border-yellow-500/30 rounded-full px-4 py-2.5 transition-all duration-200 shadow-inner">
            {/* Paperclip */}
            <button
              type="button"
              onClick={triggerFileDialog}
              className="p-2 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-yellow-500 rounded-full transition-colors cursor-pointer shrink-0"
              title="Attach File (PDF, text, images)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Model Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 border border-slate-850 rounded-full text-[10px] text-slate-300 font-bold tracking-wide select-none shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Gemini 3.5</span>
            </div>

            {/* Text prompt */}
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
              className="flex-grow bg-transparent border-none text-xs outline-none text-slate-200 placeholder-slate-500 resize-none py-1 pl-2"
              placeholder={imageGenMode ? "Describe the image you want to generate..." : "Tell us about your capabilities..."}
              style={{ maxHeight: '160px' }}
            />

            {/* Speech recognition toggle */}
            {browserSupportsSpeech && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse'
                    : 'text-slate-500 hover:text-yellow-500'
                }`}
                title={isListening ? "Listening... click to stop" : "Speak message"}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5 animate-pulse" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Image Gen Mode Toggle */}
            <button
              type="button"
              onClick={() => setImageGenMode(!imageGenMode)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                imageGenMode
                  ? 'text-yellow-500 bg-yellow-500/10'
                  : 'text-slate-500 hover:text-yellow-500'
              }`}
              title="Generate Image instead"
            >
              <Image className="w-3.5 h-3.5" />
            </button>

            {/* Send trigger */}
            <button
              type="submit"
              disabled={(!input.trim() && !selectedFile) || sending}
              className="w-8 h-8 rounded-full bg-yellow-500 disabled:bg-yellow-500/40 text-slate-950 flex items-center justify-center hover:scale-105 active:scale-100 transition-all cursor-pointer font-bold shrink-0 shadow-md shadow-yellow-500/10"
            >
              <Send className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      </form>
    );
  };

  return (
    <div 
      className="flex-grow h-full flex flex-col futuristic-grid text-slate-200 relative"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {/* DRAG & DROP OVERLAY DROPZONE */}
      {isDragActive && (
        <div className="absolute inset-4 rounded-3xl border-3 border-dashed border-yellow-500/30 bg-yellow-500/5 backdrop-blur-md z-50 flex flex-col items-center justify-center pointer-events-none transition-all">
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-3xl shadow-xl flex flex-col items-center gap-3">
            <Paperclip className="w-10 h-10 text-yellow-500 animate-bounce" />
            <h3 className="text-lg font-bold text-white">Drop to Attach File</h3>
            <p className="text-xs text-slate-500 max-w-[200px] text-center">Supports PDF documents, plain Text, or PNG/JPG Images.</p>
          </div>
        </div>
      )}

      {/* TOP HEADER NAVIGATION */}
      <header className="h-16 border-b border-slate-900/60 flex items-center justify-between px-6 shrink-0 bg-slate-950/10 backdrop-blur-md z-20">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Hamburger toggle button for Mobile */}
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-1 text-slate-400 hover:text-white hover:bg-slate-900/60 rounded-xl md:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {currentConversation ? (
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white truncate">{currentConversation.title}</h1>
                {currentConversation.isPinned && <Pin className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
              </div>
              <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                Category: {currentConversation.category}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center text-slate-950 font-bold select-none text-[10px]">BH</div>
              <h1 className="text-xs font-bold text-white tracking-wider uppercase">BuildHub</h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentConversation && (
            <div className="flex items-center gap-2">
              {/* Category dropdown toggle */}
              <div className="relative group/cat">
                <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-[10px] font-bold text-slate-400 transition-colors">
                  <span>Category</span> <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute right-0 top-full mt-1.5 hidden group-hover/cat:block bg-[#0b0e17] border border-slate-800 rounded-2xl shadow-xl py-1.5 min-w-[120px] z-50">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => updateConversation(currentConversation._id, { category: cat })}
                      className="w-full text-left px-4 py-1.5 hover:bg-slate-900 text-xs font-semibold text-slate-400 hover:text-yellow-400 transition-all"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Favorite Star */}
              <button
                onClick={() => updateConversation(currentConversation._id, { isFavorite: !currentConversation.isFavorite })}
                className={`p-2 rounded-xl hover:bg-slate-900 transition-all ${
                  currentConversation.isFavorite ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                <Star className={`w-4 h-4 ${currentConversation.isFavorite ? 'fill-yellow-400' : ''}`} />
              </button>

              {/* Pin Toggle */}
              <button
                onClick={() => updateConversation(currentConversation._id, { isPinned: !currentConversation.isPinned })}
                className={`p-2 rounded-xl hover:bg-slate-900 transition-all ${
                  currentConversation.isPinned ? 'text-yellow-500' : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                <Pin className={`w-4 h-4 ${currentConversation.isPinned ? 'fill-yellow-500' : ''}`} />
              </button>
            </div>
          )}

          {/* User Profile Avatar Circle */}
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/40 flex items-center justify-center font-bold text-xs shadow-md select-none">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
        </div>
      </header>

      {/* ERROR BOX BANNER */}
      {error && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 text-rose-400 text-sm flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* MESSAGES LIST BOX AREA */}
      <div className="flex-grow overflow-y-auto px-4 py-6 md:px-8 space-y-6 flex flex-col justify-between">
        
        {loading && messages.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center flex-col gap-3">
            <div className="w-10 h-10 border-3 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500">Loading conversation history...</p>
          </div>
        ) : messages.length === 0 ? (
          /* Blank state welcome prompt screen styled exactly like the screenshot */
          <div className="h-full flex flex-col justify-center items-center select-none py-12 max-w-4xl mx-auto w-full">
            
            {/* Swirling glowing gold orb */}
            <div className="relative w-44 h-44 flex items-center justify-center animate-float mb-6 shrink-0">
              {/* Layer 1: Wide soft ambient aura */}
              <div className="absolute w-40 h-40 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-500 to-yellow-600 blur-3xl opacity-20 animate-pulse-slow"></div>
              {/* Layer 2: Spinning energy ring */}
              <div className="absolute w-32 h-32 rounded-full border border-yellow-500/10 bg-gradient-to-tr from-yellow-500/5 to-transparent animate-spin-slow"></div>
              {/* Layer 3: The main golden sphere — uses orb-sphere class for morph+glow */}
              <div className="absolute w-24 h-24 bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 orb-sphere opacity-80"></div>
              {/* Layer 4: Inner specular highlight (top-left light catch) */}
              <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-60 pointer-events-none"></div>
              {/* Layer 5: Glass overlay for depth */}
              <div className="absolute w-24 h-24 rounded-full bg-white/[0.03] backdrop-blur-[2px] border border-white/10 shadow-inner"></div>
            </div>

            <div className="space-y-2 text-center mb-8 shrink-0">
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-100 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                Welcome back {user?.name ? user.name.split(' ')[0] : 'Alex'}!
              </h2>
              <p className="text-slate-400 text-xs tracking-wide">
                Which house drawing do you want to analyze today?
              </p>
            </div>

            {/* Input Form in the center */}
            <div className="w-full max-w-2xl px-4 mb-8">
              {renderInputForm(true)}
            </div>

            {/* Three suggestions cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl pt-2 px-4 shrink-0">
              <button
                type="button"
                onClick={() => setInput("Search for suppliers who provide the best prices for drawing projects.")}
                className="p-4 text-left border border-slate-900 bg-[#090c14]/40 hover:bg-[#0b0e17]/80 rounded-2xl transition-all duration-200 cursor-pointer group flex items-start gap-3 hover:border-yellow-500/20 shadow-lg"
              >
                <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl group-hover:bg-yellow-500 group-hover:text-slate-950 transition-colors shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-white mb-1">Search for suppliers</h4>
                  <p className="text-[9px] text-slate-500 leading-relaxed">We will find suppliers with the best prices.</p>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setInput("Select the best materials based on standard building regulations.")}
                className="p-4 text-left border border-slate-900 bg-[#090c14]/40 hover:bg-[#0b0e17]/80 rounded-2xl transition-all duration-200 cursor-pointer group flex items-start gap-3 hover:border-yellow-500/20 shadow-lg"
              >
                <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl group-hover:bg-yellow-500 group-hover:text-slate-950 transition-colors shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-white mb-1">Select materials</h4>
                  <p className="text-[9px] text-slate-500 leading-relaxed font-medium">AI BuildHub will select the best materials.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setInput("Calculate the estimated cost for building and materials.")}
                className="p-4 text-left border border-slate-900 bg-[#090c14]/40 hover:bg-[#0b0e17]/80 rounded-2xl transition-all duration-200 cursor-pointer group flex items-start gap-3 hover:border-yellow-500/20 shadow-lg"
              >
                <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl group-hover:bg-yellow-500 group-hover:text-slate-950 transition-colors shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-white mb-1">Calculation of the cost</h4>
                  <p className="text-[9px] text-slate-500 leading-relaxed font-medium">Our AI will help you to quickly summarize the price.</p>
                </div>
              </button>
            </div>

          </div>
        ) : (
          <div className="space-y-6">
            {messages.map(msg => (
              <MessageItem key={msg._id} message={msg} onSpeak={speakText} />
            ))}
          </div>
        )}

        {/* AI Typing Thinking Indicator */}
        {sending && messages.length > 0 && (
          <div className="flex gap-4 p-4 rounded-3xl bg-slate-900/40 border border-slate-900 w-fit mt-4">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-yellow-500/60 rounded-full typing-dot" />
              <div className="w-2 h-2 bg-yellow-500/60 rounded-full typing-dot" />
              <div className="w-2 h-2 bg-yellow-500/60 rounded-full typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* BOTTOM INPUT CONTAINER PANEL */}
      {messages.length > 0 && (
        <footer className="p-4 border-t border-slate-900/60 bg-[#05070c] shrink-0 z-20">
          {renderInputForm(false)}
          <span className="text-[9px] text-slate-500 text-center block pt-2 select-none">
            AI Chat Assistant may make errors. Verify important information.
          </span>
        </footer>
      )}

    </div>
  );
};

export default ChatWindow;
