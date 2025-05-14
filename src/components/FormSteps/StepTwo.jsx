import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function StepTwo({ responses, setResponses }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponses({ ...responses, [name]: value });
  };

  const handleDateChange = (date, name) => {
    const updatedDates = {
      ...responses.dates,
      [name]: date,
    };
    setResponses({
      ...responses,
      dates: updatedDates,
    });
  };

  console.log("Start Date:", responses.dates?.startDate);
  console.log("End Date:", responses.dates?.endDate);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Start Date
        </label>
        <DatePicker
          selected={responses.dates?.startDate || null}
          onChange={(date) => handleDateChange(date, "startDate")}
          dateFormat="MMMM d, yyyy"
          className="w-full p-3 border rounded"
          placeholderText="Select start date"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          End Date
        </label>
        <DatePicker
          selected={responses.dates?.endDate || null}
          onChange={(date) => handleDateChange(date, "endDate")}
          dateFormat="MMMM d, yyyy"
          className="w-full p-3 border rounded"
          placeholderText="Select end date"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Location
        </label>
        <input
          type="text"
          name="location"
          value={responses.location || ""}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Tone
        </label>
        <input
          type="text"
          name="tone"
          value={responses.tone || ""}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />
      </div>
    </div>
  );
}
