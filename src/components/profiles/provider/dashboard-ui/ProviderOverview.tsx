import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Home, CheckCircle2 } from "lucide-react";
import { PopulatedProviderProfile } from "@/types/profiles/provider-profile.types";

interface ProviderOverviewProps {
  profile: PopulatedProviderProfile;
}

export const ProviderOverview: React.FC<ProviderOverviewProps> = ({
  profile,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Working Hours Card */}
      {profile.workingHours && !profile.isAlwaysAvailable && (
        <Card className="border border-slate-300 dark:border-slate-600 bg-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(profile.workingHours).map(([day, hours]) => (
              <div
                key={day}
                className="flex justify-between items-center py-2 border-b border-slate-300 dark:border-slate-600 last:border-0"
              >
                <span className="font-medium capitalize text-slate-700 dark:text-slate-300">
                  {day}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {hours.start} - {hours.end}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Always Available Card */}
      {profile.isAlwaysAvailable && (
        <Card className="border border-slate-300 dark:border-slate-600 bg-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 bg-green-100/50 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-green-700 dark:text-green-300">
                  Always Available
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  You accept bookings 24/7
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Details Card */}
      <Card className="border border-slate-300 dark:border-slate-600 bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Home className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Business Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-2 border-b border-slate-300 dark:border-slate-600">
            <span className="text-slate-700 dark:text-slate-300">
              Company Trained
            </span>
            <Badge variant={profile.isCompanyTrained ? "default" : "secondary"}>
              {profile.isCompanyTrained ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-300 dark:border-slate-600">
            <span className="text-slate-700 dark:text-slate-300">
              Always Available
            </span>
            <Badge
              variant={profile.isAlwaysAvailable ? "default" : "secondary"}
            >
              {profile.isAlwaysAvailable ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-300 dark:border-slate-600">
            <span className="text-slate-700 dark:text-slate-300">
              Requires Deposit
            </span>
            <Badge
              variant={profile.requireInitialDeposit ? "default" : "secondary"}
            >
              {profile.requireInitialDeposit
                ? `Yes (${profile.percentageDeposit}%)`
                : "No"}
            </Badge>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-700 dark:text-slate-300">
              Member Since
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {new Date(profile.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
