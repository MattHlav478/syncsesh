import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import PlanForm from "./components/PlanForm/PlanForm";
import Dashboard from "./components/Dashboard/Dashboard";
import AuthPage from "./components/AuthPage";
import { supabase } from "./utils/supabaseClient";
import "./index.css";

const {
  data: { session },
} = await supabase.auth.getSession();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard session={session} />} />
        <Route path="/plan" element={<PlanForm session={session} />} />
        <Route path="/login" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
