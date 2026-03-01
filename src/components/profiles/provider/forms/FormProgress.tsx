import { Check, SkipForward } from "lucide-react";
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
    if (skippedSteps.has(stepNumber)) return "skipped";
    if (stepNumber < currentStep) return "complete";
    if (stepNumber === currentStep) return "current";
    return "upcoming";
  };

  return (
    <div className="w-full">
      {/* Desktop stepper */}
      <div className="hidden lg:flex items-center">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isClickable = !!onStepClick;

          return (
            <div
              key={step.id}
              className="flex items-center flex-1 last:flex-none"
            >
              {/* Step */}
              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                disabled={!isClickable}
                aria-current={status === "current" ? "step" : undefined}
                className={cn(
                  "group flex flex-col items-center gap-2 focus:outline-none",
                  isClickable && "cursor-pointer",
                )}
              >
                {/* Circle */}
                <div
                  className={cn(
                    "relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200",
                    status === "complete" &&
                      "bg-emerald-500 text-white shadow-emerald-200 dark:shadow-emerald-900 shadow-md",
                    status === "current" &&
                      "bg-blue-600 text-white shadow-blue-200 dark:shadow-blue-900 shadow-md ring-4 ring-blue-100 dark:ring-blue-900",
                    status === "skipped" &&
                      "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border-2 border-amber-400 dark:border-amber-600",
                    status === "upcoming" &&
                      "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700",
                  )}
                >
                  {status === "complete" ? (
                    <Check className="w-4 h-4" />
                  ) : status === "skipped" ? (
                    <SkipForward className="w-4 h-4" />
                  ) : (
                    <span>{step.id}</span>
                  )}

                  {/* Required dot */}
                  {step.required && status === "upcoming" && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950" />
                  )}
                </div>

                {/* Label */}
                <div className="flex flex-col items-center gap-0.5">
                  <span
                    className={cn(
                      "text-xs whitespace-nowrap font-medium transition-colors",
                      status === "current" &&
                        "text-blue-700 dark:text-blue-400",
                      status === "complete" &&
                        "text-emerald-700 dark:text-emerald-400",
                      status === "skipped" &&
                        "text-amber-600 dark:text-amber-400",
                      status === "upcoming" &&
                        "text-slate-400 dark:text-slate-500",
                    )}
                  >
                    {step.title}
                  </span>
                  {status === "skipped" && (
                    <span className="text-[10px] text-amber-500 dark:text-amber-500">
                      Skipped
                    </span>
                  )}
                </div>
              </button>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-3 mb-5">
                  <div
                    className={cn(
                      "h-0.5 w-full rounded-full transition-all duration-500",
                      currentStep > step.id && !skippedSteps.has(step.id)
                        ? "bg-emerald-400 dark:bg-emerald-600"
                        : currentStep > step.id && skippedSteps.has(step.id)
                          ? "bg-amber-300 dark:bg-amber-700"
                          : "bg-slate-200 dark:bg-slate-700",
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile progress */}
      <div className="lg:hidden space-y-3">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Current step chip */}
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center shrink-0">
            {currentStep}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {steps[currentStep - 1].title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {steps[currentStep - 1].required ? (
                <span className="text-rose-500 font-medium">Required</span>
              ) : (
                <span className="text-blue-500 font-medium">Optional</span>
              )}
              {skippedSteps.has(currentStep) && (
                <span className="text-amber-500 font-medium">
                  {" "}
                  · Previously skipped
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Skipped steps */}
        {skippedSteps.size > 0 && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 p-3">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">
              Skipped steps:
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from(skippedSteps).map((stepNum) => (
                <button
                  key={stepNum}
                  type="button"
                  onClick={() => onStepClick?.(stepNum)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
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
