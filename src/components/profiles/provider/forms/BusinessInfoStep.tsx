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
import { Building2, Award } from "lucide-react";
import { ProviderProfileFormData } from "./providerProfileSchema";

interface BusinessInfoStepProps {
  form: UseFormReturn<ProviderProfileFormData>;
}

export function BusinessInfoStep({ form }: BusinessInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-blue-600 pl-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          Business Information
        </h2>
        <p className="text-slate-600 mt-1">
          Tell us about your business or service
        </p>
      </div>

      <FormField
        control={form.control}
        name="businessName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Name (Optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., ABC Cleaning Services"
                {...field}
                className="h-12"
              />
            </FormControl>
            <FormDescription>
              If you operate under a business name, enter it here
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="isCompanyTrained"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-gradient-to-r from-amber-50 to-orange-50">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none flex-1">
              <FormLabel className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                Company Trained Provider
              </FormLabel>
              <FormDescription>
                Are you certified or trained by our company? This helps build
                trust with customers.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
