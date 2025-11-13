import React from "react";

interface MultiStepProgressProps {
  steps: string[]; // Step names
  activeStep: number; // Active step index (0-based)
  brandPrimary?: string; // Optional: primary brand color (default is tomato)
  stepIcon?: string; // Optional: custom icon for the step (default is checkmark)
}

const MultiStepProgress: React.FC<MultiStepProgressProps> = ({
  steps,
  activeStep,
  brandPrimary = "zenith-accent-600", // Default primary color
  stepIcon = "✓", // Default checkmark
}) => {
  return (
    <div className="container mx-auto py-4">
      <ul className="list-none flex justify-between w-full">
        {steps.map((step, index) => (
          <li
            key={index}
            className={`relative flex-1 text-center ${
              index <= activeStep ? "text-zenith-accent-600" : "text-gray-500"
            }`}
          >
            {/* Step Circle */}
            <div
              className={`w-9 h-9 mx-auto flex items-center justify-center rounded-full border-2 font-bold ${
                index <= activeStep
                  ? `bg-zenith-accent-600 border-zenith-accent-300 text-white`
                  : "bg-white border-gray-300 text-gray-500"
              }`}
            >
              {/* Icon for the step (checkmark or custom) */}
              {index < activeStep ? (
                <span className="text-xl">{stepIcon}</span> // Checkmark or custom icon
              ) : (
                <span className="text-xl">{index + 1}</span> // Step number
              )}
            </div>

            {/* Connecting line after the circle */}
            {index < steps.length - 1 && (
              <div
                className={`absolute top-1/2 left-1/2 w-1/2 h-0.5 ${
                  index < activeStep ? `bg-${brandPrimary}` : "bg-gray-300"
                }`}
                style={{ transform: "translateX(-50%)", zIndex: -1 }}
              />
            )}

            {/* Step label */}
            <div className="mt-2 text-sm">{step}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MultiStepProgress;
