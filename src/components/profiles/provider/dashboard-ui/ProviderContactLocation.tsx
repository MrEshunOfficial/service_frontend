import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail } from "lucide-react";
import { PopulatedProviderProfile } from "@/types/profiles/provider-profile.types";
import { LocationSectionWithMap } from "./ProviderLocationWithMap";

interface ProviderContactLocationProps {
  profile: PopulatedProviderProfile;
}

export const ProviderContactLocation: React.FC<
  ProviderContactLocationProps
> = ({ profile }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Contact Information Card */}
      <Card className="border border-slate-300 dark:border-slate-600 bg-transparent">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg">
            <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Primary Contact
              </p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {profile.providerContactInfo.primaryContact}
              </p>
            </div>
          </div>

          {profile.providerContactInfo.secondaryContact && (
            <div className="flex items-start gap-3 p-3 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Secondary Contact
                </p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {profile.providerContactInfo.secondaryContact}
                </p>
              </div>
            </div>
          )}

          {profile.providerContactInfo.businessContact && (
            <div className="flex items-start gap-3 p-3 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Business Contact
                </p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {profile.providerContactInfo.businessContact}
                </p>
              </div>
            </div>
          )}

          {profile.providerContactInfo.businessEmail && (
            <div className="flex items-start gap-3 p-3 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Business Email
                </p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {profile.providerContactInfo.businessEmail}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location with Map */}
      {profile.locationData && (
        <LocationSectionWithMap
          location={profile.locationData}
          showDistance={false}
          businessName={profile.businessName}
        />
      )}
    </div>
  );
};
