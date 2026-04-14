"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Form Data for OAuth2
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: formData.toString()
        });

        if (!data.ok) throw new Error("Invalid credentials");

        const json = await data.json();
        localStorage.setItem("access_token", json.access_token);

        // Redirect to dashboard (simulate)
        window.location.href = "/dashboard";
      } else {
        await apiRequest("/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        setIsLogin(true);
        setError("Account created! Please log in.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-neon-purple/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-neon-blue/20 blur-[120px]" />

      <div className="z-10 w-full max-w-md p-8 glass-panel rounded-2xl animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-outfit font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple mb-2">
            JobMate
          </h1>
          <p className="text-slate-400 text-sm">
            AI-Powered Resume Analysis, Job Matching & Job Tracker
          </p>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded text-sm border text-center ${error.includes('Account created') ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20' : 'bg-red-500/20 text-red-300 border-red-500/20'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-blue to-blue-600 font-semibold text-white shadow-lg hover:shadow-neon-blue/50 transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? "New to the platform?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-neon-blue hover:text-white transition-colors"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>
      </div>
    </main>
  );
}
