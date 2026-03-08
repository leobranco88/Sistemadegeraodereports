import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${index < currentStep ? 'bg-[#16A34A]' : index === currentStep ? 'bg-[#EC5800]' : 'bg-gray-300'}
                transition-colors
              `}>
                {index < currentStep ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white">{index + 1}</span>
                )}
              </div>
              <span className={`
                mt-2 text-sm text-center
                ${index === currentStep ? 'text-[#EC5800]' : index < currentStep ? 'text-[#16A34A]' : 'text-gray-400'}
              `}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-1 mx-2 rounded
                ${index < currentStep ? 'bg-[#16A34A]' : 'bg-gray-300'}
                transition-colors
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
