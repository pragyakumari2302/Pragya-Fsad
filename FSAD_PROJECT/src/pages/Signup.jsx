import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [facultyCode, setFacultyCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:9090/api";
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userType,
          email,
          password,
          facultyCode,
        }),
      });
      if (res.status === 201) {
        alert("Account created successfully!");
        navigate("/login");
      } else {
        const data = await res.json();
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      alert(err.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side (Branding Panel) */}
        <div className="md:w-1/2 bg-gradient-to-br from-[#b30000] via-[#cc0000] to-[#e63946] flex flex-col items-center justify-center p-8 text-white">
          <img
            src="/assets/images/kl logo.png"
            alt="KL University Logo"
            className="w-48 h-auto mb-4 drop-shadow-lg bg-white rounded-full p-2"
          />
          <h2 className="text-lg font-semibold text-center">
            Koneru Lakshmaiah <br /> Deemed to be University
          </h2>
        </div>

        {/* Right Side (Signup Form) */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Type Selection */}
            <div className="flex justify-center gap-6 mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="userType"
                  value="student"
                  checked={userType === "student"}
                  onChange={(e) => setUserType(e.target.value)}
                  className="accent-[#b30000]"
                />
                <span className="text-gray-700 font-medium">Student</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="userType"
                  value="faculty"
                  checked={userType === "faculty"}
                  onChange={(e) => setUserType(e.target.value)}
                  className="accent-[#b30000]"
                />
                <span className="text-gray-700 font-medium">Faculty</span>
              </label>
            </div>

            {/* Email */}
            <input
              type="email"
              placeholder="Email (must end with @gmail.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#b30000] outline-none"
              required
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#b30000] outline-none"
              required
            />

            {/* Faculty Code (if applicable) */}
            {userType === "faculty" && (
              <input
                type="text"
                placeholder="Faculty Code"
                value={facultyCode}
                onChange={(e) => setFacultyCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#b30000] outline-none"
                required
              />
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#b30000] hover:bg-[#990000] text-white font-semibold py-2 rounded-lg transition"
            >
              Create Account
            </button>

            {/* Redirect to Login */}
            <p
              className="text-sm text-center text-[#b30000] mt-3 cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Already have an account? Login
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
    