import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Loader2,
  Navigation,
  CheckCircle2,
  AlertCircle,
  MapPinned,
} from "lucide-react";
import { cn } from "./utils";

interface LocationData {
  latitude: number;
  longitude: number;
  region?: string;
  city?: string;
  district?: string;
  locality?: string;
}

export function LocationStep() {
  const form = useFormContext();
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [enrichedData, setEnrichedData] = useState<any>(null);

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setIsDetecting(true);
    setLocationError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        },
      );

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setLocationData(coords);

      // You would typically call a reverse geocoding API here
      // For now, we'll simulate it
      await enrichLocationData(coords);
    } catch (error: any) {
      let errorMessage = "Unable to detect your location";

      if (error.code === 1) {
        errorMessage =
          "Location permission denied. Please enable location access.";
      } else if (error.code === 2) {
        errorMessage =
          "Location unavailable. Please check your device settings.";
      } else if (error.code === 3) {
        errorMessage = "Location request timed out. Please try again.";
      }

      setLocationError(errorMessage);
    } finally {
      setIsDetecting(false);
    }
  };

  const enrichLocationData = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    setIsEnriching(true);

    try {
      // TODO: Replace with actual reverse geocoding API call
      // Example: await fetch(`/api/geocode/reverse?lat=${coords.latitude}&lng=${coords.longitude}`)

      // Simulated enriched data
      const enriched = {
        region: "Greater Accra",
        city: "Accra",
        district: "Ayawaso West",
        locality: "East Legon",
      };

      setEnrichedData(enriched);
      setLocationData((prev) => (prev ? { ...prev, ...enriched } : null));
    } catch (error) {
      console.error("Failed to enrich location data:", error);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleEnrichAddress = async () => {
    const gpsAddress = form.getValues("savedAddresses.0.ghanaPostGPS");

    if (!gpsAddress) {
      return;
    }

    setIsEnriching(true);

    try {
      // TODO: Replace with actual Ghana Post GPS lookup API
      // Example: await fetch(`/api/location/enrich`, { body: { ghanaPostGPS: gpsAddress } })

      // Simulated response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const enriched = {
        region: "Greater Accra",
        city: "Accra",
        district: "Ayawaso Central",
        locality: "Dzorwulu",
      };

      setEnrichedData(enriched);

      // Update form with enriched data
      if (locationData) {
        form.setValue("savedAddresses.0", {
          ghanaPostGPS: gpsAddress,
          nearbyLandmark: form.getValues("savedAddresses.0.nearbyLandmark"),
          ...enriched,
          gpsCoordinates: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          },
        });
      }
    } catch (error) {
      console.error("Failed to enrich address:", error);
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight">
          Location Details
        </h3>
        <p className="text-sm text-muted-foreground">
          Help us locate you for better service delivery.
        </p>
      </div>

      {/* Location Detection Status */}
      <Card
        className={cn(
          "border-2 transition-colors",
          locationData && "border-primary/20 bg-primary/5",
          locationError && "border-destructive/20 bg-destructive/5",
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {isDetecting ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary mt-0.5" />
            ) : locationData ? (
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            )}

            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">
                {isDetecting
                  ? "Detecting your location..."
                  : locationData
                    ? "Location detected successfully"
                    : "Location detection failed"}
              </p>

              {locationData && (
                <p className="text-xs text-muted-foreground">
                  Coordinates: {locationData.latitude.toFixed(6)},{" "}
                  {locationData.longitude.toFixed(6)}
                  {enrichedData &&
                    ` • ${enrichedData.locality}, ${enrichedData.city}`}
                </p>
              )}

              {locationError && (
                <p className="text-xs text-destructive">{locationError}</p>
              )}
            </div>

            {!isDetecting && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={detectLocation}
                className="shrink-0"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address Input Fields */}
      <div className="grid gap-6">
        {/* Ghana Post GPS Address */}
        <FormField
          control={form.control}
          name="savedAddresses.0.ghanaPostGPS"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghana Post GPS Address *</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g., GA-123-4567"
                      className="pl-10"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setEnrichedData(null);
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleEnrichAddress}
                    disabled={!field.value || isEnriching}
                  >
                    {isEnriching ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <MapPinned className="h-4 w-4 mr-2" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                Enter your Ghana Post GPS digital address
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nearby Landmark */}
        <FormField
          control={form.control}
          name="savedAddresses.0.nearbyLandmark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nearby Landmark</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Opposite Accra Mall" {...field} />
              </FormControl>
              <FormDescription>
                Help service providers locate you easily
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Enriched Location Display */}
        {enrichedData && (
          <Alert className="border-primary/20 bg-primary/5">
            <MapPin className="h-4 w-4 text-primary" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-sm">
                  Verified Location Details:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {enrichedData.region && (
                    <div>
                      <span className="text-muted-foreground">Region:</span>{" "}
                      <span className="font-medium">{enrichedData.region}</span>
                    </div>
                  )}
                  {enrichedData.city && (
                    <div>
                      <span className="text-muted-foreground">City:</span>{" "}
                      <span className="font-medium">{enrichedData.city}</span>
                    </div>
                  )}
                  {enrichedData.district && (
                    <div>
                      <span className="text-muted-foreground">District:</span>{" "}
                      <span className="font-medium">
                        {enrichedData.district}
                      </span>
                    </div>
                  )}
                  {enrichedData.locality && (
                    <div>
                      <span className="text-muted-foreground">Locality:</span>{" "}
                      <span className="font-medium">
                        {enrichedData.locality}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
