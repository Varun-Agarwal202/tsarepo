import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Signup ()  {
    const navigate = useNavigate();
    const { setIsAuthenticated, setUser, setRole } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password1: "",
        password2: "",
        role: "user", // new role field
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // log the immediate event values (reliable)
        console.log('heyyyyw', name, value);
    };

    // log when formData actually updates
    useEffect(() => {
        console.log('formData updated', formData);
    }, [formData]);

    function getCookie(name) {
        const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return v ? v.pop() : '';
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setError("");
        setSuccess("");
        setSubmitting(true);

        try {
            const csrf = getCookie('csrftoken');
            const reg = await fetch("https://tsarepo-production.up.railway.app/auth/registration/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrf,
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });
            if (!reg.ok) {
                const err = await reg.json().catch(() => ({ detail: reg.statusText }));
                throw new Error(err.detail || "Registration failed");
            }

            // try to login the new user so /auth/user/ reflects the new account
            // (skip this if you require email confirmation before login)
            const login = await fetch("https://tsarepo-production.up.railway.app/auth/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username: formData.username, password: formData.password1 }),
            });

            if (login.ok) {
                const loginRes = await login.json();
                // Store token so AuthContext can find it
                if (loginRes.key) localStorage.setItem('authToken', loginRes.key);
                const userRes = await fetch("https://tsarepo-production.up.railway.app/auth/user/", { credentials: "include" });
                if (userRes.ok) {
                    const userJson = await userRes.json();
                    console.log('[Signup] /auth/user/ payload:', userJson);
                    setUser(userJson);

                    // fetch profile/role from dedicated endpoint
                    try {
                      const profileRes = await fetch("https://tsarepo-production.up.railway.app/api/my_profile/", {
                        method: "GET",
                        headers: { "Content-Type": "application/json", Authorization: `Token ${loginRes.key}` },
                      });
                      if (profileRes.ok) {
                        const profileJson = await profileRes.json();
                        console.log('[Signup] /api/my_profile/ payload:', profileJson);
                        const resolvedRole = profileJson?.role || null;
                        console.log('[Signup] resolvedRole:', resolvedRole);
                        if (resolvedRole) {
                          setRole(resolvedRole);
                          localStorage.setItem('role', resolvedRole);
                        }
                      } else {
                        console.warn('[Signup] /api/my_profile/ not ok, status:', profileRes.status);
                      }
                    } catch (e) {
                      console.error('[Signup] failed to fetch my_profile:', e);
                    }

                    setIsAuthenticated(true);
                } else {
                    console.warn('[Signup] /auth/user/ not ok after login, status:', userRes.status);
                }
            } else {
                // email-confirmation flows often block immediate login
                setSuccess("Registered. Check your email to confirm before logging in.");
            }

            navigate("/");
        } catch (err) {
            setError(err.message || "Signup error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
      <div className="min-h-screen flex flex-col bg-transparent">
        <Navbar />
        <main className="bf-page-shell flex-1 flex items-center justify-center">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center w-full">
            {/* Left: Hero copy */}
            <section className="space-y-6 text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-emerald-300 bf-pill">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Join the BusinessFinder community
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Create an account to explore
                <span className="text-emerald-600 dark:text-emerald-300"> local favorites</span>.
              </h1>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-xl">
                Whether you&apos;re discovering new spots or representing your own business,
                BusinessFinder helps connect you with your local community.
              </p>
            </section>

            {/* Right: Signup card */}
            <section className="bf-card w-full max-w-md mx-auto p-6 md:p-7 lg:p-8">
              <header className="mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">Sign up</h2>
                <p className="mt-1.5 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                  Fill in your details to get started. You can sign up as a regular user or a business.
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
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label htmlFor="email" className="block text-xs font-medium text-slate-300 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2 text-left">
                    <label htmlFor="password1" className="block text-xs font-medium text-slate-300 uppercase tracking-wide">
                      Password
                    </label>
                    <input
                      id="password1"
                      type="password"
                      name="password1"
                      placeholder="Create a password"
                      value={formData.password1}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label htmlFor="password2" className="block text-xs font-medium text-slate-300 uppercase tracking-wide">
                      Confirm password
                    </label>
                    <input
                      id="password2"
                      type="password"
                      name="password2"
                      placeholder="Repeat password"
                      value={formData.password2}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label htmlFor="role" className="block text-xs font-medium text-slate-300 uppercase tracking-wide">
                    Account type
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="user">User – discover local businesses</option>
                    <option value="business">Business – showcase your place</option>
                  </select>
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
                  className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-sm hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-slate-950 transition-colors disabled:opacity-70"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Signing up…' : 'Sign up'}
                </button>
              </form>

              <p className="mt-5 text-xs text-slate-400 text-center">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-medium text-emerald-300 hover:text-emerald-200 underline underline-offset-4"
                >
                  Log in
                </button>
              </p>
            </section>
          </div>
        </main>
      </div>
    );
}
