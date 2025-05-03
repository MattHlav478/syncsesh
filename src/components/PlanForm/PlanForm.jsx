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
  const [schedule, setSchedule] = useState([]);
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editBuffer, setEditBuffer] = useState({});


  useEffect(() => {
    const savedEventType = localStorage.getItem("eventType");
    const savedResponses = localStorage.getItem("responses");
    const savedScheduleRaw = localStorage.getItem("schedule");

    if (savedEventType) setEventType(savedEventType);
    if (savedResponses) setResponses(JSON.parse(savedResponses));

    if (savedScheduleRaw) {
      try {
        const parsed = JSON.parse(savedScheduleRaw);
        if (Array.isArray(parsed)) {
          setSchedule(parsed);
        }
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventType, responses }),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();

      // Parse structured JSON from OpenAI
      try {
        const structuredSchedule = JSON.parse(data.schedule);
        setSchedule(structuredSchedule);
        localStorage.setItem("schedule", JSON.stringify(structuredSchedule));
        toast.success("✅ Schedule generated successfully!");
      } catch (parseError) {
        console.error("Failed to parse OpenAI schedule:", parseError);
        toast.error("❌ Failed to parse generated schedule.");
      }
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
          {schedule.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className="p-6 bg-gray-100 rounded-2xl shadow-inner"
            >
              <h2 className="text-2xl font-bold text-blue-700 mb-4">
                {day.day}
              </h2>

              <div className="space-y-4">
                {day.activities.map((activity, idx) => {
                  const uniqueKey = `${dayIndex}-${idx}`;
                  const isEditing = editingIndex === uniqueKey;
                  // const [edited, setEdited] = useState({ ...activity });

                  return (
                    <div
                      key={uniqueKey}
                      className="relative p-6 bg-white rounded-xl shadow hover:shadow-lg transition duration-200 group"
                    >
                      {/* Options button */}
                      <button
                        onClick={() =>
                          setMenuOpenIndex(
                            menuOpenIndex === uniqueKey ? null : uniqueKey
                          )
                        }
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6-2a2 2 0 100 4 2 2 0 000-4zm6 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>

                      {/* Dropdown menu */}
                      {menuOpenIndex === uniqueKey && (
                        <div className="absolute top-10 right-4 bg-white border rounded shadow-md z-10 text-sm">
                          <button
                            onClick={() => {
                              setMenuOpenIndex(null);
                              setEditingIndex(uniqueKey);
                              setEditBuffer({ ...activity });
                            }}
                            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                          >
                            ✏️ Edit Activity
                          </button>
                          <button
                            onClick={() => {
                              setMenuOpenIndex(null);
                              console.log("Regenerate activity", activity);
                            }}
                            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                          >
                            🔄 Regenerate with GPT
                          </button>
                        </div>
                      )}

                      {/* Editable or static view */}
                      {isEditing ? (
                        <>
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editBuffer.time}
                              onChange={(e) =>
                                setEditBuffer({
                                  ...editBuffer,
                                  time: e.target.value,
                                })
                              }
                              className="w-full p-2 border border-gray-300 rounded"
                              placeholder="Time"
                            />
                            <input
                              type="text"
                              value={editBuffer.title}
                              onChange={(e) =>
                                setEditBuffer({
                                  ...editBuffer,
                                  title: e.target.value,
                                })
                              }
                              className="w-full p-2 border border-gray-300 rounded"
                              placeholder="Title"
                            />
                            <textarea
                              value={editBuffer.notes}
                              onChange={(e) =>
                                setEditBuffer({
                                  ...editBuffer,
                                  notes: e.target.value,
                                })
                              }
                              className="w-full p-2 border border-gray-300 rounded"
                              placeholder="Notes"
                            />
                          </div>

                          <div className="mt-3 flex justify-end gap-2">
                            <button
                              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                              onClick={() => setEditingIndex(null)}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                              onClick={() => {
                                const newSchedule = [...schedule];
                                newSchedule[dayIndex].activities[idx] =
                                  editBuffer;
                                setSchedule(newSchedule);
                                localStorage.setItem(
                                  "schedule",
                                  JSON.stringify(newSchedule)
                                );
                                setEditingIndex(null);
                              }}
                            >
                              Save
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500">
                            {activity.time}
                          </p>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {activity.title}
                          </h3>
                          {activity.notes && (
                            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                              <span className="font-semibold">Notes:</span>{" "}
                              {activity.notes}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
