// ScheduleDisplay.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function ScheduleDisplay({ schedule, setSchedule }) {
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editBuffer, setEditBuffer] = useState({});
  const [regeneratingIndex, setRegeneratingIndex] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const plainText = schedule
      .map((day) => {
        const dayHeader = `${day.day}\n`;
        const activities = day.activities
          .map(
            (act) => `- ${act.time}: ${act.title} (${act.notes || "No notes"})`
          )
          .join("\n");
        return `${dayHeader}${activities}`;
      })
      .join("\n\n");

    navigator.clipboard.writeText(plainText).then(() => {
      toast.success("📋 Schedule copied to clipboard!");
    });
  };

  const handleRegenerate = async (dayIndex, idx) => {
    const activity = schedule[dayIndex].activities[idx];
    const payload = {
      day: schedule[dayIndex].day,
      activity,
      prompt: customPrompt,
    };

    try {
      const res = await fetch("http://localhost:8000/regenerate-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      const updatedSchedule = [...schedule];
      updatedSchedule[dayIndex].activities[idx] = data.activity;
      setSchedule(updatedSchedule);
      localStorage.setItem("schedule", JSON.stringify(updatedSchedule));
      toast.success("Activity updated by GPT");
    } catch (err) {
      toast.error("Failed to regenerate activity");
      console.error(err);
    } finally {
      setRegeneratingIndex(null);
      setCustomPrompt("");
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-end gap-2 mb-6 print:hidden">
        <button
          onClick={handlePrint}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
        >
          🖨️ Print
        </button>
        <button
          onClick={handleCopy}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
        >
          📋 Copy
        </button>
      </div>

      {schedule.map((day, dayIndex) => (
        <div
          key={dayIndex}
          className="bg-white shadow rounded-lg p-4 mb-6 print:break-inside-avoid"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">{day.day}</h2>
          <ul className="space-y-4">
            {day.activities.map((activity, idx) => {
              const uniqueKey = `${dayIndex}-${idx}`;
              const isEditing = editingIndex === uniqueKey;
              const isRegenerating = regeneratingIndex === uniqueKey;

              return (
                <li
                  key={uniqueKey}
                  className="relative bg-gray-100 rounded p-4 border border-gray-200"
                >
                  {/* Dropdown trigger */}
                  <button
                    onClick={() =>
                      setMenuOpenIndex(
                        menuOpenIndex === uniqueKey ? null : uniqueKey
                      )
                    }
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
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
                    <div className="absolute top-8 right-2 bg-white border rounded shadow-md z-10 text-sm">
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
                          setRegeneratingIndex(uniqueKey);
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        🔄 Regenerate with GPT
                      </button>
                    </div>
                  )}

                  {/* Regenerate Modal */}
                  {isRegenerating && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-lg font-bold mb-3">
                          Custom GPT Prompt
                        </h2>
                        <textarea
                          className="w-full border p-2 rounded mb-4"
                          placeholder="e.g. Make this more interactive..."
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            onClick={() => {
                              setRegeneratingIndex(null);
                              setCustomPrompt("");
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            onClick={() => handleRegenerate(dayIndex, idx)}
                          >
                            Regenerate
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Editable or static view */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editBuffer.time}
                        onChange={(e) =>
                          setEditBuffer({ ...editBuffer, time: e.target.value })
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
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const newSchedule = [...schedule];
                            newSchedule[dayIndex].activities[idx] = editBuffer;
                            setSchedule(newSchedule);
                            localStorage.setItem(
                              "schedule",
                              JSON.stringify(newSchedule)
                            );
                            setEditingIndex(null);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {activity.title}
                      </h3>
                      {activity.notes && (
                        <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                          <span className="font-semibold">Notes:</span>{" "}
                          {activity.notes}
                        </p>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
