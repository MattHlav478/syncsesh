import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function PlanForm() {
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
  const [schedule, setSchedule] = useState("");

  useEffect(() => {
    const savedEventType = localStorage.getItem("eventType");
    const savedResponses = localStorage.getItem("responses");
    const savedSchedule = localStorage.getItem("schedule");

    if (savedEventType) setEventType(savedEventType);
    if (savedResponses) setResponses(JSON.parse(savedResponses));
    if (savedSchedule) setSchedule(savedSchedule);
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventType, responses }),
    });

    if (!res.ok) {
      throw new Error("Server error");
    }

    const data = await res.json();
    setSchedule(data.schedule);
    localStorage.setItem("schedule", data.schedule);
    toast.success("✅ Schedule generated successfully!");
  } catch (err) {
    console.error(err);
    toast.error("❌ Failed to generate schedule. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-2xl w-full mx-auto p-8 bg-white rounded-2xl shadow-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Plan Your Event ✨
      </h1>

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

      {schedule && (
        <div className="mt-10 space-y-8">
          {schedule
            .split("DAY")
            .filter(Boolean)
            .map((daySchedule, index) => {
              const [dayHeaderLine, ...activitiesLines] = daySchedule
                .trim()
                .split("\n\n");
              return (
                <div
                  key={index}
                  className="p-6 bg-gray-100 rounded-2xl shadow-inner"
                >
                  <h2 className="text-2xl font-bold text-blue-700 mb-4">
                    DAY {dayHeaderLine.trim()}
                  </h2>

                  <div className="space-y-4">
                    {activitiesLines.map((activity, idx) => {
                      const parts = activity.split("\n- Notes:");
                      const timeAndTitle = parts[0].trim();
                      const notes = parts[1]?.trim() || "";

                      return (
                        <div
                          key={idx}
                          className="p-4 bg-white rounded-lg shadow"
                        >
                          <p className="font-semibold text-gray-800">
                            {timeAndTitle}
                          </p>
                          {notes && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-semibold">Notes:</span>{" "}
                              {notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}