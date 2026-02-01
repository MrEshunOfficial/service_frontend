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

interface AvailabilityStepProps {
  form: UseFormReturn<ProviderProfileFormData>;
}

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

export function AvailabilityStep({ form }: AvailabilityStepProps) {
  const isAlwaysAvailable = form.watch("isAlwaysAvailable");

  return (
    <div className="space-y-6 bg-background text-foreground">
      <div className="border-l-4 border-blue-600 dark:border-blue-400 pl-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Availability & Working Hours
        </h2>
        <p className="text-muted-foreground mt-1">
          When are you available to provide services?
        </p>
      </div>

      <FormField
        control={form.control}
        name="isAlwaysAvailable"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border p-4 bg-green-50/70 dark:bg-green-950/30">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none flex-1">
              <FormLabel className="text-foreground">
                Always Available (24/7)
              </FormLabel>
              <FormDescription className="text-muted-foreground">
                Enable this if you're available anytime. Otherwise, set specific
                working hours below.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {!form.watch("isAlwaysAvailable") && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Note:</strong> Set your working hours for each day. Leave
              blank for days you're not available.
            </p>
          </div>

          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day.key}
                className={`border border-border rounded-lg p-4 ${
                  form.watch(`workingHours.${day.key}`)
                    ? "bg-muted/40"
                    : "bg-background"
                } transition-colors`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{day.label}</h3>
                  <FormField
                    control={form.control}
                    name={`workingHours.${day.key}`}
                    render={({ field }) => (
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange({ start: "09:00", end: "17:00" });
                          } else {
                            field.onChange(undefined);
                          }
                        }}
                      />
                    )}
                  />
                </div>

                {form.watch(`workingHours.${day.key}`) && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`workingHours.${day.key}.start`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-muted-foreground">
                            Start Time
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              className="h-10 bg-background border-border text-foreground"
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
                          <FormLabel className="text-sm text-muted-foreground">
                            End Time
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              className="h-10 bg-background border-border text-foreground"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
