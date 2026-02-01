import { UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocationEnrichment } from "@/hooks/profiles/useProviderProfile";
import { ProviderProfileFormData } from "./providerProfileSchema";
import { toast } from "sonner";

interface LocationStepProps {
  form: UseFormReturn<ProviderProfileFormData>;
}

export function LocationStep({ form }: LocationStepProps) {
  const { enrichLocation, loading: enriching } = useLocationEnrichment();
  const [fetchingCoordinates, setFetchingCoordinates] = useState(false);

  // Auto-fetch GPS coordinates on component mount
  useEffect(() => {
    const hasCoordinates = form.getValues("locationData.gpsCoordinates");
    if (!hasCoordinates) {
      fetchUserLocation();
    }
  }, []);

  const fetchUserLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setFetchingCoordinates(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue("locationData.gpsCoordinates", {
          latitude,
          longitude,
        });
        toast.success("Location detected successfully");
        setFetchingCoordinates(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error(
          "Failed to get your location. Please enable location services.",
        );
        setFetchingCoordinates(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleEnrichLocation = async () => {
    const ghanaPostGPS = form.getValues("locationData.ghanaPostGPS");
    const nearbyLandmark = form.getValues("locationData.nearbyLandmark");
    const coordinates = form.getValues("locationData.gpsCoordinates");

    if (!ghanaPostGPS) {
      toast.error("Please enter Ghana Post GPS code");
      return;
    }

    try {
      const enrichedData = await enrichLocation({
        ghanaPostGPS,
        nearbyLandmark,
        coordinates,
      });

      if (enrichedData) {
        // Auto-fill all the backend-generated fields
        if (enrichedData.region) {
          form.setValue("locationData.region", enrichedData.region);
        }
        if (enrichedData.city) {
          form.setValue("locationData.city", enrichedData.city);
        }
        if (enrichedData.district) {
          form.setValue("locationData.district", enrichedData.district);
        }
        if (enrichedData.locality) {
          form.setValue("locationData.locality", enrichedData.locality);
        }
        if (enrichedData.streetName) {
          form.setValue("locationData.streetName", enrichedData.streetName);
        }
        if (enrichedData.houseNumber) {
          form.setValue("locationData.houseNumber", enrichedData.houseNumber);
        }
        if (enrichedData.gpsCoordinates) {
          form.setValue(
            "locationData.gpsCoordinates",
            enrichedData.gpsCoordinates,
          );
        }
        if (enrichedData.isAddressVerified !== undefined) {
          form.setValue(
            "locationData.isAddressVerified",
            enrichedData.isAddressVerified,
          );
        }
        if (enrichedData.sourceProvider) {
          form.setValue(
            "locationData.sourceProvider",
            enrichedData.sourceProvider,
          );
        }

        toast.success("Location verified and auto-filled successfully!");
      } else {
        toast.error("Could not verify location. Please check your GPS code.");
      }
    } catch (error) {
      console.error("Failed to enrich location:", error);
      toast.error("Failed to verify location. Please try again.");
    }
  };

  const coordinates = form.watch("locationData.gpsCoordinates");
  const isAddressVerified = form.watch("locationData.isAddressVerified");

  return (
    <div className="space-y-6 bg-background text-foreground">
      <div className="border-l-4 border-blue-600 dark:border-blue-400 pl-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Location Details
        </h2>
        <p className="text-muted-foreground mt-1">
          Where do you provide your services?
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <strong>Tip:</strong> Enter your Ghana Post GPS code and we'll
          auto-fill your location details!
        </p>
      </div>

      {/* GPS Coordinates Status */}
      <div className="bg-muted border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Current Location
              </p>
              {coordinates ? (
                <p className="text-xs text-muted-foreground">
                  {coordinates.latitude.toFixed(6)},{" "}
                  {coordinates.longitude.toFixed(6)}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Not detected</p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchUserLocation}
            disabled={fetchingCoordinates}>
            {fetchingCoordinates ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Location
              </>
            )}
          </Button>
        </div>
      </div>

      {/* User Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="locationData.ghanaPostGPS"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Ghana Post GPS{" "}
                <span className="text-red-600 dark:text-red-400">*</span>
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="GA-1234-5678"
                    {...field}
                    className="h-12 uppercase"
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEnrichLocation}
                  disabled={enriching || !field.value}
                  className="h-12 min-w-[100px]">
                  {enriching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      Verify
                    </>
                  )}
                </Button>
              </div>
              <FormDescription>
                Format: GA-1234-5678 (e.g. GA-183-8164)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationData.nearbyLandmark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nearby Landmark</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Opposite Accra Mall"
                  {...field}
                  className="h-12"
                />
              </FormControl>
              <FormDescription>Helps customers find you easily</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Address Verification Status */}
      {isAddressVerified && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-lg p-4">
          <p className="text-sm text-green-900 dark:text-green-200 flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <strong>Address Verified</strong> — Location details have been
            auto-filled
          </p>
        </div>
      )}

      {/* Auto-filled Fields (Read-only display) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <p className="text-sm font-medium text-muted-foreground">
            Auto-filled Location Details
          </p>
          <span className="text-xs text-muted-foreground/70">
            (Generated automatically)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="locationData.region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-12 bg-muted text-foreground"
                    readOnly
                    placeholder="Auto-filled after verification"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationData.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-12 bg-muted text-foreground"
                    readOnly
                    placeholder="Auto-filled after verification"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationData.district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>District</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-12 bg-muted text-foreground"
                    readOnly
                    placeholder="Auto-filled after verification"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationData.locality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Locality</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-12 bg-muted text-foreground"
                    readOnly
                    placeholder="Auto-filled after verification"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
        <p className="text-sm text-amber-900 dark:text-amber-200">
          <strong>Note:</strong> The region, city, district, and locality fields
          are automatically filled when you verify your Ghana Post GPS code.
          Your current GPS coordinates are detected automatically but can be
          refreshed using the button above.
        </p>
      </div>
    </div>
  );
}
