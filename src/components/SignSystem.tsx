import React, { useState } from 'react';
import { motion } from 'motion/react';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { Shield, Sparkles, LogIn, Mail, Lock, User, AlertCircle, RefreshCw } from 'lucide-react';

interface SignSystemProps {
  onSuccess: (user: any, isNew: boolean) => void;
  onSkip: () => void;
}

export default function SignSystem({ onSuccess, onSkip }: SignSystemProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onSuccess(userCredential.user, false);
      } else {
        if (!name.trim()) {
          setError('Please provide your name.');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        onSuccess(userCredential.user, true);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password combination.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      onSuccess(userCredential.user, false);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked') {
        setError('Pop-up blocked by the browser. Please allow popups or use Email sign in.');
      } else {
        setError(err.message || 'Google authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial gradients for ambient aura */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 relative z-10"
      >
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-indigo-600 text-white shadow-lg shadow-emerald-500/20 mb-4">
            <Sparkles className="w-8 h-8 text-emerald-300" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Mindlytics<span className="text-emerald-400">Care</span></h1>
          <p className="text-slate-400 text-sm mt-2">
            AI-Powered Psychological Wellness & Behavioral Growth
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-white transition-all text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-white transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-white transition-all text-sm"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-300" />
            ) : (
              <>
                <LogIn className="w-4 h-4 text-emerald-300" />
                {isLogin ? 'Sign In to Platform' : 'Create Account'}
              </>
            )}
          </motion.button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-950 px-2.5 text-slate-500 font-semibold tracking-wider">
              Or connect securely
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={loading}
            type="button"
            className="w-full py-3 px-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-medium flex items-center justify-center gap-3 transition-colors cursor-pointer text-sm font-semibold shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.72 14.9 1 12 1 7.35 1 3.4 3.65 1.45 7.5l3.85 3C6.22 7.56 8.87 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.46c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.97 3.39-4.88 3.39-8.51z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.5c-.25-.75-.39-1.55-.39-2.38s.14-1.63.39-2.38l-3.85-3C.55 8.26 0 10.07 0 12s.55 3.74 1.45 5.38l3.85-2.88z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.08 7.96-2.92l-3.66-2.84c-1.01.68-2.31 1.08-4.3 1.08-3.13 0-5.78-2.52-6.73-5.46l-3.85 3C3.4 20.35 7.35 23 12 23z"
              />
            </svg>
            Continue with Google
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSkip}
            type="button"
            className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm"
          >
            Explore as Guest (Offline Cache)
          </motion.button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors cursor-pointer"
          >
            {isLogin ? "New to MindlyticsCare? Create an Account" : "Already have an account? Sign In"}
          </button>
        </div>

        <div className="mt-6 flex justify-center items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <Shield className="w-3.5 h-3.5 text-slate-600" />
          <span>HIPAA-aligned & End-to-End Encrypted Storage</span>
        </div>
      </motion.div>
    </div>
  );
}
