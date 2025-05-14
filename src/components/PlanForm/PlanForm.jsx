import { useState, useEffect } from "react";
import Stepper from "../Stepper";
import StepOne from "../FormSteps/StepOne";
import StepTwo from "../FormSteps/StepTwo";
import StepThree from "../FormSteps/StepThree";
import ScheduleDisplay from "../ScheduleDisplay/ScheduleDisplay";
import { toast } from "react-hot-toast";
import { supabase } from "../../utils/supabaseClient";
import { format } from "date-fns";

export default function PlanForm({ session }) {
  const userId = session?.user?.id;

  const [responses, setResponses] = useState({
    retreat_goals: "",
    attendees: "",
    dates: {
      startDate: null,
      endDate: null,
    },
    location: "",
    tone: "",
    // ... other fields
  });
  const [eventType, setEventType] = useState("Company Retreat");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const steps = [
    <StepOne
      responses={responses}
      handleChange={handleChange}
      eventType={eventType}
      setEventType={setEventType}
      startDate={startDate}
      setStartDate={setStartDate}
      endDate={endDate}
      setEndDate={setEndDate}
    />,
    <StepTwo
      responses={responses}
      setResponses={setResponses}
      handleChange={handleChange}
    />,
    <StepThree responses={responses} handleChange={handleChange} />,
  ];

  function handleChange(field, value) {
    const updated = { ...responses, [field]: value };
    setResponses(updated);
    localStorage.setItem("responses", JSON.stringify(updated));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const dateRangeFormatted =
        startDate && endDate
          ? `${format(startDate, "MMMM d")} – ${format(endDate, "MMMM d")}`
          : "";

      const finalResponses = {
        ...responses,
        dates_duration: dateRangeFormatted,
      };

      const res = await fetch("http://localhost:8000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, responses: finalResponses }),
      });

      if (!res.ok) throw new Error("Failed to generate schedule");

      const data = await res.json();
      const structured = JSON.parse(data.schedule);
      setSchedule(structured);
      localStorage.setItem("schedule", JSON.stringify(structured));
      toast.success("✅ Schedule generated successfully!");

      const { error: dbError } = await supabase.from("schedules").insert({
        user_id: userId,
        event_type: eventType,
        responses: finalResponses,
        schedule: structured,
      });

      if (dbError) toast.error("⚠️ Could not save to database");
    } catch (e) {
      console.error(e);
      toast.error("❌ Failed to generate schedule");
    } finally {
      setLoading(false);
    }
  }

  function nextStep() {
    if (step < steps.length - 1) setStep(step + 1);
  }

  function prevStep() {
    if (step > 0) setStep(step - 1);
  }

 useEffect(() => {
   const saved = localStorage.getItem("responses");
   if (saved) {
     try {
       const parsed = JSON.parse(saved);

       // If dates are present, convert from string to Date object
       if (parsed.dates) {
         parsed.dates.startDate = parsed.dates.startDate
           ? new Date(parsed.dates.startDate)
           : null;
         parsed.dates.endDate = parsed.dates.endDate
           ? new Date(parsed.dates.endDate)
           : null;
       }

       setResponses(parsed);
     } catch (e) {
       console.warn("Invalid JSON in saved responses", e);
     }
   }
 }, []);


  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-md">
      <Stepper currentStep={step} totalSteps={steps.length} />
      <div className="transition-all duration-300 ease-in-out">
        {steps[step]}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={prevStep}
          disabled={step === 0}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Back
        </button>

        {step < steps.length - 1 ? (
          <button
            onClick={nextStep}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {loading ? "Generating..." : "Generate Schedule"}
          </button>
        )}
      </div>

      {schedule?.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">Generated Schedule</h2>
          <ScheduleDisplay schedule={schedule} setSchedule={setSchedule} />
        </div>
      )}
    </div>
  );
}
