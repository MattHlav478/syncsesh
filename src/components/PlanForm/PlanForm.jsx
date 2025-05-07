import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../utils/supabaseClient";
import ScheduleList from "../ScheduleList/ScheduleList";
import ScheduleDisplay from "../ScheduleDisplay/ScheduleDisplay";

export default function PlanForm({ session }) {
  const userId = session?.user?.id;
  const [eventType, setEventType] = useState("Company Retreat");
  const [responses, setResponses] = useState({
    retreat_goals: "Team bonding and strategic planning",
    attendees: "25",
    dates_duration: "October 12–14",
    location: "Sedona, AZ",
    tone: "Relaxed and motivating",
    time_blocks: "Morning hikes, afternoon workshops",
    team_building: "Escape room and cooking class",
    external_facilitators: "yes",
    budget: "$1000 per attendee",
    accessibility: "ADA accessible rooms, vegetarian meals",
  });

  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState([]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  useEffect(() => {
    const savedEventType = localStorage.getItem("eventType");
    const savedResponses = localStorage.getItem("responses");
    const savedScheduleRaw = localStorage.getItem("schedule");

    if (savedEventType) setEventType(savedEventType);
    if (savedResponses) setResponses(JSON.parse(savedResponses));
    if (savedScheduleRaw) {
      try {
        const parsed = JSON.parse(savedScheduleRaw);
        if (Array.isArray(parsed)) setSchedule(parsed);
      } catch (e) {
        console.warn("Could not parse saved schedule from LocalStorage", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedResponses = { ...responses, [name]: value };
    setResponses(updatedResponses);
    localStorage.setItem("responses", JSON.stringify(updatedResponses));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, responses }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      console.log("Raw schedule response:", data.schedule);
      const structuredSchedule = JSON.parse(data.schedule);
      setSchedule(structuredSchedule);
      localStorage.setItem("schedule", JSON.stringify(structuredSchedule));
      toast.success("✅ Schedule generated successfully!");

      // Save to Supabase
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Event Type
            </label>
            <input
              type="text"
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                localStorage.setItem("eventType", e.target.value);
              }}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent p-3"
              required
            />
          </div>

          {Object.keys(responses).map((key) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                {key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </label>
              <input
                type="text"
                name={key}
                value={responses[key]}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent p-3"
                required
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold p-3 rounded-lg transition duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Generating...
            </div>
          ) : (
            "Generate Schedule"
          )}
        </button>
      </form>

      {schedule?.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">Current Schedule</h2>
          <ScheduleDisplay schedule={schedule} setSchedule={setSchedule} />
        </div>
      )}

      <ScheduleList userId={userId} onLoadSchedule={setSchedule} />
    </div>
  );
}
