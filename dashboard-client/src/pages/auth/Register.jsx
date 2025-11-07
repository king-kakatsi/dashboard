"use client";

import { useEffect, useState } from "react";
import Login from "./Login";
import {  register } from "../../controllers/userController";
import { useNavigate } from 'react-router-dom';
import { fetchFromLocalStorage } from "../../services/localStorageService";
// import { Login } from "next-auth/react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
      // check if user is already authenticated
      const accessToken = fetchFromLocalStorage('access_token');
      if (accessToken !== false) {
        navigate('/');
      }
    },[]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        try {
            const result = await register({
              username: username,
              email: email,
              password: password,
              passwordConfirmation: confirmPassword
            });

            if (result[0] === true){
              setSuccess("Successfully register. You'll receive confirmation email!");
              setTimeout(() => navigate('/login'), 2000);
            } else {
              console.log(result[1])
              setError(result[1]?.message || 'Registration failed. Please check your internet connection and inputs and try again.');
            }
              
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        }
    setLoading(false);
  };


  const handleGoogleRegister = () => register(null, 'google');
  const handleGithubRegister = () => register(null, 'github');


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg px-8 py-10 w-full max-w-md"
      >
        <h1 className="text-2xl text-blue-600 font-bold text-center mb-6">Register</h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 px-3 py-2 rounded mb-4 text-sm">
            {success}
          </div>
        )}

          <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="w-full border text-gray-600 border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-300"
            placeholder="e.g. johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full border text-gray-600 border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-300"
            placeholder="e.g. user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full border text-gray-600 border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-300"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Confirm password */}
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full border text-gray-600 border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-300"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Social register buttons */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition mb-3"
        >
          Continue with Google
        </button>

        <button
          type="button"
          onClick={handleGithubRegister}
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition"
        >
          Continue with GitHub
        </button>

        {/* Link to login */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
