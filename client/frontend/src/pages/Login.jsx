import React from 'react'
import { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { redirect } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
          username: "",
          password: "",
      });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { setIsAuthenticated, setUser, setRole } = useContext(AuthContext)
  
  const handleChange = (e) => {
      setFormData({
          ...formData,
          [e.target.name]: e.target.value
      });
      console.log(formData);
  };
 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  
  try {
    const res = await axios.post(
      'http://tsarepo-production.up.railway.app/auth/login/',
      formData,
      { headers: { 'Content-Type': 'application/json' } }
    );
    // Save the token first
    localStorage.setItem("authToken", res.data.key);

    const userRes = await axios.get('http://tsarepo-production.up.railway.app/auth/user/', {
      headers: { Authorization: `Token ${res.data.key}` }
    });
    console.log('[Login] /auth/user/ payload:', userRes.data);
    const userData = userRes.data;

    // Fetch profile/role from dedicated endpoint
    let resolvedRole = null;
    try {
      const profileRes = await axios.get('http://tsarepo-production.up.railway.app/api/my_profile/', {
        headers: { Authorization: `Token ${res.data.key}` }
      });
      console.log('[Login] /api/my_profile/ payload:', profileRes.data);
      resolvedRole = profileRes.data?.role || null;
    } catch (e) {
      console.error('[Login] failed to fetch my_profile:', e);
    }
    console.log('[Login] resolvedRole:', resolvedRole);

    setIsAuthenticated(true);
    setUser(userData);
    if (resolvedRole) {
      setRole(resolvedRole);
      localStorage.setItem('role', resolvedRole);
    }
    localStorage.setItem("user", JSON.stringify(userData));
    setSuccess("Logged in successfully!");
    navigate('/');
  } catch (err) {
    console.error("Login error:", err.response?.data);
    setError("Login failed");
  }
};
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <main className="bf-page-shell flex-1 flex items-center justify-center">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center w-full">
          {/* Left: Hero copy */}
          <section className="space-y-6 text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-sky-600 dark:text-sky-300 bf-pill">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              Welcome back to BusinessFinder
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Sign in to discover and support
              <span className="text-sky-400"> local businesses</span>.
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-xl">
              Continue exploring nearby spots, managing bookmarks, and staying connected
              with the businesses that matter in your community.
            </p>
          </section>

          {/* Right: Auth card */}
            <section className="bf-card w-full max-w-md mx-auto p-6 md:p-7 lg:p-8">
            <header className="mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">Log in</h2>
                <p className="mt-1.5 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                Enter your credentials to access your BusinessFinder account.
              </p>
            </header>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2 text-left">
                <label htmlFor="username" className="block text-xs font-medium text-slate-300 uppercase tracking-wide">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2 text-left">
                <label htmlFor="password" className="block text-xs font-medium text-slate-300 uppercase tracking-wide">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              {error && (
                <p className="text-xs text-rose-400 bg-rose-950/50 border border-rose-800/60 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-700/50 rounded-md px-3 py-2">
                  {success}
                </p>
              )}

              <button
                type="submit"
                className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-sm hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 focus-visible:ring-offset-slate-950 transition-colors"
              >
                Log in
              </button>
            </form>

            <p className="mt-5 text-xs text-slate-400 text-center">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="font-medium text-sky-300 hover:text-sky-200 underline underline-offset-4"
              >
                Create one
              </button>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Login