import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-glow-gradient flex flex-col items-center justify-center px-6 text-center font-sans">
      <div className="space-y-6 max-w-md">
        <div className="inline-flex p-5 bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-500/25 animate-bounce">
          <Bot className="w-12 h-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">404</h1>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Page Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
          The requested assistant page could not be located. It might have been moved, deleted, or never existed in the first place.
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-200"
          >
            <Home className="w-5 h-5" /> Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
