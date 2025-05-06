import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";
import PlanForm from "./components/PlanForm/PlanForm";
import AuthPage from "./components/AuthPage";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  return session ? <PlanForm session={session} /> : <AuthPage />;
}

export default App;
