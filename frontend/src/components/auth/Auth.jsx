import { useState } from 'react';
import api from '../../services/api';

function Auth({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setError("");

      if (mode === "signup") {
      await api.post("/auth/signUp", {
        name,
        email,
        password,
      });
      }

      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      onAuth();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-80 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {mode === "login" ? "Login" : "Sign Up"}
        </h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {mode === "signup" && (
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          />
        )}

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {mode === "login" ? "Login" : "Create Account"}
        </button>

        <div className="text-sm text-center mt-4">
          {mode === "login" ? (
            <span>
              Don’t have an account?{" "}
              <button
                className="text-blue-500"
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                className="text-blue-500"
                onClick={() => setMode("login")}
              >
                Login
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
export default Auth;
