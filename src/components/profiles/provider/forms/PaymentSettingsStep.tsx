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
    <div className="space-y-6">
      <div className="border-l-4 border-blue-600 pl-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-blue-600" />
          Payment Settings
        </h2>
        <p className="text-slate-600 mt-1">
          Configure your payment preferences
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>About Initial Deposits</AlertTitle>
        <AlertDescription>
          Requiring an initial deposit helps secure bookings and shows customer
          commitment. This amount is deducted from the final payment.
        </AlertDescription>
      </Alert>

      <FormField
        control={form.control}
        name="requireInitialDeposit"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-gradient-to-r from-purple-50 to-pink-50">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none flex-1">
              <FormLabel>Require Initial Deposit</FormLabel>
              <FormDescription>
                Customers must pay a deposit before booking confirmation
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {requireDeposit && (
        <div className="space-y-6 p-6 border rounded-lg bg-gradient-to-br from-slate-50 to-gray-50">
          <FormField
            control={form.control}
            name="percentageDeposit"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between mb-4">
                  <FormLabel>Deposit Percentage</FormLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={field.value || 0}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      className="w-20 h-10 text-center font-semibold"
                    />
                    <span className="text-lg font-semibold text-slate-700">
                      %
                    </span>
                  </div>
                </div>

                <FormControl>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[field.value || 0]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="w-full"
                  />
                </FormControl>

                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>

                <FormDescription className="mt-4">
                  Customers will pay {depositPercentage || 0}% upfront and the
                  remaining {100 - (depositPercentage || 0)}% after service
                  completion.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              Example Calculation
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>Service Price: GH₵ 100.00</p>
              <p>
                Initial Deposit ({depositPercentage || 0}%): GH₵{" "}
                {(((depositPercentage || 0) * 100) / 100).toFixed(2)}
              </p>
              <p>
                Remaining Payment: GH₵{" "}
                {(100 - ((depositPercentage || 0) * 100) / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {!requireDeposit && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Customers will pay the full amount after service completion.
          </p>
        </div>
      )}
    </div>
  );
}
