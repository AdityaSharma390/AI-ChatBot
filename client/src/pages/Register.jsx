import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, ArrowRight, Zap } from 'lucide-react';

const Register = () => {
  const { register, user, error: authError } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      navigate('/chat');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 futuristic-grid relative overflow-hidden">
      
      {/* Gold ambient glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-yellow-500/[0.06] to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-yellow-500/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">

        {/* Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-yellow-500 rounded-xl shadow-lg shadow-yellow-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-slate-950" />
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-400">
              BuildHub AI
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Create an account</h2>
          <p className="text-sm text-slate-500 mt-2">Get started with your free chat profile</p>
        </div>

        {/* Card Form */}
        <div className="p-8 rounded-3xl bg-[#090c14]/80 border border-slate-900 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Error alerts */}
            {(error || authError) && (
              <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 text-rose-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error || authError}</span>
              </div>
            )}

            {/* Full Name Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 rounded-2xl text-sm text-white placeholder-slate-600 transition-all outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 rounded-2xl text-sm text-white placeholder-slate-600 transition-all outline-none"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 rounded-2xl text-sm text-white placeholder-slate-600 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/40 text-slate-950 rounded-2xl font-bold shadow-lg shadow-yellow-500/15 hover:shadow-yellow-500/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-100 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Register <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-yellow-500 hover:text-yellow-400 hover:underline font-semibold">
              Log In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
