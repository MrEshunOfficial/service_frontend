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
import { Phone, Mail } from "lucide-react";
import { ProviderProfileFormData } from "./providerProfileSchema";

interface ContactInfoStepProps {
  form: UseFormReturn<ProviderProfileFormData>;
}

export function ContactInfoStep({ form }: ContactInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-blue-600 pl-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Phone className="w-6 h-6 text-blue-600" />
          Contact Information
        </h2>
        <p className="text-slate-600 mt-1">How can customers reach you?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="providerContactInfo.primaryContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Primary Contact <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="+233 XX XXX XXXX"
                  {...field}
                  className="h-12"
                />
              </FormControl>
              <FormDescription>Your main phone number</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="providerContactInfo.secondaryContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary Contact</FormLabel>
              <FormControl>
                <Input
                  placeholder="+233 XX XXX XXXX"
                  {...field}
                  className="h-12"
                />
              </FormControl>
              <FormDescription>Alternative phone number</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="providerContactInfo.businessContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Contact</FormLabel>
              <FormControl>
                <Input
                  placeholder="+233 XX XXX XXXX"
                  {...field}
                  className="h-12"
                />
              </FormControl>
              <FormDescription>
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
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Business Email
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="business@example.com"
                  {...field}
                  className="h-12"
                />
              </FormControl>
              <FormDescription>For business inquiries</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
