import { Check } from "lucide-react";
import { cn } from "./utils";

interface Step {
  id: number;
  name: string;
}

interface FormProgressProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export function FormProgress({
  steps,
  currentStep,
  onStepClick,
}: FormProgressProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => {
          const isComplete = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = step.id <= currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                "relative flex-1",
                stepIdx !== steps.length - 1 && "pr-8 sm:pr-20",
              )}
            >
              {/* Connector Line */}
              {stepIdx !== steps.length - 1 && (
                <div
                  className="absolute top-4 left-0 -ml-px mt-0.5 h-0.5 w-full"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      "h-full w-full transition-all duration-500",
                      isComplete ? "bg-primary" : "bg-muted",
                    )}
                  />
                </div>
              )}

              {/* Step Button */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "group relative flex flex-col items-center transition-all",
                  isClickable && "cursor-pointer hover:opacity-80",
                  !isClickable && "cursor-not-allowed opacity-50",
                )}
              >
                {/* Circle */}
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isComplete &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary bg-background text-primary ring-4 ring-primary/20",
                    !isComplete &&
                      !isCurrent &&
                      "border-muted bg-background text-muted-foreground",
                  )}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors sm:text-sm",
                    isCurrent && "text-primary",
                    isComplete && "text-foreground",
                    !isComplete && !isCurrent && "text-muted-foreground",
                  )}
                >
                  {step.name}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
