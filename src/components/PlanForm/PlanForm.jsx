import { useState } from "react";

export default function PlanForm() {
  const [eventType, setEventType] = useState("");
  const [responses, setResponses] = useState({
    retreat_goals: "",
    attendees: "",
    dates_duration: "",
    location: "",
    tone: "",
    time_blocks: "",
    team_building: "",
    external_facilitators: "",
    budget: "",
    accessibility: "",
  });
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponses((prev) => ({ ...prev, [name]: value }));
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
      const data = await res.json();
      setSchedule(data.schedule);
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
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
              onChange={(e) => setEventType(e.target.value)}
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
          {loading ? "Generating Schedule..." : "Generate Schedule"}
        </button>
      </form>

      {schedule && (
        <div className="mt-10 p-6 bg-gray-100 rounded-2xl shadow-inner">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            🎯 Generated Schedule
          </h2>
          <pre className="whitespace-pre-wrap text-gray-800">{schedule}</pre>
        </div>
      )}
    </div>
  );
}
