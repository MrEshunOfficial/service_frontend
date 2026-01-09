// components/client/AddressManagement.tsx

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  ExternalLink,
  Trash2,
  Star,
  Map as MapIcon,
  List,
  CheckCircle2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserLocation } from "@/types/base.types";

interface AddressManagementProps {
  addresses: UserLocation[];
  defaultAddressIndex?: number;
  onAddAddress?: (address: UserLocation) => Promise<void>;
  onRemoveAddress?: (index: number) => Promise<void>;
  onSetDefaultAddress?: (index: number) => Promise<void>;
}

export function AddressManagement({
  addresses,
  defaultAddressIndex,
  onRemoveAddress,
  onSetDefaultAddress,
}: AddressManagementProps) {
  const [removeDialog, setRemoveDialog] = useState<{
    open: boolean;
    index: number;
  }>({ open: false, index: -1 });
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (removeDialog.index === -1 || !onRemoveAddress) return;

    setLoading(true);
    try {
      await onRemoveAddress(removeDialog.index);
      setRemoveDialog({ open: false, index: -1 });
    } catch (error) {
      console.error("Error removing address:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (index: number) => {
    if (!onSetDefaultAddress) return;

    setLoading(true);
    try {
      await onSetDefaultAddress(index);
    } catch (error) {
      console.error("Error setting default address:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGoogleMapsUrl = (address: UserLocation) => {
    if (address.gpsCoordinates?.latitude && address.gpsCoordinates?.longitude) {
      return `https://www.google.com/maps?q=${address.gpsCoordinates.latitude},${address.gpsCoordinates.longitude}`;
    }
    const query = [
      address.houseNumber,
      address.streetName,
      address.locality,
      address.city,
      address.region,
    ]
      .filter(Boolean)
      .join(", ");
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  };

  return (
    <>
      <Card className="bg-transparent">
        {" "}
        {/* Main card made transparent */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Saved Addresses
          </CardTitle>
          <CardDescription>Your registered delivery locations</CardDescription>
        </CardHeader>
        <CardContent>
          {addresses && addresses.length > 0 ? (
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">
                  <List className="h-4 w-4 mr-2" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="map">
                  <MapIcon className="h-4 w-4 mr-2" />
                  Map View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {addresses.map((address: UserLocation, index: number) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          index === defaultAddressIndex
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {index === defaultAddressIndex && (
                              <Badge variant="default" className="gap-1">
                                <Star className="h-3 w-3" />
                                Default
                              </Badge>
                            )}
                            {address.isAddressVerified && (
                              <Badge variant="outline" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {index !== defaultAddressIndex && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleSetDefault(index)}
                                disabled={loading}>
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                setRemoveDialog({ open: true, index })
                              }
                              disabled={loading}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="text-sm flex-1">
                              <p className="font-medium">
                                {address.ghanaPostGPS || "No GPS code"}
                              </p>
                              <p className="text-muted-foreground mt-1">
                                {[
                                  address.houseNumber,
                                  address.streetName,
                                  address.locality,
                                  address.city,
                                  address.region,
                                ]
                                  .filter(Boolean)
                                  .join(", ") ||
                                  "Address details not available"}
                              </p>
                              {address.nearbyLandmark && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Near: {address.nearbyLandmark}
                                </p>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            asChild>
                            <a
                              href={getGoogleMapsUrl(address)}
                              target="_blank"
                              rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View on Google Maps
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="map" className="mt-4">
                <div className="w-full h-[400px] rounded-lg overflow-hidden border">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${
                      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
                    }&q=${
                      addresses[0]?.gpsCoordinates?.latitude &&
                      addresses[0]?.gpsCoordinates?.longitude
                        ? `${addresses[0].gpsCoordinates.latitude},${addresses[0].gpsCoordinates.longitude}`
                        : encodeURIComponent(
                            [
                              addresses[0]?.houseNumber,
                              addresses[0]?.streetName,
                              addresses[0]?.city,
                              addresses[0]?.region,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          )
                    }`}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Showing{" "}
                  {defaultAddressIndex !== undefined
                    ? "default address"
                    : "first address"}{" "}
                  on map
                </p>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-20" />
              <p className="text-sm text-muted-foreground">
                No saved addresses yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={removeDialog.open}
        onOpenChange={(open) => setRemoveDialog({ ...removeDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove address?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this address? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {loading ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default AddressManagement;
