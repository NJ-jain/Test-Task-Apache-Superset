import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [userData, setUserData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const tokenExpired = localStorage.getItem("token_expired");
  useEffect(() => {
    if (tokenExpired === "true") {
      toast.error("Your session has expired. Please log in again.");
      localStorage.removeItem("token_expired");
    }
  }, [tokenExpired]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = { username: "", password: "" };
    let isValid = true;

    if (!userData.username) {
      errors.username = "Username is required.";
      isValid = false;
    }

    if (!userData.password) {
      errors.password = "Password is required.";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    // Validate the form before proceeding
    if (!validateForm()) {
      return;
    }
    try {
      const response = await axios.post("/api/api/v1/security/login", {
        username: userData.username,
        password: userData.password,
        provider: "db",
        refresh: true,
      });

      if (response.data) {
        localStorage.setItem("auth_token", response.data.access_token);
        navigate("/chart");
      }
    } catch (error) {
      setError("Invalid username or password. Please try again.", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-700 to-purple-800 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">
          Welcome Back
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className={`w-full px-4 py-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg ${formErrors.username ? "border-red-500" : ""
                }`}
            />
            {formErrors.username && (
              <p className="text-red-500 text-sm">{formErrors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full px-4 py-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg ${formErrors.password ? "border-red-500" : ""
                }`}
            />
            {formErrors.password && (
              <p className="text-red-500 text-sm">{formErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold text-lg hover:opacity-90 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
