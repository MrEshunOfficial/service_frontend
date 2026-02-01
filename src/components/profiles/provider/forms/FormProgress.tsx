import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface Step {
  id: number;
  title: string;
  required?: boolean;
}

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
  skippedSteps?: Set<number>;
  onStepClick?: (stepNumber: number) => void;
}

type StepStatus = "complete" | "current" | "upcoming" | "skipped";

export function FormProgress({
  currentStep,
  totalSteps,
  steps,
  skippedSteps = new Set(),
  onStepClick,
}: FormProgressProps) {
  const getStepStatus = (stepNumber: number): StepStatus => {
    if (skippedSteps.has(stepNumber)) {
      return "skipped";
    }
    if (stepNumber < currentStep) {
      return "complete";
    }
    if (stepNumber === currentStep) {
      return "current";
    }
    return "upcoming";
  };

  const handleStepClick = (stepNumber: number) => {
    if (onStepClick) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Progress Bar */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = step.id;
            const status = getStepStatus(stepNumber);
            const isClickable = onStepClick !== undefined;

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center relative">
                  <button
                    type="button"
                    onClick={() => handleStepClick(stepNumber)}
                    disabled={!isClickable}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 relative",
                      isClickable && "cursor-pointer hover:scale-105",
                      !isClickable && "cursor-default",
                      status === "complete" && "bg-green-500 text-white",
                      status === "current" &&
                        "bg-blue-600 text-white ring-4 ring-blue-100",
                      status === "skipped" &&
                        "bg-amber-100 text-amber-700 border-2 border-amber-400",
                      status === "upcoming" && "bg-gray-200 text-gray-500",
                    )}
                    aria-label={`${step.title}${step.required ? " (Required)" : " (Optional)"}`}
                    aria-current={status === "current" ? "step" : undefined}
                  >
                    {status === "complete" ? (
                      <Check className="w-5 h-5" />
                    ) : status === "skipped" ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}

                    {/* Required indicator */}
                    {step.required && status !== "complete" && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>

                  {/* Step Title */}
                  <p
                    className={cn(
                      "text-xs mt-2 text-center whitespace-nowrap transition-colors",
                      status === "current" && "text-slate-900 font-semibold",
                      status === "complete" && "text-slate-900 font-medium",
                      status === "skipped" && "text-amber-600 font-medium",
                      status === "upcoming" && "text-gray-500",
                    )}
                  >
                    {step.title}
                  </p>

                  {/* Status badges */}
                  <div className="mt-1 flex flex-col items-center gap-0.5">
                    {status === "skipped" && (
                      <span className="text-[10px] text-amber-600 font-medium">
                        Skipped
                      </span>
                    )}
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 relative -top-3">
                    <div
                      className={cn(
                        "h-full rounded transition-all duration-300",
                        currentStep > step.id && !skippedSteps.has(step.id)
                          ? "bg-green-500"
                          : currentStep > step.id && skippedSteps.has(step.id)
                            ? "bg-amber-400"
                            : "bg-gray-200",
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="lg:hidden">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-900">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-xs text-slate-600">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step Info */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-semibold shrink-0">
            {currentStep}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">
              {steps[currentStep - 1].title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {steps[currentStep - 1].required ? (
                <span className="text-xs text-red-600 font-medium">
                  Required
                </span>
              ) : (
                <span className="text-xs text-blue-600 font-medium">
                  Optional
                </span>
              )}
              {skippedSteps.has(currentStep) && (
                <span className="text-xs text-amber-600 font-medium">
                  • Skipped
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Skipped Steps Overview */}
        {skippedSteps.size > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-medium text-amber-800 mb-2">
              Skipped Steps:
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from(skippedSteps).map((stepNum) => (
                <button
                  key={stepNum}
                  type="button"
                  onClick={() => handleStepClick(stepNum)}
                  className="px-2 py-1 bg-white border border-amber-300 rounded text-xs text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  {steps[stepNum - 1].title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
