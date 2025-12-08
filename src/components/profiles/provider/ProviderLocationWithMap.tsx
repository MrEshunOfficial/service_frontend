import React, { useState, useEffect } from "react";
import { MapPin, Navigation, Maximize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coordinates } from "@/types/provider.types";

interface GoogleMapEmbedProps {
  coordinates: Coordinates;
  locationName?: string;
  nearbyLandmark?: string;
  ghanaPostGPS?: string;
  showDirections?: boolean;
  className?: string;
}

export const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({
  coordinates,
  locationName,
  nearbyLandmark,
  ghanaPostGPS,
  showDirections = true,
  className = "",
}) => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Get user's current location
  const getUserLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        setLocationError("Unable to get your location");
        setIsLoadingLocation(false);
        console.error("Geolocation error:", error);
      }
    );
  };

  // Build the map URL
  const buildMapUrl = (withDirections: boolean = false) => {
    const { latitude, longitude } = coordinates;

    if (withDirections && userLocation) {
      // Directions mode: from user location to provider location
      return `https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=${userLocation.latitude},${userLocation.longitude}&destination=${latitude},${longitude}&mode=driving`;
    }

    // Default: show provider location with marker
    const query = encodeURIComponent(
      locationName ||
        nearbyLandmark ||
        ghanaPostGPS ||
        `${latitude},${longitude}`
    );
    return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${query}&center=${latitude},${longitude}&zoom=15`;
  };

  // Open full map in new tab
  const openInGoogleMaps = () => {
    const { latitude, longitude } = coordinates;
    if (userLocation) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${latitude},${longitude}`,
        "_blank"
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        "_blank"
      );
    }
  };

  const [showDirectionsMode, setShowDirectionsMode] = useState(false);

  useEffect(() => {
    if (showDirectionsMode && !userLocation && !isLoadingLocation) {
      getUserLocation();
    }
  }, [showDirectionsMode]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Map
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={openInGoogleMaps}
            className="gap-2">
            <Maximize2 className="w-4 h-4" />
            Open in Maps
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location Info */}
        <div className="text-sm space-y-1">
          {ghanaPostGPS && <p className="font-medium">{ghanaPostGPS}</p>}
          {nearbyLandmark && (
            <p className="text-muted-foreground">{nearbyLandmark}</p>
          )}
        </div>

        {/* Map Controls */}
        {showDirections && (
          <div className="flex gap-2">
            <Button
              variant={!showDirectionsMode ? "default" : "outline"}
              size="sm"
              onClick={() => setShowDirectionsMode(false)}
              className="flex-1">
              <MapPin className="w-4 h-4 mr-2" />
              View Location
            </Button>
            <Button
              variant={showDirectionsMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowDirectionsMode(true);
                if (!userLocation) getUserLocation();
              }}
              disabled={isLoadingLocation}
              className="flex-1">
              <Navigation className="w-4 h-4 mr-2" />
              {isLoadingLocation ? "Loading..." : "Get Directions"}
            </Button>
          </div>
        )}

        {/* Error Message */}
        {locationError && showDirectionsMode && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {locationError}. You can still view the location or open in Google
            Maps.
          </div>
        )}

        {/* Map Embed */}
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden border">
          <iframe
            src={buildMapUrl(showDirectionsMode && !!userLocation)}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map showing ${locationName || "provider location"}`}
          />
        </div>

        {/* Coordinates Display */}
        <div className="text-xs text-muted-foreground text-center">
          {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
        </div>
      </CardContent>
    </Card>
  );
};

// Updated LocationSection component to include the map
export const LocationSectionWithMap: React.FC<{
  location: any;
  distance?: number;
  distanceFormatted?: string;
  showDistance?: boolean;
  businessName?: string;
}> = ({
  location,
  distanceFormatted,
  showDistance,
  businessName,
}) => {
  if (!location.gpsCoordinates) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium text-sm">{location.ghanaPostGPS}</p>
            {location.nearbyLandmark && (
              <p className="text-sm text-muted-foreground">
                {location.nearbyLandmark}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {[location.city, location.region].filter(Boolean).join(", ")}
            </p>
            {showDistance && distanceFormatted && (
              <div className="flex items-center gap-2 mt-3">
                <Navigation className="w-3 h-3 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  {distanceFormatted} away
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <GoogleMapEmbed
      coordinates={location.gpsCoordinates}
      locationName={businessName}
      nearbyLandmark={location.nearbyLandmark}
      ghanaPostGPS={location.ghanaPostGPS}
      showDirections={true}
    />
  );
};
