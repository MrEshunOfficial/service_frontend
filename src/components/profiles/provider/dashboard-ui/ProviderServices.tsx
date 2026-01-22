import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase } from "lucide-react";
import { PopulatedProviderProfile } from "@/types/profiles/provider-profile.types";

interface ProviderServicesProps {
  profile: PopulatedProviderProfile;
}

export const ProviderServices: React.FC<ProviderServicesProps> = ({
  profile,
}) => {
  if (!profile.serviceOfferings || profile.serviceOfferings.length === 0) {
    return (
      <Card className="border border-slate-300 dark:border-slate-600 bg-transparent">
        <CardContent className="p-12 text-center">
          <Briefcase className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No Services Yet
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Start by adding your first service offering
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {profile.serviceOfferings.map((service, idx) => {
        if (typeof service === "string") return null;

        return (
          <Card
            key={idx}
            className="overflow-hidden border border-slate-300 dark:border-slate-600 bg-transparent hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col md:flex-row">
              {service.coverImage && typeof service.coverImage === "object" && (
                <div className="md:w-48 md:h-48 shrink-0">
                  <img
                    src={service.coverImage.thumbnailUrl}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {service.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className="mb-2 border-slate-400 dark:border-slate-500 text-slate-700 dark:text-slate-300"
                    >
                      {typeof service.categoryId === "object"
                        ? service.categoryId.catName
                        : "Category"}
                    </Badge>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {service.description}
                    </p>
                  </div>
                  <Badge
                    variant={service.isActive ? "default" : "secondary"}
                    className="ml-3 shrink-0"
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {service.servicePricing && (
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-300 dark:border-slate-600">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Base Price
                      </p>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {service.servicePricing.currency}{" "}
                        {service.servicePricing.serviceBasePrice}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Your Earnings
                      </p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {service.servicePricing.currency}{" "}
                        {service.servicePricing.providerEarnings}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Commission Rate
                      </p>
                      <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                        {(service.servicePricing.platformCommissionRate ?? 0) *
                          100}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Travel Fee
                      </p>
                      <Badge
                        variant={
                          service.servicePricing.includeTravelFee
                            ? "default"
                            : "secondary"
                        }
                      >
                        {service.servicePricing.includeTravelFee
                          ? "Included"
                          : "Not Included"}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
