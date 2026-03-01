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
import { Phone, Mail, PhoneCall } from "lucide-react";
import { ProviderProfileFormData } from "./providerProfileSchema";

interface ContactInfoStepProps {
  form: UseFormReturn<ProviderProfileFormData>;
}

export function ContactInfoStep({ form }: ContactInfoStepProps) {
  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 ring-1 ring-emerald-100 dark:ring-emerald-900">
          <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Contact Information
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            How can customers reach you?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField
          control={form.control}
          name="providerContactInfo.primaryContact"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Primary Contact <span className="text-rose-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <PhoneCall className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="+233 XX XXX XXXX"
                    {...field}
                    value={field.value ?? ""}
                    className="h-11 pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </FormControl>
              <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                Your main phone number — this is required
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="providerContactInfo.secondaryContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Secondary Contact
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="+233 XX XXX XXXX"
                    {...field}
                    value={field.value ?? ""}
                    className="h-11 pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </FormControl>
              <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                Alternative phone number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="providerContactInfo.businessContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Business Contact
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="+233 XX XXX XXXX"
                    {...field}
                    value={field.value ?? ""}
                    className="h-11 pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </FormControl>
              <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                Official business line (if different)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="providerContactInfo.businessEmail"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Business Email
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="business@example.com"
                    {...field}
                    value={field.value ?? ""}
                    className="h-11 pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </FormControl>
              <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                For business inquiries and notifications
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
