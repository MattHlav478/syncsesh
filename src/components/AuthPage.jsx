import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        toast.success("You're already logged in");
        navigate("/");
      }
    };

    checkSession();
  }, [navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Logged in successfully!");
          navigate("/");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          const userId = data.user.id;

          // 1. Create a new organization
          const orgResult = await supabase
            .from("organizations")
            .insert({ name: `${email.split("@")[0]}'s Org` })
            .select()
            .single();

          if (orgResult.error) {
            console.error("Org creation failed", orgResult.error);
            toast.error("Failed to create organization.");
          } else {
            const orgId = orgResult.data.id;

            // 2. Create user profile linked to org
            const userInsert = await supabase.from("users").insert([
              {
                id: userId,
                email,
                org_id: orgId,
              },
            ]);

            if (userInsert.error) {
              console.error("User insert failed", userInsert.error);
              toast.error("Failed to link user to org.");
            } else {
              toast.success("Account created! You're now logged in.");
              navigate("/");
            }
          }
        }
      }
    } catch (err) {
      console.error("Unexpected error", err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
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