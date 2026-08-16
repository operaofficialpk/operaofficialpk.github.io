import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase"; 
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";

const provider = new GoogleAuthProvider();

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Email & Password Register Handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  // Google Register / Login Handler
  const handleGoogleRegister = async () => {
    setError("");
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-center mb-6 uppercase tracking-wider">Create Account</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 text-center font-medium">
          {error}
        </div>
      )}
      
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <input 
          type="email" 
          placeholder="Email Address" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-xl px-4 py-3 outline-none text-sm focus:border-black transition"
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded-xl px-4 py-3 outline-none text-sm focus:border-black transition"
          required 
        />
        <button 
          type="submit" 
          className="bg-black text-white py-3 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-gray-800 transition cursor-pointer"
        >
          Register
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="px-3 text-gray-400 text-xs uppercase tracking-widest">Or</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* Google Login Button */}
      <button 
        type="button" 
        onClick={handleGoogleRegister}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.2v3.15C3.16 21.39 7.23 24 12 24z"/>
          <path fill="#FBBC05" d="M5.28 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.2C.44 8.13 0 9.87 0 12s.44 3.87 1.2 5.4l4.08-3.15z"/>
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.16 2.61 1.2 6.6l4.08 3.15c.95-2.84 3.6-4.95 6.72-4.95z"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-xs text-center mt-6 text-gray-500">
        Already have an account? <Link to="/login" className="text-black font-bold underline">Login</Link>
      </p>
    </div>
  );
}

export default Register;