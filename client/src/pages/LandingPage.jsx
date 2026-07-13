import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Sparkles, History, Mic, Image, Moon, Sun, FileText, ArrowRight, Shield, Zap } from 'lucide-react';

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleStartChat = () => {
    if (user) {
      navigate('/chat');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen futuristic-grid overflow-hidden flex flex-col font-sans text-white relative">
      
      {/* Subtle gold radial glow in corner */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-yellow-500/[0.07] to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-yellow-500/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-yellow-500 rounded-xl shadow-lg shadow-yellow-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-slate-950" />
          </div>
          <span className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-400">
            BuildHub AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-all duration-200"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {user ? (
            <Link
              to="/chat"
              className="btn-glass-gold btn-glass-gold-sm text-sm"
            >
              Go to Chat
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 text-slate-400 hover:text-white font-semibold transition-colors text-sm"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="btn-glass-gold btn-glass-gold-sm text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-grow flex flex-col justify-center items-center px-6 py-12 z-10 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl space-y-6">

          {/* Animated Orb */}
          <div className="relative w-36 h-36 mx-auto mb-4 flex items-center justify-center animate-float">
            <div className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-500 to-yellow-600 blur-3xl opacity-20 animate-pulse-slow"></div>
            <div className="absolute w-24 h-24 rounded-full border border-yellow-500/10 bg-gradient-to-tr from-yellow-500/5 to-transparent animate-spin-slow"></div>
            <div className="absolute w-20 h-20 bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 orb-sphere opacity-80"></div>
            <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-60 pointer-events-none"></div>
            <div className="absolute w-20 h-20 rounded-full bg-white/[0.03] backdrop-blur-[2px] border border-white/10 shadow-inner"></div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4" /> Next-Generation Conversation
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Experience the Future of{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500">
              AI Assistance
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A production-ready chatbot integrated with Google Gemini to handle documents, images, voice commands, and advanced code generation.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-5">
            <div className="btn-glass-gold-wrapper">
              <button
                onClick={handleStartChat}
                className="btn-glass-gold w-full sm:w-auto"
              >
                Start Chatting Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/[0.04] border border-slate-800 text-slate-300 font-semibold hover:bg-white/[0.08] hover:border-slate-700 transition-all duration-300 text-center backdrop-blur-sm"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <section id="features" className="mt-24 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl flex flex-col gap-4 bg-[#090c14]/60 border border-slate-900 hover:border-yellow-500/20 hover:scale-[1.02] transition-all duration-200 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Multimodal File Upload</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload PDFs, images, or code documents directly. The assistant parses content to answer detailed questions.
            </p>
          </div>

          <div className="p-8 rounded-3xl flex flex-col gap-4 bg-[#090c14]/60 border border-slate-900 hover:border-yellow-500/20 hover:scale-[1.02] transition-all duration-200 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Voice Input & Output</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Talk to the AI with high-precision voice recognition, and hear responses read aloud with text-to-speech.
            </p>
          </div>

          <div className="p-8 rounded-3xl flex flex-col gap-4 bg-[#090c14]/60 border border-slate-900 hover:border-yellow-500/20 hover:scale-[1.02] transition-all duration-200 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Image className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Image Generation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Create visuals on the fly. Simply request an image, and Stable Diffusion will render it instantly in the conversation.
            </p>
          </div>
        </section>

        {/* Security / Production Grid */}
        <section className="mt-6 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl flex items-start gap-5 bg-[#090c14]/60 border border-slate-900 hover:border-yellow-500/20 transition-all duration-200 shadow-lg">
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Security-First Architecture</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Secured via Helmet, JWT Session authorization, bcrypt hashing, CORS blockers, and Winston/Morgan request logging.
              </p>
            </div>
          </div>
          
          <div className="p-8 rounded-3xl flex items-start gap-5 bg-[#090c14]/60 border border-slate-900 hover:border-yellow-500/20 transition-all duration-200 shadow-lg">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Persistent Chat History</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Save chats, customize categories, pin important prompts, export conversations as Markdown, Text, or PDF, and view performance graphs.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-xs text-slate-600 z-10 border-t border-slate-900/50 mt-12 bg-slate-950/20">
        &copy; {new Date().getFullYear()} BuildHub AI. All rights reserved. Built with React and Gemini.
      </footer>
    </div>
  );
};

export default LandingPage;
