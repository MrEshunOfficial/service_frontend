import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Clock } from "lucide-react";
import { ProviderProfileFormData } from "./providerProfileSchema";
import { cn } from "@/lib/utils/utils";

interface AvailabilityStepProps {
  form: UseFormReturn<ProviderProfileFormData>;
}

const DAYS_OF_WEEK = [
  { key: "monday", label: "Mon", full: "Monday" },
  { key: "tuesday", label: "Tue", full: "Tuesday" },
  { key: "wednesday", label: "Wed", full: "Wednesday" },
  { key: "thursday", label: "Thu", full: "Thursday" },
  { key: "friday", label: "Fri", full: "Friday" },
  { key: "saturday", label: "Sat", full: "Saturday" },
  { key: "sunday", label: "Sun", full: "Sunday" },
] as const;

export function AvailabilityStep({ form }: AvailabilityStepProps) {
  const isAlwaysAvailable = form.watch("isAlwaysAvailable");

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 ring-1 ring-sky-100 dark:ring-sky-900">
          <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Availability & Working Hours
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            When are you available to provide services?
          </p>
        </div>
      </div>

      {/* Always available toggle */}
      <FormField
        control={form.control}
        name="isAlwaysAvailable"
        render={({ field }) => (
          <FormItem
            className={cn(
              "flex flex-row items-center justify-between rounded-xl border p-5 transition-colors",
              field.value
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700",
            )}
          >
            <div className="space-y-0.5">
              <FormLabel className="text-sm font-semibold text-slate-900 dark:text-slate-100 cursor-pointer">
                Always Available (24/7)
              </FormLabel>
              <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                Enable if you're available anytime, any day
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-emerald-500"
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Custom hours */}
      {!isAlwaysAvailable && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-3.5">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              Toggle each day and set your working hours. Leave days off if
              you're not available.
            </p>
          </div>

          <div className="space-y-2">
            {DAYS_OF_WEEK.map((day) => {
              const dayValue = form.watch(`workingHours.${day.key}`);
              const isActive = !!dayValue;

              return (
                <div
                  key={day.key}
                  className={cn(
                    "rounded-xl border transition-all duration-200",
                    isActive
                      ? "border-sky-200 dark:border-sky-800/50 bg-sky-50/50 dark:bg-sky-950/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                  )}
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "w-10 text-xs font-semibold uppercase tracking-wider",
                          isActive
                            ? "text-sky-700 dark:text-sky-400"
                            : "text-slate-400 dark:text-slate-500",
                        )}
                      >
                        {day.label}
                      </span>
                      <span
                        className={cn(
                          "hidden sm:block text-sm",
                          isActive
                            ? "text-slate-800 dark:text-slate-200 font-medium"
                            : "text-slate-400 dark:text-slate-500",
                        )}
                      >
                        {day.full}
                      </span>
                    </div>

                    <FormField
                      control={form.control}
                      name={`workingHours.${day.key}`}
                      render={({ field }) => (
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(
                              checked
                                ? { start: "09:00", end: "17:00" }
                                : undefined,
                            );
                          }}
                          className="data-[state=checked]:bg-sky-500"
                        />
                      )}
                    />
                  </div>

                  {isActive && (
                    <div className="grid grid-cols-2 gap-3 px-4 pb-3 animate-in fade-in duration-150">
                      <FormField
                        control={form.control}
                        name={`workingHours.${day.key}.start`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 dark:text-slate-400">
                              Start
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                value={field.value ?? "09:00"}
                                className="h-9 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`workingHours.${day.key}.end`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 dark:text-slate-400">
                              End
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                value={field.value ?? "17:00"}
                                className="h-9 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
