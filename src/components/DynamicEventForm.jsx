import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DynamicEventForm({
  template,
  responses,
  setResponses,
}) {
  const handleChange = (name, value) => {
    setResponses((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {template.map((field) => {
        const value = responses[field.name] || "";

        switch (field.type) {
          case "text":
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                </label>
                <input
                  type="text"
                  placeholder={field.placeholder || ""}
                  value={value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full p-3 border rounded"
                />
              </div>
            );

          case "textarea":
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                </label>
                <textarea
                  placeholder={field.placeholder || ""}
                  value={value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full p-3 border rounded"
                />
              </div>
            );

          case "number":
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                </label>
                <input
                  type="number"
                  value={value}
                  min={field.min}
                  max={field.max}
                  onChange={(e) =>
                    handleChange(field.name, Number(e.target.value))
                  }
                  className="w-full p-3 border rounded"
                />
              </div>
            );

          case "select":
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                </label>
                <select
                  value={value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full p-3 border rounded"
                >
                  <option value="">Select an option</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );

          case "multi_select":
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                </label>
                <div className="flex flex-wrap gap-2">
                  {field.options.map((opt) => {
                    const selected = value?.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          const newVal = selected
                            ? value.filter((v) => v !== opt)
                            : [...(value || []), opt];
                          handleChange(field.name, newVal);
                        }}
                        className={`px-3 py-1 rounded-full border text-sm ${
                          selected
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );

          case "boolean":
            return (
              <div key={field.name} className="flex items-center gap-2">
                <label className="text-sm font-medium">{field.label}</label>
                <input
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                />
              </div>
            );

          case "date_range":
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                </label>
                <div className="flex gap-2">
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
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
