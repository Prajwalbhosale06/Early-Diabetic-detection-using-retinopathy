import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';

interface LoginViewProps {
  onLogin?: () => void;
  onLoginSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onLoginSuccess }) => {
  const [email, setEmail] = useState('dr.prajwal@retinaai.health');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const triggerLogin = () => {
    if (typeof onLogin === 'function') {
      onLogin();
    } else if (typeof onLoginSuccess === 'function') {
      onLoginSuccess();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      triggerLogin();
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Ambient Background Elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-100/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-100/40 blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(30,27,75,0.07)] overflow-hidden grid grid-cols-1 md:grid-cols-12 z-10">
        
        {/* Left Visual AI Hero Panel */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#1E1B4B] via-[#241F5A] to-[#141235] p-8 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle Retinal Aperture Geometric Graphic */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 pointer-events-none opacity-25">
            <div className="w-full h-full rounded-full border border-cyan-400/40 animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-8 rounded-full border border-teal-400/30" />
            <div className="absolute inset-16 rounded-full border border-dashed border-cyan-300/40" />
            <div className="absolute inset-28 rounded-full bg-cyan-500/10 blur-xl" />
          </div>

          {/* Top Logo */}
          <div className="relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 rounded-full border border-cyan-300 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee]" />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tight">
                Retina<span className="text-cyan-400">AI</span>
              </span>
            </div>
            <div className="mt-2 text-xs text-indigo-200 font-mono tracking-wide">
              Clinical Retinal Intelligence
            </div>
          </div>

          {/* Center Graphic & Mission Statement */}
          <div className="my-8 relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Deep Learning v4.2 Diagnostic Engine</span>
            </div>
            <h2 className="text-2xl font-bold leading-snug tracking-tight text-slate-50">
              AI-assisted retinal microvascular screening.
            </h2>
            <p className="text-xs text-indigo-200/90 leading-relaxed">
              Detect early signs of pre-diabetes and vascular remodeling through high-precision retinal fundus analysis.
            </p>

            <div className="pt-3 space-y-2 text-xs text-indigo-100/90">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sub-millimeter microaneurysm localization</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>98.2% AUROC pre-diabetes vascular correlation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automated image quality & focus grading</span>
              </div>
            </div>
          </div>

          {/* Bottom Security / Certification Badge */}
          <div className="relative z-10 pt-4 border-t border-indigo-900/60 flex items-center justify-between text-[11px] text-indigo-300 font-mono">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              <span>HIPAA Compliant</span>
            </span>
            <span>256-bit TLS</span>
          </div>
        </div>

        {/* Right Sign-in Form Panel */}
        <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-xl font-extrabold text-[#1E1B4B]">
                  Clinician Sign In
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your hospital or clinical credentials to continue
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-900 border border-indigo-100">
                Staff Portal
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Username Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Clinical Email or Medical ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50/70 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900/10 focus:border-indigo-900 transition-all"
                    placeholder="name@hospital.org"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-cyan-700 hover:text-cyan-800 hover:underline"
                    onClick={() => setNoticeMessage('A password reset link has been dispatched to administrator Dr. Evelyn Wilson.')}
                  >
                    Forgot password?
                  </button>
                </div>
                {noticeMessage && (
                  <div className="p-2 mb-2 rounded-lg bg-cyan-50 border border-cyan-200 text-[11px] text-cyan-800 flex items-center justify-between">
                    <span>{noticeMessage}</span>
                    <button 
                      type="button" 
                      onClick={() => setNoticeMessage(null)}
                      className="text-cyan-900 font-bold ml-2 hover:opacity-75"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-slate-50/70 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900/10 focus:border-indigo-900 transition-all font-mono"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    id="btn-toggle-show-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-900 focus:ring-indigo-900 w-3.5 h-3.5"
                  />
                  <span>Keep workstation logged in for this shift (8h)</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="btn-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#1E1B4B] text-white hover:bg-[#2A2666] active:scale-[0.99] shadow-md shadow-indigo-950/15 transition-all disabled:opacity-75 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating Physician...</span>
                  </div>
                ) : (
                  <>
                    <span>Enter Clinical Workspace</span>
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Physician Access */}
            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-700">Quick Access:</span>
                <span className="text-slate-500 ml-1">Dr. Evelyn Wilson, MD (Retinal Lead)</span>
              </div>
              <button
                type="button"
                onClick={triggerLogin}
                className="text-xs font-bold text-cyan-700 hover:text-cyan-800 hover:underline cursor-pointer"
              >
                1-Click Login →
              </button>
            </div>
          </div>

          {/* Footer Security Notice */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>FDA 510(k) Cleared Software as Medical Device</span>
            <span>RetinaNet v4.2.1-prod</span>
          </div>
        </div>

      </div>
    </div>
  );
};
