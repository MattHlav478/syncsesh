import { useEffect, useState } from "react";

export default function ScheduleDisplay({ schedule, onEdit, onRegenerate }) {
  const [regeneratingIndex, setRegeneratingIndex] = useState(null);
  const [regeneratePrompt, setRegeneratePrompt] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  useEffect(() => {
    if (highlightedIndex !== null) {
      const timeout = setTimeout(() => setHighlightedIndex(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [highlightedIndex]);

  const handleRegenerate = async (dayIndex, activityIndex) => {
    setRegeneratingIndex(`${dayIndex}-${activityIndex}`);
    try {
      const res = await fetch("http://localhost:8000/regenerate-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: schedule[dayIndex].activities[activityIndex],
          day: schedule[dayIndex].day,
          prompt: regeneratePrompt,
        }),
      });
      const data = await res.json();
      if (data.activity) {
        const updated = [...schedule];
        updated[dayIndex].activities[activityIndex] = data.activity;
        onRegenerate(updated);
        setHighlightedIndex(`${dayIndex}-${activityIndex}`);
        localStorage.setItem("schedule", JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegeneratingIndex(null);
      setActiveModal(null);
    }
  };

  const handleCopy = () => {
    const text = schedule
      .map(
        (day) =>
          `\n${day.day}\n` +
          day.activities
            .map((a) => `- ${a.time}: ${a.title}\n  ${a.notes}`)
            .join("\n")
      )
      .join("\n\n");
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Schedule copied to clipboard!"));
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const html = `
      <html>
        <head><title>Printable Schedule</title></head>
        <body style="font-family: sans-serif; padding: 20px;">
          ${schedule
            .map(
              (day) => `
            <h2>${day.day}</h2>
            <ul>
              ${day.activities
                .map(
                  (a) =>
                    `<li><strong>${a.time}</strong>: ${a.title}<br/><em>${a.notes}</em></li>`
                )
                .join("")}
            </ul>
          `
            )
            .join("<hr/>")}
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="mt-10 space-y-8">
      <div className="flex justify-end gap-4">
        <button
          onClick={handleCopy}
          className="bg-gray-100 border px-4 py-2 rounded hover:bg-gray-200 text-sm"
        >
          📋 Copy
        </button>
        <button
          onClick={handlePrint}
          className="bg-gray-100 border px-4 py-2 rounded hover:bg-gray-200 text-sm"
        >
          🖨️ Print
        </button>
      </div>

      {schedule.map((day, dayIndex) => (
        <div
          key={dayIndex}
          className="p-6 bg-gray-100 rounded-2xl shadow-inner"
        >
          <h2 className="text-2xl font-bold text-blue-700 mb-4">{day.day}</h2>
          <div className="space-y-4">
            {day.activities.map((activity, idx) => {
              const uniqueKey = `${dayIndex}-${idx}`;
              const isHighlighted = highlightedIndex === uniqueKey;
              return (
                <div
                  key={uniqueKey}
                  className={`relative p-6 bg-white rounded-xl shadow transition duration-300 ${
                    isHighlighted ? "ring-2 ring-green-400" : "hover:shadow-lg"
                  }`}
                >
                  <button
                    onClick={() => setActiveModal(uniqueKey)}
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

                  {activeModal === uniqueKey && (
                    <div className="absolute z-50 bg-white border shadow rounded p-4 w-72 top-12 right-4">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Regenerate Activity
                      </h4>
                      <textarea
                        value={regeneratePrompt}
                        onChange={(e) => setRegeneratePrompt(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                        placeholder="e.g. make this a yoga class instead"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                          onClick={() => setActiveModal(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center"
                          onClick={() => handleRegenerate(dayIndex, idx)}
                          disabled={regeneratingIndex === uniqueKey}
                        >
                          {regeneratingIndex === uniqueKey ? (
                            <svg
                              className="animate-spin h-4 w-4 mr-2 text-white"
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
                          ) : null}
                          Regenerate
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-500">{activity.time}</p>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {activity.title}
                  </h3>
                  {activity.notes && (
                    <p className="mt-2 text-gray-600 text-sm">
                      <span className="font-semibold">Notes:</span>{" "}
                      {activity.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
