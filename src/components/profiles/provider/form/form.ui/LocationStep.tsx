import React, { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import { useProviderForm } from "../ProviderFormContext";
import { ProviderProfileFormData } from "../form.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle,
  Navigation,
  Info,
  RefreshCw,
} from "lucide-react";

const LocationStep: React.FC = () => {
  const { form } = useProviderForm();
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const locationData = watch("locationData");
  const gpsCoordinates = locationData?.gpsCoordinates;

  // Location states
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [locationAttempt, setLocationAttempt] = useState<
    "standard" | "fallback" | null
  >(null);

  // Get user's location from device with retry logic
  const getUserLocation = async (useFallback = false) => {
    setIsGettingLocation(true);
    setLocationError(null);
    setLocationSuccess(false);
    setLocationAttempt(useFallback ? "fallback" : "standard");

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by your browser. Please enter coordinates manually or use a different device."
      );
      setIsGettingLocation(false);
      return;
    }

    // Determine timeout and accuracy settings
    const timeout = useFallback ? 30000 : 15000; // 30s for fallback, 15s for standard
    const enableHighAccuracy = !useFallback; // Use lower accuracy for fallback

    // Request location with configurable settings
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Set the coordinates in the form
        setValue(
          "locationData.gpsCoordinates",
          {
            latitude: parseFloat(latitude.toFixed(6)),
            longitude: parseFloat(longitude.toFixed(6)),
          },
          { shouldValidate: true }
        );

        setLocationSuccess(true);
        setIsGettingLocation(false);
        setRetryCount(0);
        setLocationAttempt(null);

        // Log accuracy for debugging
        console.log(`Location obtained with ${accuracy.toFixed(0)}m accuracy`);
      },
      (error) => {
        let errorMessage = "Unable to get your location. ";
        let canRetry = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage +=
              "You denied location access. Please enable location permissions in your browser settings and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage +=
              "Location information is unavailable. Please check that location services are enabled on your device.";
            canRetry = true;
            break;
          case error.TIMEOUT:
            errorMessage +=
              "Location request timed out. This can happen if GPS signal is weak. ";
            if (!useFallback) {
              errorMessage +=
                "Click 'Try with Lower Accuracy' for a faster result.";
            } else {
              errorMessage +=
                "Please ensure you're in an area with good GPS signal and try again.";
            }
            canRetry = true;
            break;
          default:
            errorMessage += "An unknown error occurred. Please try again.";
            canRetry = true;
        }

        setLocationError(errorMessage);
        setIsGettingLocation(false);

        if (canRetry) {
          setRetryCount((prev) => prev + 1);
        }
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge: 0,
      }
    );
  };

  // Retry with fallback settings
  const retryWithFallback = () => {
    getUserLocation(true);
  };

  // Manual coordinate entry toggle
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Check if coordinates are set
  const hasCoordinates =
    gpsCoordinates?.latitude !== undefined &&
    gpsCoordinates?.latitude !== 0 &&
    gpsCoordinates?.longitude !== undefined &&
    gpsCoordinates?.longitude !== 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Location Information
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Provide your business location details. We'll automatically get your
          GPS coordinates from your device.
        </p>
      </div>

      {/* Ghana Post GPS Address */}
      <div className="space-y-2">
        <Label htmlFor="ghanaPostGPS">
          Ghana Post GPS Address <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="locationData.ghanaPostGPS"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="ghanaPostGPS"
              placeholder="e.g., GA-123-4567"
              className={
                errors.locationData?.ghanaPostGPS ? "border-red-500" : ""
              }
            />
          )}
        />
        {errors.locationData?.ghanaPostGPS && (
          <p className="text-sm text-red-500">
            {errors.locationData.ghanaPostGPS.message}
          </p>
        )}
        <p className="text-xs text-gray-500">
          Enter your Ghana Post Digital Address (e.g., GA-123-4567)
        </p>
      </div>

      {/* Nearby Landmark */}
      <div className="space-y-2">
        <Label htmlFor="nearbyLandmark">Nearby Landmark (Optional)</Label>
        <Controller
          name="locationData.nearbyLandmark"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="nearbyLandmark"
              placeholder="e.g., Near Total Filling Station, Opposite ABC Mall"
            />
          )}
        />
        <p className="text-xs text-gray-500">
          Help customers find you by mentioning a well-known landmark nearby
        </p>
      </div>

      {/* GPS Coordinates Section */}
      <Card className="border-teal-200 bg-teal-50 dark:bg-teal-900/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            GPS Coordinates
          </CardTitle>
          <CardDescription>
            We'll automatically detect your location using your device's GPS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Status */}
          {locationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
          )}

          {locationSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Location detected successfully!
                {locationAttempt === "fallback" &&
                  " (Using lower accuracy mode)"}
              </AlertDescription>
            </Alert>
          )}

          {/* Get Location Buttons */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                onClick={() => getUserLocation(false)}
                disabled={isGettingLocation}
                className="flex-1 bg-teal-600 hover:bg-teal-700 flex items-center justify-center gap-2"
              >
                {isGettingLocation && locationAttempt === "standard" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    {hasCoordinates ? "Update Location" : "Get My Location"}
                  </>
                )}
              </Button>

              {/* Retry with fallback after timeout error */}
              {locationError?.includes("timed out") && !isGettingLocation && (
                <Button
                  type="button"
                  onClick={retryWithFallback}
                  disabled={isGettingLocation}
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isGettingLocation && locationAttempt === "fallback" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Trying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Try with Lower Accuracy
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Manual entry toggle */}
            {!hasCoordinates && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="text-xs"
              >
                {showManualEntry ? "Hide" : "Or enter coordinates manually"}
              </Button>
            )}
          </div>

          {/* Manual Coordinate Entry */}
          {showManualEntry && !hasCoordinates && (
            <div className="space-y-3 pt-3 border-t">
              <p className="text-sm text-gray-600">
                Enter coordinates manually (use a maps app to find them):
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-xs">
                    Latitude
                  </Label>
                  <Controller
                    name="locationData.gpsCoordinates.latitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="latitude"
                        type="number"
                        step="0.000001"
                        placeholder="e.g., 5.603717"
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-xs">
                    Longitude
                  </Label>
                  <Controller
                    name="locationData.gpsCoordinates.longitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="longitude"
                        type="number"
                        step="0.000001"
                        placeholder="e.g., -0.186964"
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Display Coordinates if available */}
          {hasCoordinates && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Coordinates
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setValue("locationData.gpsCoordinates", undefined);
                    setLocationSuccess(false);
                    setShowManualEntry(true);
                  }}
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Latitude</Label>
                  <p className="font-mono text-sm font-medium">
                    {gpsCoordinates.latitude.toFixed(6)}°
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Longitude</Label>
                  <p className="font-mono text-sm font-medium">
                    {gpsCoordinates.longitude.toFixed(6)}°
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Validation error for coordinates */}
          {errors.locationData?.gpsCoordinates && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errors.locationData.gpsCoordinates.message ||
                  "Please provide your GPS coordinates"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Information Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-2">Why we need your location:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>Help customers find service providers near them</li>
              <li>Show accurate distance calculations for service requests</li>
              <li>Improve matching with nearby customers</li>
              <li>Enable location-based features and notifications</li>
            </ul>
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
              Your exact location is kept private and only used for distance
              calculations. Customers will only see your general area.
            </p>
          </div>
        </div>
      </div>

      {/* Troubleshooting Tips */}
      {retryCount > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Troubleshooting Location Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">
              If you're having trouble getting your location:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-orange-900 dark:text-orange-100">
              <li>
                Make sure you're not in "Incognito" or "Private" browsing mode
              </li>
              <li>
                Try moving to an area with better GPS signal (near
                windows/outdoors)
              </li>
              <li>Check that location services are enabled on your device</li>
              <li>Clear your browser's cache and refresh the page</li>
              <li>Try using the "Lower Accuracy" option for faster results</li>
              <li>As a last resort, you can enter coordinates manually</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Location Permission Guide */}
      {locationError?.includes("denied") && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              How to Enable Location Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">For Chrome:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Click the lock icon in the address bar</li>
              <li>Find "Location" in the permissions list</li>
              <li>Select "Allow" and reload the page</li>
            </ol>
            <p className="font-medium mt-3">For Safari:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to Safari → Settings → Websites</li>
              <li>Click on "Location"</li>
              <li>Find this website and select "Allow"</li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationStep;
