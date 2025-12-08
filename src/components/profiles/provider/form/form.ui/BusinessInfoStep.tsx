// components/provider/steps/BusinessInfoStep.tsx

import React from "react";
import { useProviderForm } from "../ProviderFormContext";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, Clock, DollarSign, Mail, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Days of the week for working hours
const DAYS_OF_WEEK = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

const BusinessInfoStep: React.FC = () => {
  const { form } = useProviderForm();
  const {
    register,
    formState: { errors },
    watch,
    control,
    setValue,
  } = form;

  const isAlwaysAvailable = watch("isAlwaysAvailable");
  const requireInitialDeposit = watch("requireInitialDeposit");
  const workingHours = watch("workingHours") || {};

  // Initialize working hours for a day if not exists
  const initializeDay = (day: string) => {
    if (!workingHours[day]) {
      setValue(`workingHours.${day}`, {
        start: "09:00",
        end: "17:00",
      });
    }
  };

  // Remove working hours for a day
  const removeDay = (day: string) => {
    const newWorkingHours = { ...workingHours };
    delete newWorkingHours[day];
    setValue("workingHours", newWorkingHours);
  };

  // Toggle a day's working hours
  const toggleDay = (day: string, enabled: boolean) => {
    if (enabled) {
      initializeDay(day);
    } else {
      removeDay(day);
    }
  };

  // Apply hours to all days
  const applyToAllDays = () => {
    const firstDay = Object.keys(workingHours)[0];
    if (!firstDay) return;

    const template = workingHours[firstDay];
    const newWorkingHours: Record<string, { start: string; end: string }> = {};

    DAYS_OF_WEEK.forEach((day) => {
      newWorkingHours[day.id] = {
        start: template.start,
        end: template.end,
      };
    });

    setValue("workingHours", newWorkingHours);
  };

  return (
    <div className="space-y-6">
      {/* Business Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            Business Details
          </CardTitle>
          <CardDescription>
            Basic information about your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="businessName">
              Business Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="businessName"
              {...register("businessName")}
              placeholder="Enter your business name"
              className={errors.businessName ? "border-red-500" : ""}
            />
            {errors.businessName && (
              <p className="text-sm text-red-500">
                {errors.businessName.message}
              </p>
            )}
          </div>

          {/* Company Trained */}
          <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Controller
              name="isCompanyTrained"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="isCompanyTrained"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1"
                />
              )}
            />
            <div className="flex-1">
              <Label
                htmlFor="isCompanyTrained"
                className="text-sm font-medium cursor-pointer">
                I am company trained
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Check this if you've received official training from a
                recognized company
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-teal-600" />
            Contact Information
          </CardTitle>
          <CardDescription>How clients can reach you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Contact */}
          <div className="space-y-2">
            <Label htmlFor="primaryContact">
              Primary Contact Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="primaryContact"
              {...register("providerContactInfo.primaryContact")}
              placeholder="+233 XX XXX XXXX"
              className={
                errors.providerContactInfo?.primaryContact
                  ? "border-red-500"
                  : ""
              }
            />
            {errors.providerContactInfo?.primaryContact && (
              <p className="text-sm text-red-500">
                {errors.providerContactInfo.primaryContact.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              This will be your main contact number for clients
            </p>
          </div>

          <Separator />

          {/* Secondary Contact */}
          <div className="space-y-2">
            <Label htmlFor="secondaryContact">
              Secondary Contact Number
              <span className="text-gray-500 text-xs ml-2">(Optional)</span>
            </Label>
            <Input
              id="secondaryContact"
              {...register("providerContactInfo.secondaryContact")}
              placeholder="+233 XX XXX XXXX"
            />
          </div>

          {/* Business Contact */}
          <div className="space-y-2">
            <Label htmlFor="businessContact">
              Business Line
              <span className="text-gray-500 text-xs ml-2">(Optional)</span>
            </Label>
            <Input
              id="businessContact"
              {...register("providerContactInfo.businessContact")}
              placeholder="+233 XX XXX XXXX"
            />
          </div>

          <Separator />

          {/* Business Email */}
          <div className="space-y-2">
            <Label htmlFor="businessEmail" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Business Email
              <span className="text-gray-500 text-xs">(Optional)</span>
            </Label>
            <Input
              id="businessEmail"
              type="email"
              {...register("providerContactInfo.businessEmail")}
              placeholder="business@example.com"
              className={
                errors.providerContactInfo?.businessEmail
                  ? "border-red-500"
                  : ""
              }
            />
            {errors.providerContactInfo?.businessEmail && (
              <p className="text-sm text-red-500">
                {errors.providerContactInfo.businessEmail.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Availability Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            Availability
          </CardTitle>
          <CardDescription>
            Set your working hours and availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Always Available Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="space-y-0.5">
              <Label
                htmlFor="isAlwaysAvailable"
                className="text-base font-medium">
                24/7 Availability
              </Label>
              <p className="text-sm text-gray-500">
                Toggle if you're available around the clock
              </p>
            </div>
            <Controller
              name="isAlwaysAvailable"
              control={control}
              render={({ field }) => (
                <Switch
                  id="isAlwaysAvailable"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Working Hours Configuration */}
          {!isAlwaysAvailable && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Working Hours</Label>
                {Object.keys(workingHours).length > 0 && (
                  <button
                    type="button"
                    onClick={applyToAllDays}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                    Apply to all days
                  </button>
                )}
              </div>

              {errors.workingHours && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {typeof errors.workingHours.message === "string"
                      ? errors.workingHours.message
                      : "Please set working hours for at least one day"}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                {DAYS_OF_WEEK.map((day) => {
                  const isDayActive = !!workingHours[day.id];

                  return (
                    <div
                      key={day.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        isDayActive
                          ? "border-teal-200 bg-teal-50/50 dark:border-teal-800 dark:bg-teal-950/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}>
                      <div className="flex items-center gap-4">
                        {/* Day Toggle */}
                        <Checkbox
                          id={`day-${day.id}`}
                          checked={isDayActive}
                          onCheckedChange={(checked) =>
                            toggleDay(day.id, checked as boolean)
                          }
                        />

                        {/* Day Label */}
                        <Label
                          htmlFor={`day-${day.id}`}
                          className="min-w-[100px] font-medium cursor-pointer">
                          {day.label}
                        </Label>

                        {/* Time Inputs */}
                        {isDayActive && (
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-1">
                              <Input
                                type="time"
                                {...register(`workingHours.${day.id}.start`)}
                                className="text-sm"
                              />
                            </div>
                            <span className="text-gray-500">to</span>
                            <div className="flex-1">
                              <Input
                                type="time"
                                {...register(`workingHours.${day.id}.end`)}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        )}

                        {!isDayActive && (
                          <span className="text-sm text-gray-400">Closed</span>
                        )}
                      </div>

                      {/* Show errors for this day */}
                      {isDayActive && errors.workingHours?.[day.id] && (
                        <p className="text-sm text-red-500 mt-2 ml-8">
                          {(() => {
                            const err = errors.workingHours?.[day.id];
                            if (!err || typeof err !== "object") return null;

                            const startMessage =
                              "start" in err ? err.start?.message : null;
                            const endMessage =
                              "end" in err ? err.end?.message : null;

                            return (
                              <>
                                {startMessage && <span>{startMessage}</span>}
                                {endMessage && <span>{endMessage}</span>}
                              </>
                            );
                          })()}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {Object.keys(workingHours).length === 0 && (
                <Alert>
                  <AlertDescription>
                    Select at least one day and set your working hours
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deposit Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-teal-600" />
            Deposit Settings
          </CardTitle>
          <CardDescription>
            Configure initial deposit requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Require Deposit Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="space-y-0.5">
              <Label
                htmlFor="requireInitialDeposit"
                className="text-base font-medium">
                Require Initial Deposit
              </Label>
              <p className="text-sm text-gray-500">
                Clients must pay a deposit before booking
              </p>
            </div>
            <Controller
              name="requireInitialDeposit"
              control={control}
              render={({ field }) => (
                <Switch
                  id="requireInitialDeposit"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Deposit Percentage Input */}
          {requireInitialDeposit && (
            <div className="space-y-2 p-4 border border-teal-200 dark:border-teal-800 rounded-lg bg-teal-50/30 dark:bg-teal-950/20">
              <Label htmlFor="percentageDeposit">
                Deposit Percentage <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="percentageDeposit"
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  {...register("percentageDeposit", { valueAsNumber: true })}
                  placeholder="30"
                  className={`pr-12 ${
                    errors.percentageDeposit ? "border-red-500" : ""
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  %
                </span>
              </div>
              {errors.percentageDeposit && (
                <p className="text-sm text-red-500">
                  {errors.percentageDeposit.message}
                </p>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Recommended: 20-50% of the total service cost
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessInfoStep;
