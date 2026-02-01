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
    <div className="space-y-6">
      <div className="border-l-4 border-blue-600 pl-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Availability & Working Hours
        </h2>
        <p className="text-slate-600 mt-1">
          When are you available to provide services?
        </p>
      </div>

      <FormField
        control={form.control}
        name="isAlwaysAvailable"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-gradient-to-r from-green-50 to-emerald-50">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none flex-1">
              <FormLabel>Always Available (24/7)</FormLabel>
              <FormDescription>
                Enable this if you're available anytime. Otherwise, set specific
                working hours below.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {!isAlwaysAvailable && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Set your working hours for each day. Leave
              blank for days you're not available.
            </p>
          </div>

          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.key} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{day.label}</h3>
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
                          <FormLabel className="text-sm">Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="h-10" />
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
                          <FormLabel className="text-sm">End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="h-10" />
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
