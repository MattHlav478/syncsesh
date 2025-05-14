import React from "react";

export default function StepThree({ responses, handleChange }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Team Building Activities
        </label>
        <input
          type="text"
          name="team_building"
          value={responses.team_building || ""}
          onChange={(e) => handleChange("team_building", e.target.value)}
          className="w-full border-gray-300 rounded-md shadow-sm p-3"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          External Facilitators (yes/no)
        </label>
        <select
          name="external_facilitators"
          value={responses.external_facilitators || ""}
          onChange={(e) =>
            handleChange("external_facilitators", e.target.value)
          }
          className="w-full border-gray-300 rounded-md shadow-sm p-3"
        >
          <option value="">Select...</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Budget per Attendee
        </label>
        <input
          type="text"
          name="budget"
          value={responses.budget || ""}
          onChange={(e) => handleChange("budget", e.target.value)}
          className="w-full border-gray-300 rounded-md shadow-sm p-3"
        />
      </div>
    </div>
  );
}
