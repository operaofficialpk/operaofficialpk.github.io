import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Firebase Auth امپورٹ کریں
import { auth } from "../firebase"; // اپنے پروجیکٹ کے مطابق پاتھ چیک کر لیں
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // اگر صارف پہلے سے لاگ ان ہے تو اسے سیدھا ایڈمن پینل پر بھیج دیں
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/admin");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // فائر بیس کے ذریعے سکیور اتھنٹیکیشن
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (err) {
      // سیکیورٹی وجوہات کی بنا پر عام ایرور میسج دکھائیں
      setError("Invalid Email or Password! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Opera Admin Portal
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Sign in to manage your store
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Admin Email
            </label>
            <input
              type="email"
              required
              placeholder="admin@opera.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-zinc-800 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition cursor-pointer shadow-md disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Secure Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;