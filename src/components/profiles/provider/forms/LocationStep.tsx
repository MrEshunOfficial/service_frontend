import { UseFormReturn } from "react-hook-form";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocationEnrichment } from "@/hooks/profiles/useProviderProfile";
import { ProviderProfileFormData } from "./providerProfileSchema";
import { toast } from "sonner";
import { cn } from "@/lib/utils/utils";

interface LocationStepProps {
  form: UseFormReturn<ProviderProfileFormData>;
}

export function LocationStep({ form }: LocationStepProps) {
  const { enrichLocation, loading: enriching } = useLocationEnrichment();
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "verified" | "failed"
  >("idle");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-fetch GPS coordinates on mount
  useEffect(() => {
    const hasCoordinates = form.getValues("locationData.gpsCoordinates");
    if (!hasCoordinates && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          form.setValue("locationData.gpsCoordinates", {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {}, // silently fail
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    }
  }, []);

  const handleEnrich = useCallback(
    async (gpsCode: string) => {
      if (!gpsCode || gpsCode.length < 5) return;

      setVerificationStatus("verifying");

      const nearbyLandmark = form.getValues("locationData.nearbyLandmark");
      const coordinates = form.getValues("locationData.gpsCoordinates");

      try {
        const enrichedData = await enrichLocation({
          ghanaPostGPS: gpsCode,
          nearbyLandmark,
          coordinates,
        });

        if (enrichedData) {
          const fields = [
            "region",
            "city",
            "district",
            "locality",
            "streetName",
            "houseNumber",
            "gpsCoordinates",
            "isAddressVerified",
            "sourceProvider",
          ] as const;

          fields.forEach((key) => {
            const val = enrichedData[key as keyof typeof enrichedData];
            if (val !== undefined) {
              form.setValue(`locationData.${key}` as any, val);
            }
          });

          setVerificationStatus("verified");
          toast.success("Location verified and details filled in!");
        } else {
          setVerificationStatus("failed");
          toast.error(
            "Could not verify this GPS code. Please check and try again.",
          );
        }
      } catch {
        setVerificationStatus("failed");
      }
    },
    [form, enrichLocation],
  );

  const handleGPSChange = (value: string) => {
    const formatted = value.toUpperCase();

    // Reset verification when GPS changes
    setVerificationStatus("idle");
    form.setValue("locationData.isAddressVerified", false);
    [
      "region",
      "city",
      "district",
      "locality",
      "streetName",
      "houseNumber",
    ].forEach((f) => form.setValue(`locationData.${f}` as any, ""));

    // Debounce auto-enrich
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (formatted.length >= 8) {
      debounceRef.current = setTimeout(() => handleEnrich(formatted), 800);
    }
  };

  const isAddressVerified = form.watch("locationData.isAddressVerified");
  const gpsValue = form.watch("locationData.ghanaPostGPS");
  const showDetails = isAddressVerified && verificationStatus === "verified";

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 ring-1 ring-violet-100 dark:ring-violet-900">
          <MapPin className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Location Details
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Where do you provide your services?
          </p>
        </div>
      </div>

      {/* Primary inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField
          control={form.control}
          name="locationData.nearbyLandmark"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nearby Landmark
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Opposite Accra Mall, Near East Legon traffic light"
                  {...field}
                  value={field.value ?? ""}
                  className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-400 focus:ring-violet-500/20 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </FormControl>
              <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                Helps customers find you easily
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="locationData.ghanaPostGPS"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Ghana Post GPS Code <span className="text-rose-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="GA-183-8164"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          field.onChange(e.target.value.toUpperCase());
                          handleGPSChange(e.target.value);
                        }}
                        className={cn(
                          "h-11 pl-10 pr-10 font-mono uppercase bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-400 focus:ring-violet-500/20 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 placeholder:normal-case placeholder:font-sans",
                          verificationStatus === "verified" &&
                            "border-emerald-400 dark:border-emerald-600 focus:border-emerald-500",
                          verificationStatus === "failed" &&
                            "border-rose-400 dark:border-rose-600 focus:border-rose-500",
                        )}
                      />
                      {/* Status icon inside input */}
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {verificationStatus === "verifying" || enriching ? (
                          <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size={"icon"}
                            onClick={() => handleEnrich(field.value)}
                            disabled={
                              enriching ||
                              !field.value ||
                              field.value.length < 5
                            }
                            className="p-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap rounded-lg"
                          >
                            <>
                              <RefreshCw className="w-3 h-3" />
                            </>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {verificationStatus === "failed" && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
              Verification Failed
            </p>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
              The GPS code could not be verified. Please double-check and try
              again.
            </p>
          </div>
        </div>
      )}

      {/* Auto-filled fields — only shown after verification */}
      {showDetails && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 px-2 whitespace-nowrap">
              detected Location Details
            </p>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "locationData.region", label: "Region" },
              { name: "locationData.city", label: "City" },
              { name: "locationData.district", label: "District" },
              { name: "locationData.locality", label: "Locality" },
            ].map(({ name, label }) => (
              <FormField
                key={name}
                control={form.control}
                name={name as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {label}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        readOnly
                        className="h-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm cursor-default"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
