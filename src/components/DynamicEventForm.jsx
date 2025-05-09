import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DynamicEventForm({
  template,
  responses,
  setResponses,
}) {
  const handleChange = (field, value) => {
    const updated = { ...responses, [field]: value };
    setResponses(updated);
    localStorage.setItem("responses", JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      {template.map((field) => {
        const value = responses[field.name];

        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {field.label}
            </label>

            {field.type === "text" && (
              <input
                type="text"
                placeholder={field.placeholder || ""}
                value={value || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full p-3 border rounded shadow-sm"
              />
            )}

            {field.type === "textarea" && (
              <textarea
                placeholder={field.placeholder || ""}
                value={value || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full p-3 border rounded shadow-sm"
              />
            )}

            {field.type === "number" && (
              <input
                type="number"
                min={field.min}
                max={field.max}
                value={value || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full p-3 border rounded shadow-sm"
              />
            )}

            {field.type === "select" && (
              <select
                value={value || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full p-3 border rounded shadow-sm"
              >
                <option value="">Select...</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {field.type === "multi_select" && (
              <div className="flex flex-wrap gap-2">
                {field.options.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => {
                      const current = value || [];
                      const updated = current.includes(opt)
                        ? current.filter((o) => o !== opt)
                        : [...current, opt];
                      handleChange(field.name, updated);
                    }}
                    className={`px-3 py-1 rounded-full border text-sm transition ${
                      value?.includes(opt)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {field.type === "boolean" && (
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:bg-blue-500 transition-all"></div>
                <span className="ml-3 text-sm text-gray-600">
                  {value ? "Yes" : "No"}
                </span>
              </label>
            )}

            {field.type === "date_range" && (
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Start</span>
                  <DatePicker
                    selected={value?.[0] ? new Date(value[0]) : null}
                    onChange={(date) => {
                      const end = value?.[1] || null;
                      handleChange(field.name, [date, end]);
                    }}
                    selectsStart
                    startDate={value?.[0] ? new Date(value[0]) : null}
                    endDate={value?.[1] ? new Date(value[1]) : null}
                    className="p-2 border rounded"
                    placeholderText="Start date"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">End</span>
                  <DatePicker
                    selected={value?.[1] ? new Date(value[1]) : null}
                    onChange={(date) => {
                      const start = value?.[0] || null;
                      handleChange(field.name, [start, date]);
                    }}
                    selectsEnd
                    startDate={value?.[0] ? new Date(value[0]) : null}
                    endDate={value?.[1] ? new Date(value[1]) : null}
                    className="p-2 border rounded"
                    placeholderText="End date"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
