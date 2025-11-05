"use client";

import { useState } from "react";
// import { Login } from "next-auth/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle classic email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate API request
    await new Promise((r) => setTimeout(r, 1000));

    if (email === "admin@gmail.com" && password === "123456") {
      alert("Login successful");
      // Example: redirect to dashboard
      // router.push("/dashboard");
    } else {
      setError("Invalid email or password.");
    }

    setLoading(false);
  };

  // Social login handlers
  const handleGoogleLogin = () => Login("google");
  const handleGitHubLogin = () => Login("github");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg px-8 py-10 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

      
        {/* Email input */}

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-300"
            placeholder="e.g. admin@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password input */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-300"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Social logins */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition mb-3"
        >
          Continue with Google
        </button>

        <button
          type="button"
          onClick={handleGitHubLogin}
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition"
        >
          Continue with GitHub
        </button>

        {/* Link to register */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
