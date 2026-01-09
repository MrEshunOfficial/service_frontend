// components/client/FavoritesPopover.tsx

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, X, Package, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface FavoritesPopoverProps {
  favoriteServices: any[];
  favoriteProviders: any[];
  onRemoveService?: (serviceId: string) => Promise<void>;
  onRemoveProvider?: (providerId: string) => Promise<void>;
}

export function FavoritesPopover({
  favoriteServices,
  favoriteProviders,
  onRemoveService,
  onRemoveProvider,
}: FavoritesPopoverProps) {
  const [open, setOpen] = useState(false);
  const [removeDialog, setRemoveDialog] = useState<{
    open: boolean;
    type: "service" | "provider";
    id: string;
    name: string;
  }>({ open: false, type: "service", id: "", name: "" });
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!removeDialog.id) return;

    setLoading(true);
    try {
      if (removeDialog.type === "service" && onRemoveService) {
        await onRemoveService(removeDialog.id);
      } else if (removeDialog.type === "provider" && onRemoveProvider) {
        await onRemoveProvider(removeDialog.id);
      }
      setRemoveDialog({ open: false, type: "service", id: "", name: "" });
    } catch (error) {
      console.error("Error removing favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Heart className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="end">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Your Favorites
              </h3>
              <p className="text-sm text-muted-foreground">
                Services and providers you love
              </p>
            </div>

            <Tabs defaultValue="services" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="services">
                  Services ({favoriteServices.length})
                </TabsTrigger>
                <TabsTrigger value="providers">
                  Providers ({favoriteProviders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="mt-4">
                <ScrollArea className="h-[300px] pr-4">
                  {favoriteServices.length > 0 ? (
                    <div className="space-y-2">
                      {favoriteServices.map((service: any) => (
                        <div
                          key={service._id}
                          className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="flex items-start gap-3 flex-1">
                            <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {service.name || "Unnamed Service"}
                              </p>
                              {service.category && (
                                <Badge variant="secondary" className="mt-1">
                                  {service.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              setRemoveDialog({
                                open: true,
                                type: "service",
                                id: service._id,
                                name: service.name || "this service",
                              })
                            }>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No favorite services yet</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="providers" className="mt-4">
                <ScrollArea className="h-[300px] pr-4">
                  {favoriteProviders.length > 0 ? (
                    <div className="space-y-2">
                      {favoriteProviders.map((provider: any) => (
                        <div
                          key={provider._id}
                          className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="flex items-start gap-3 flex-1">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {provider.name || "Unnamed Provider"}
                              </p>
                              {provider.businessName && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {provider.businessName}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              setRemoveDialog({
                                open: true,
                                type: "provider",
                                id: provider._id,
                                name: provider.name || "this provider",
                              })
                            }>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No favorite providers yet</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog
        open={removeDialog.open}
        onOpenChange={(open) => setRemoveDialog({ ...removeDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from favorites?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {removeDialog.name} from your
              favorites? You can add it back anytime.
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
