import React, { useState } from "react";

export default function DynamicEventForm({ template, onSubmit }) {
  const [responses, setResponses] = useState({});

  const handleChange = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(responses); // send data to parent or API
  };

  const renderField = (q) => {
    const commonProps = {
      id: q.id,
      name: q.id,
      value: responses[q.id] || "",
      onChange: (e) => handleChange(q.id, e.target.value),
      required: q.required,
      placeholder: q.placeholder || "",
    };

    switch (q.type) {
      case "text":
      case "number":
        return (
          <input
            type={q.type}
            {...commonProps}
            className="border p-2 rounded w-full"
          />
        );
      case "textarea":
        return (
          <textarea
            {...commonProps}
            rows={3}
            className="border p-2 rounded w-full"
          />
        );
      case "select":
        return (
          <select {...commonProps} className="border p-2 rounded w-full">
            <option value="">Select...</option>
            {q.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case "multiselect":
        return (
          <select
            {...commonProps}
            multiple
            value={responses[q.id] || []}
            onChange={(e) => {
              const options = Array.from(e.target.selectedOptions).map(
                (opt) => opt.value
              );
              handleChange(q.id, options);
            }}
            className="border p-2 rounded w-full"
          >
            {q.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case "yesno":
        return (
          <select {...commonProps} className="border p-2 rounded w-full">
            <option value="">Select...</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        );
      default:
        return (
          <input
            type="text"
            {...commonProps}
            className="border p-2 rounded w-full"
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{template.eventType}</h2>
      <p className="text-gray-600">{template.description}</p>

      {template.questions.map((q) => (
        <div key={q.id} className="flex flex-col">
          <label htmlFor={q.id} className="font-medium mb-1">
            {q.label}
          </label>
          {renderField(q)}
        </div>
      ))}

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Generate Schedule
      </button>
    </form>
  );
}
