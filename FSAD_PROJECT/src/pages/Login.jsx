import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleDemoLogin = async (role) => {
    // Use real backend demo accounts seeded in the database
    const emails = {
      "Admin": "admin@system.com",
      "Teacher": "teacher@system.com",
      "Student": "student@system.com"
    };
    const demoEmail = emails[role] || "student@system.com";
    const demoPassword = "1234";
    await handleLoginRequest(demoEmail, demoPassword);
  };

  const handleLoginRequest = async (emailValue, passwordValue) => {
    setError("");

    if (!emailValue || !passwordValue) {
      setError("Please enter your credentials to ascend.");
      return;
    }

    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:9090/api";
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, password: passwordValue })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.token || !data.user) {
        setError(data.message || "Invalid credentials");
        return;
      }

      localStorage.setItem("jwtToken", data.token);
      login(data.user);

      let redirectTo = "/";
      if (data.user.role === "Admin") {
        redirectTo = "/admin";
      } else {
        redirectTo = location.state?.from?.pathname || "/";
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Login failed", err);
      setError("Unable to reach the authentication server. Make sure the backend is running.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await handleLoginRequest(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-900 via-sky-600 to-indigo-400">
      
      {/* Decorative Sky Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 opacity-20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-indigo-200 opacity-20 rounded-full blur-3xl animate-float"></div>
        
        {/* Simple Stars/Sparkles */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full opacity-80 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white rounded-full opacity-60 animate-pulse delay-700"></div>
        <div className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 bg-white rounded-full opacity-90 animate-pulse delay-1000"></div>
      </div>

      {/* Main Content Card */}
      <div className="z-10 w-full max-w-5xl flex flex-col md:flex-row bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] overflow-hidden m-4">
        
        {/* Left Side: Branding & Landing Message */}
        <div className="flex-1 p-10 md:p-16 flex flex-col justify-center text-white bg-gradient-to-b from-white/10 to-transparent">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            Campus<span className="text-blue-200">Core</span>
          </h1>
          <p className="text-lg md:text-xl font-light text-blue-50 mb-8 max-w-md leading-relaxed">
            Elevate your educational journey. Access your portal to infinite learning possibilities, soaring above the clouds.
          </p>
          
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-white/80">
            <span className="flex items-center gap-2">
               ✨ Seamless Experience
            </span>
            <span className="flex items-center gap-2">
               🔒 Secure Access
            </span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 bg-white p-10 md:p-16 flex flex-col justify-center rounded-l-3xl md:rounded-bl-none md:rounded-l-[40px] shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Please enter your details to sign in.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="student@campuscore.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Sign In
            </button>
          </form>

          {/* Quick Access Demo Roles */}
          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or quick login as</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                onClick={() => handleDemoLogin("Student")}
                className="flex justify-center py-2.5 border border-sky-200 rounded-xl text-sm font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors"
              >
                🎓 Student
              </button>
              <button
                onClick={() => handleDemoLogin("Teacher")}
                className="flex justify-center py-2.5 border border-indigo-200 rounded-xl text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                👨‍🏫 Teacher
              </button>
              <button
                onClick={() => handleDemoLogin("Admin")}
                className="flex justify-center py-2.5 border border-amber-200 rounded-xl text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
