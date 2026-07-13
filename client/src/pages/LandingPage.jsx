import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Bot, Sparkles, History, Mic, Image, Moon, Sun, FileText, ArrowRight, Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-glow-gradient overflow-hidden flex flex-col font-sans transition-colors duration-300">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400">
            AI Chat Assistant
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-all duration-200"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {user ? (
            <Link
              to="/chat"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-200"
            >
              Go to Chat
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-200"
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4" /> Next-Generation Conversation
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Experience the Future of{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse-slow">
              AI Assistance
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A production-ready chatbot integrated with Google Gemini to handle documents, images, voice commands, and advanced code generation.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartChat}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/55 hover:scale-[1.02] flex items-center justify-center gap-2.5 transition-all duration-200"
            >
              Start Chatting Now <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all duration-200 text-center"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <section id="features" className="mt-24 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-effect p-8 rounded-3xl flex flex-col gap-4 shadow-xl shadow-slate-100/30 dark:shadow-none hover:scale-[1.02] transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Multimodal File Upload</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Upload PDFs, images, or code documents directly. The assistant parses content to answer detailed questions.
            </p>
          </div>

          <div className="glass-effect p-8 rounded-3xl flex flex-col gap-4 shadow-xl shadow-slate-100/30 dark:shadow-none hover:scale-[1.02] transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Voice Input & Output</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Talk to the AI with high-precision voice recognition, and hear responses read aloud with text-to-speech.
            </p>
          </div>

          <div className="glass-effect p-8 rounded-3xl flex flex-col gap-4 shadow-xl shadow-slate-100/30 dark:shadow-none hover:scale-[1.02] transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Image className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Image Generation</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Create visuals on the fly. Simply request an image, and Stable Diffusion will render it instantly in the conversation.
            </p>
          </div>
        </section>

        {/* Security / Production Grid */}
        <section className="mt-8 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-effect p-8 rounded-3xl flex items-start gap-5 shadow-xl shadow-slate-100/30 dark:shadow-none">
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Security-First Architecture</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Secured via Helmet, JWT Session authorization, bcrypt hashing, CORS blockers, and Winston/Morgan request logging.
              </p>
            </div>
          </div>
          
          <div className="glass-effect p-8 rounded-3xl flex items-start gap-5 shadow-xl shadow-slate-100/30 dark:shadow-none">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <History className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Persistent Chat History</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Save chats, customize categories, pin important prompts, export conversations as Markdown, Text, or PDF, and view performance graphs.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-xs text-slate-500 dark:text-slate-500 z-10 border-t border-slate-200/50 dark:border-slate-900/50 mt-12 bg-white/20 dark:bg-slate-950/10 backdrop-blur-sm">
        &copy; {new Date().getFullYear()} AI Chat Assistant. All rights reserved. Built with React and Gemini.
      </footer>
    </div>
  );
};

export default LandingPage;
