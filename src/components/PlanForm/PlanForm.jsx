import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../utils/supabaseClient";
import ScheduleList from "../ScheduleList/ScheduleList";
import DynamicEventForm from "../DynamicEventForm";
import ScheduleDisplay from "../ScheduleDisplay/ScheduleDisplay";
import companyRetreatTemplate from "../../templates/companyRetreat.json";
import wellnessDayTemplate from "../../templates/wellnessDay.json";

export default function PlanForm({ session }) {
  const userId = session?.user?.id;
  const [eventType, setEventType] = useState("Company Retreat");
  const [template, setTemplate] = useState(companyRetreatTemplate);
  const [responses, setResponses] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    {
      name: "Event Basics",
      fields: ["event_type", "retreat_goals", "attendees"],
    },
    {
      name: "Schedule Details",
      fields: ["dates_duration", "time_blocks"],
    },
    {
      name: "Preferences",
      fields: ["tone", "team_building", "external_facilitators"],
    },
    {
      name: "Logistics & Budget",
      fields: ["location", "budget", "accessibility"],
    },
  ];

  const currentFields = template.filter((f) =>
    steps[step].fields.includes(f.name)
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  useEffect(() => {
    const savedEventType = localStorage.getItem("eventType");
    const savedResponses = localStorage.getItem("responses");
    const savedScheduleRaw = localStorage.getItem("schedule");

    if (savedEventType) {
      setEventType(savedEventType);
      setTemplate(
        savedEventType === "Wellness Day"
          ? wellnessDayTemplate
          : companyRetreatTemplate
      );
    }

    if (savedResponses && savedResponses !== "undefined") {
      try {
        const parsed = JSON.parse(savedResponses);
        setResponses(parsed);
      } catch (e) {
        console.error("Invalid JSON in saved responses:", e);
      }
    }

    if (savedScheduleRaw && savedScheduleRaw !== "undefined") {
      try {
        const parsed = JSON.parse(savedScheduleRaw);
        if (Array.isArray(parsed)) setSchedule(parsed);
      } catch (e) {
        console.warn("Could not parse saved schedule from LocalStorage", e);
      }
    }
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, responses }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      const structuredSchedule = JSON.parse(data.schedule);
      setSchedule(structuredSchedule);
      localStorage.setItem("schedule", JSON.stringify(structuredSchedule));
      toast.success("✅ Schedule generated successfully!");

      const { error: dbError } = await supabase.from("schedules").insert({
        user_id: userId,
        event_type: eventType,
        responses,
        schedule: structuredSchedule,
      });

      if (dbError) {
        console.error("Error saving schedule:", dbError);
        toast.error("⚠️ Schedule saved locally but not synced to database.");
      } else {
        toast.success("💾 Schedule saved to database!");
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to generate schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-8 bg-white rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Plan Your Event ✨</h1>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-100 hover:bg-red-200 text-red-600 font-semibold px-3 py-2 rounded"
        >
          Log Out
        </button>
      </div>

      {/* Step Progress Indicator */}
      <div className="flex justify-between items-center mb-8">
        {steps.map((s, idx) => (
          <div key={s.name} className="flex-1 text-center">
            <div
              className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-sm font-semibold ${
                idx === step
                  ? "bg-blue-500 text-white"
                  : idx < step
                  ? "bg-green-400 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {idx + 1}
            </div>
            <div className="text-xs text-gray-600">{s.name}</div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <div className="overflow-hidden transition-all duration-500 ease-in-out transform">
          <div key={step} className="transition-opacity duration-300">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              {steps[step].name}
            </h2>
            <DynamicEventForm
              template={currentFields}
              responses={responses}
              setResponses={setResponses}
            />

            <div className="flex justify-between mt-6">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  ← Back
                </button>
              )}

              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="ml-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="ml-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate Schedule"}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-center text-green-600">
            🎉 Schedule Generated!
          </h2>
          <ScheduleDisplay schedule={schedule} setSchedule={setSchedule} />
        </div>
      )}

      <ScheduleList userId={userId} onLoadSchedule={setSchedule} />
    </div>
  );
}
