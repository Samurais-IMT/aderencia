import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  const steps = [
    { number: 1, title: "Identificação" },
    { number: 2, title: "Avaliação" },
    { number: 3, title: "Resumo" },
    { number: 4, title: "Finalizar" }
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  transition-all duration-300
                  ${
                    currentStep > step.number
                      ? "bg-success text-success-foreground"
                      : currentStep === step.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }
                `}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium transition-colors
                  ${currentStep === step.number ? "text-primary" : "text-muted-foreground"}
                `}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-2 rounded transition-colors duration-300
                  ${currentStep > step.number ? "bg-success" : "bg-muted"}
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
