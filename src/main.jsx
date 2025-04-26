import { useState } from "react";
import DynamicEventForm from "./components/DynamicEventForm";
import wellnessDayTemplate from "./templates/wellnessDay.json";
import companyRetreatTemplate from "./templates/companyRetreat.json";

export default function EventPlannerPage() {
  const [template, setTemplate] = useState(companyRetreatTemplate); // swap as needed

  const handleFormSubmit = (responses) => {
    console.log("Collected user input:", responses);
    // send to backend or format into prompt here
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <DynamicEventForm template={template} onSubmit={handleFormSubmit} />
    </div>
  );
}
