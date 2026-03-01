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
import { CreditCard, Percent } from "lucide-react";
import { ProviderProfileFormData } from "./providerProfileSchema";
import { cn } from "@/lib/utils/utils";

interface PaymentSettingsStepProps {
  form: UseFormReturn<ProviderProfileFormData>;
}

export function PaymentSettingsStep({ form }: PaymentSettingsStepProps) {
  const requireDeposit = form.watch("requireInitialDeposit");

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 ring-1 ring-indigo-100 dark:ring-indigo-900">
          <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Payment Settings
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure your deposit and payment preferences
          </p>
        </div>
      </div>

      {/* Require deposit toggle */}
      <FormField
        control={form.control}
        name="requireInitialDeposit"
        render={({ field }) => (
          <FormItem
            className={cn(
              "flex flex-row items-center justify-between rounded-xl border p-5 transition-colors",
              field.value
                ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/50"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700",
            )}
          >
            <div className="space-y-0.5">
              <FormLabel className="text-sm font-semibold text-slate-900 dark:text-slate-100 cursor-pointer">
                Require Initial Deposit
              </FormLabel>
              <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                do you require customers to pay a deposit upfront before work
                begins?
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-indigo-500"
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Deposit percentage */}
      {requireDeposit && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200 space-y-4">
          <FormField
            control={form.control}
            name="percentageDeposit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Deposit Percentage <span className="text-rose-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative max-w-xs">
                    <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="e.g., 30"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-11 pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500/20 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Percentage of the total service cost required upfront (1–100%)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Visual deposit indicator */}
          {(form.watch("percentageDeposit") ?? 0) > 0 && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Deposit preview
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(form.watch("percentageDeposit") ?? 0, 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 min-w-12 text-right">
                  {form.watch("percentageDeposit")}%
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Customers will pay{" "}
                <strong>{form.watch("percentageDeposit")}%</strong> upfront on
                each requested service before work begins
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
