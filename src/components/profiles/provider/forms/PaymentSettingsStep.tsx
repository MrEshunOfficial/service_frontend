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
import { DollarSign, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProviderProfileFormData } from "./providerProfileSchema";
import { Slider } from "@/components/ui/slider";

interface PaymentSettingsStepProps {
  form: UseFormReturn<ProviderProfileFormData>;
}

export function PaymentSettingsStep({ form }: PaymentSettingsStepProps) {
  const requireDeposit = form.watch("requireInitialDeposit");
  const depositPercentage = form.watch("percentageDeposit");

  return (
    <div className="space-y-6 bg-background text-foreground">
      <div className="border-l-4 border-blue-600 dark:border-blue-400 pl-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Payment Settings
        </h2>
        <p className="text-muted-foreground mt-1">
          Configure your payment preferences
        </p>
      </div>

      <Alert className="border-border">
        <Info className="h-4 w-4 text-muted-foreground" />
        <AlertTitle className="text-foreground">
          About Initial Deposits
        </AlertTitle>
        <AlertDescription className="text-muted-foreground">
          Requiring an initial deposit helps secure bookings and shows customer
          commitment. This amount is deducted from the final payment.
        </AlertDescription>
      </Alert>

      <FormField
        control={form.control}
        name="requireInitialDeposit"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border p-4 bg-purple-50/60 dark:bg-purple-950/25">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none flex-1">
              <FormLabel className="text-foreground">
                Require Initial Deposit
              </FormLabel>
              <FormDescription className="text-muted-foreground">
                Customers must pay a deposit before booking confirmation
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {form.watch("requireInitialDeposit") && (
        <div className="space-y-6 p-6 border border-border rounded-lg bg-muted/30 dark:bg-muted/20">
          <FormField
            control={form.control}
            name="percentageDeposit"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between mb-4">
                  <FormLabel className="text-foreground">
                    Deposit Percentage
                  </FormLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      className="w-20 h-10 text-center font-semibold bg-background border-border text-foreground"
                    />
                    <span className="text-lg font-semibold text-foreground">
                      %
                    </span>
                  </div>
                </div>

                <FormControl>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[field.value ?? 0]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="w-full"
                  />
                </FormControl>

                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>

                <FormDescription className="mt-4 text-muted-foreground">
                  Customers will pay {field.value ?? 0}% upfront and the
                  remaining {100 - (field.value ?? 0)}% after service
                  completion.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Example Calculation
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <p>Service Price: GH₵ 100.00</p>
              <p>
                Initial Deposit ({form.watch("percentageDeposit") ?? 0}%): GH₵{" "}
                {(((form.watch("percentageDeposit") ?? 0) * 100) / 100).toFixed(
                  2,
                )}
              </p>
              <p>
                Remaining Payment: GH₵{" "}
                {(
                  100 -
                  ((form.watch("percentageDeposit") ?? 0) * 100) / 100
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {!form.watch("requireInitialDeposit") && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Customers will pay the full amount after service completion.
          </p>
        </div>
      )}
    </div>
  );
}
