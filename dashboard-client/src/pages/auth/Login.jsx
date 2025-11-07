"use client";

import { useEffect, useState } from "react";
import { saveInLocalStorage, fetchFromLocalStorage } from "../../services/localStorageService";
import { login } from "../../controllers/userController";
import { useNavigate } from 'react-router-dom';
import { refreshAxios } from "../../services/axiosService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = fetchFromLocalStorage('access_token');
    if (accessToken !== false) {
      navigate('/');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both your email and password.');
      setLoading(false);
      return;
    }

    try {
      const result = await login({
        email: email, 
        password: password
      });

      if (result[0] === true) {
        saveInLocalStorage('access_token', result[1].access_token);
        saveInLocalStorage('user', result[1].user); 
        setSuccess("Successfully logged in. Welcome back!");
        setError('');
        refreshAxios();
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(result[1]?.message || 'Login failed. Please check your internet connection and inputs and try again.');
      }  
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => login(null, "google");
  const handleGitHubLogin = () => login(null, "github");

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <svg className="w-10 h-10" style={{ color: '#FF214F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-indigo-100">Sign in to access your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              style={{ 
                background: 'linear-gradient(135deg, #FF214F 0%, #C4183C 100%)',
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm font-medium">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={handleGitHubLogin}
              className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <a href="/register" className="font-semibold hover:underline" style={{ color: '#FF214F' }}>
              Create account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}