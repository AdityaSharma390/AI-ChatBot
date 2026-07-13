import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Volume2, VolumeX, FileText, Sparkles, User } from 'lucide-react';

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code block', err);
    }
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-lg font-mono">
      {/* Code Header Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      {/* Code Area */}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed text-slate-200">
        <code>{value}</code>
      </pre>
    </div>
  );
};

const MessageItem = ({ message, onSpeak }) => {
  const isAI = message.role === 'assistant';
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    } catch (err) {
      console.error('Failed to copy response', err);
    }
  };

  const handleSoundToggle = () => {
    if (isPlayingSound) {
      window.speechSynthesis.cancel();
      setIsPlayingSound(false);
    } else {
      setIsPlayingSound(true);
      onSpeak(message.content);
      
      // Stop indicating active playback when voice synthesis completes
      if ('speechSynthesis' in window) {
        const checkSpeech = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            setIsPlayingSound(false);
            clearInterval(checkSpeech);
          }
        }, 1000);
      }
    }
  };

  return (
    <div className={`flex gap-4 p-5 rounded-3xl transition-colors ${
      isAI 
        ? 'bg-chatBubble-ai-light dark:bg-chatBubble-ai-dark border border-slate-200/40 dark:border-slate-800/40' 
        : 'bg-transparent'
    }`}>
      
      {/* Avatar Icons */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
        isAI
          ? 'bg-indigo-150 text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-400'
          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
      }`}>
        {isAI ? <Sparkles className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>

      {/* Message Contents */}
      <div className="flex-grow space-y-3 overflow-hidden">
        
        {/* Render Attached Files if present */}
        {message.fileName && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl text-xs text-indigo-600 dark:text-indigo-400">
            <FileText className="w-4 h-4 shrink-0" />
            <span className="font-semibold truncate max-w-xs">{message.fileName}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">{message.fileType.split('/')[1] || 'doc'}</span>
            {message.fileUrl && message.fileType.startsWith('image/') && (
              <a 
                href={message.fileUrl} 
                target="_blank" 
                rel="noreferrer"
                className="ml-2 hover:underline font-bold text-indigo-800 dark:text-indigo-300"
              >
                View
              </a>
            )}
          </div>
        )}

        {/* Display image thumbnail in chat if it's an uploaded image */}
        {message.fileUrl && message.fileType.startsWith('image/') && (
          <div className="my-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-w-sm shadow-md">
            <img 
              src={message.fileUrl} 
              alt={message.fileName || 'Attachment image'} 
              className="w-full h-auto object-cover max-h-60"
            />
          </div>
        )}

        {/* Main text formatted with Markdown */}
        <div className="prose-custom dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom parser to map pre/code markdown tags to our CodeBlock component
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <CodeBlock
                    language={match[1]}
                    value={String(children).replace(/\n$/, '')}
                  />
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Bubble footer actions */}
        <div className="flex items-center gap-3 pt-2">
          
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold select-none">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          {/* Copy Response text button */}
          <button
            onClick={handleCopyResponse}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
            title="Copy response"
          >
            {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Read aloud AI response */}
          {isAI && (
            <button
              onClick={handleSoundToggle}
              className={`p-1 rounded-lg transition-all cursor-pointer ${
                isPlayingSound 
                  ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20' 
                  : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
              title={isPlayingSound ? "Stop voice" : "Read aloud response"}
            >
              {isPlayingSound ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}

        </div>

      </div>
    </div>
  );
};

export default MessageItem;
