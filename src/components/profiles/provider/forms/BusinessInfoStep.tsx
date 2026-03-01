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
import { Building2, ImagePlus, X } from "lucide-react";
import { ProviderProfileFormData } from "./providerProfileSchema";

interface BusinessInfoStepProps {
  form: UseFormReturn<ProviderProfileFormData>;
}

export function BusinessInfoStep({ form }: BusinessInfoStepProps) {
  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 ring-1 ring-blue-100 dark:ring-blue-900">
          <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Business Information
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tell us about your business or service
          </p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="businessName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Business Name{" "}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., ABC Cleaning Services"
                {...field}
                value={field.value ?? ""}
                className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </FormControl>
            <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
              If you operate under a business name, enter it here
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Info callout */}
      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 p-4">
        <div className="flex gap-3">
          <div className="shrink-0 mt-0.5">
            <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">
                i
              </span>
            </div>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            A complete and accurate business profile helps build trust with
            customers and improves your visibility in search results.
          </p>
        </div>
      </div>
    </div>
  );
}
