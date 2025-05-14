import React from "react";

export default function Stepper({ currentStep, totalSteps }) {
  return (
    <div className="flex justify-center items-center mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`w-4 h-4 mx-2 rounded-full transition-all duration-300
            ${index === currentStep ? "bg-blue-600 scale-125" : "bg-gray-300"}`}
        ></div>
      ))}
    </div>
  );
}
