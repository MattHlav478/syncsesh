import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // or 'signup'

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    let data, error;
    if (mode === "login") {
      ({ data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      }));
    } else {
      ({ data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin, // Optional
        },
      }));
    }

    if (error) alert(error.message);
    else
      alert(
        `Check your inbox to ${
          mode === "signup" ? "confirm your account" : "log in"
        }.`
      );

    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md mt-20">
      <h2 className="text-xl font-bold mb-4 text-center">
        {mode === "login" ? "Log In" : "Sign Up"}
      </h2>

      <form onSubmit={handleAuth} className="space-y-4">
        <input
          type="email"
          className="w-full p-3 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          autoComplete="current-password"
          className="w-full p-3 border rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Processing..." : mode === "login" ? "Log In" : "Sign Up"}
        </button>
      </form>

      <div className="mt-4 text-center">
        {mode === "login" ? (
          <p>
            Need an account?{" "}
            <button
              className="text-blue-500 underline"
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <button
              className="text-blue-500 underline"
              onClick={() => setMode("login")}
            >
              Log in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
