import React from "react";

export default function StepOne({
  responses,
  eventType,
  setEventType,
  handleChange,
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Event Type
        </label>
        <input
          type="text"
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value);
            localStorage.setItem("eventType", e.target.value);
          }}
          className="w-full border-gray-300 rounded-md shadow-sm p-3"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Retreat Goals
        </label>
        <input
          type="text"
          name="retreat_goals"
          value={responses.retreat_goals || ""}
          onChange={(e) => handleChange("retreat_goals", e.target.value)}
          className="w-full border-gray-300 rounded-md shadow-sm p-3"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Number of Attendees
        </label>
        <input
          type="number"
          name="attendees"
          value={responses.attendees || ""}
          onChange={(e) => handleChange("attendees", e.target.value)}
          className="w-full border-gray-300 rounded-md shadow-sm p-3"
        />
      </div>
    </div>
  );
}
