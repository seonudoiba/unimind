import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, setAuthToken } from '../services/api';

const AdminLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);
      setAuthToken(response.token);
      onLogin(response.admin);
      navigate('/admin'); // Redirect to admin dashboard
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#CDEBF7] via-cream to-cream p-4">
      <div className="bg-white rounded-2xl shadow-soft-hover p-6 sm:p-8 max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="font-baloo text-2xl sm:text-3xl text-navy">📚 UniMindKidz</h1>
          <p className="text-[#7A8B99] mt-2 text-sm sm:text-base">Admin Login</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-baloo font-semibold text-navy mb-1 text-sm sm:text-base">Email</label>
            <input
              type="email"
              className="w-full p-3 border-2 border-[#E3DCC8] rounded-xl font-nunito focus:border-sun focus:outline-none text-sm sm:text-base"
              placeholder="admin@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block font-baloo font-semibold text-navy mb-1 text-sm sm:text-base">Password</label>
            <input
              type="password"
              className="w-full p-3 border-2 border-[#E3DCC8] rounded-xl font-nunito focus:border-sun focus:outline-none text-sm sm:text-base"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#FBE7E3] border-2 border-coral rounded-xl text-coral text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full btn-primary text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-[#7A8B99]">
          <p>Default admin: denise@theunimindproject.org</p>
          <p>Password: UniMindAdmin2024!</p>
        </div>
        
        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-sky hover:text-sun-dark transition-colors">
            ← Back to Student View
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;