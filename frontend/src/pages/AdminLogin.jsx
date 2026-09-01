import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, setAuthToken } from '../services/api';

const AdminLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (emailToUse, passwordToUse) => {
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(emailToUse, passwordToUse);
      setAuthToken(response.token);
      onLogin(response.admin);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLoginSubmit(email, password);
  };

  const handleQuickDemoLogin = () => {
    setEmail('denise@theunimindproject.org');
    setPassword('UniMindAdmin2024!');
    handleLoginSubmit('denise@theunimindproject.org', 'UniMindAdmin2024!');
  };

  return (
    <div className="min-h-screen bg-[#F5F2EA] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl shadow-soft-hover border border-[#E3DCC8] max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Side: Brand & Feature Showcase */}
        <div className="bg-gradient-to-br from-[#FFF3D6] via-cream to-[#CDEBF7] p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E3DCC8]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sun flex items-center justify-center text-white text-2xl font-bold shadow-md">
                ☀️
              </div>
              <div>
                <h1 className="font-baloo font-extrabold text-navy text-2xl tracking-tight leading-none">
                  UniMind<span className="text-sun">Kidz</span>
                </h1>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A8B99]">
                  Educator & Admin Suite
                </span>
              </div>
            </div>

            <div className="pt-4">
              <h2 className="font-baloo font-bold text-navy text-xl leading-snug">
                Nervous-system-friendly SEL assessments & curriculum management.
              </h2>
              <p className="text-xs text-[#4A5D6D] mt-2 leading-relaxed">
                Manage 90-day curriculum content, record studio voiceovers, and monitor classroom social-emotional growth.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-navy font-nunito font-semibold bg-white/70 p-2.5 rounded-xl border border-[#E3DCC8]/60">
                <span className="text-base">🎙️</span>
                <span>Real Hosted Audio Studio + Voice Narration</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-navy font-nunito font-semibold bg-white/70 p-2.5 rounded-xl border border-[#E3DCC8]/60">
                <span className="text-base">🧘</span>
                <span>8-Second Hello Breathing Pacing</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-navy font-nunito font-semibold bg-white/70 p-2.5 rounded-xl border border-[#E3DCC8]/60">
                <span className="text-base">📊</span>
                <span>Real-Time Classroom & Student Roster Analytics</span>
              </div>
            </div>
          </div>

          <div className="pt-6 text-[11px] text-[#7A8B99] border-t border-[#E3DCC8]/60 flex items-center justify-between">
            <span>The UniMind Project</span>
            <a href="/" className="text-sky hover:text-navy font-bold">
              ← Student Classroom
            </a>
          </div>
        </div>

        {/* Right Side: Login Form & 1-Click Demo */}
        <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h3 className="font-baloo font-bold text-navy text-2xl">Staff Sign In</h3>
            <p className="text-xs text-[#7A8B99] mt-1">
              Sign in with your administrator or teacher credentials.
            </p>
          </div>

          {/* 1-Click Demo Button for Reviewers */}
          {/* <div className="mb-5 p-3.5 bg-[#FAF7F0] border border-sun/40 rounded-2xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-sun-dark">⚡ Quick Assessor Demo Access</span>
              <span className="text-[10px] bg-sun/20 text-sun-dark font-bold px-1.5 py-0.5 rounded">1-Click</span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              className="w-full py-2 px-3 bg-white hover:bg-sun hover:text-white border border-sun text-sun-dark rounded-xl font-baloo font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-2xs"
            >
              <span>🔑</span>
              <span>1-Click Sign In as Denise (Admin)</span>
            </button>
          </div> */}

          {/* <div className="flex items-center gap-2 my-2 text-xs text-[#9AA8B4]">
            <div className="flex-1 h-px bg-[#E3DCC8]" />
            <span>or sign in manually</span>
            <div className="flex-1 h-px bg-[#E3DCC8]" />
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-baloo font-bold text-navy text-xs mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full p-3 bg-[#FAF7F0] border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs font-semibold focus:bg-white focus:border-sun focus:outline-none transition-all"
                placeholder="admin@admin.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-baloo font-bold text-navy text-xs mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full p-3 bg-[#FAF7F0] border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs font-semibold focus:bg-white focus:border-sun focus:outline-none transition-all"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-coral/40 rounded-xl text-coral text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full btn-primary text-xs sm:text-sm py-3 shadow-md"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-xs text-sky hover:text-navy font-bold transition-colors">
              ← Return to Student View
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;