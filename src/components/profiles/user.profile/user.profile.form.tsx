"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Briefcase,
  User,
  Phone,
  FileText,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { UserRole } from "@/types/base.types";
import { ImageUploadWithPreview } from "@/components/filemanager/shared/ImageUploadWithPreview";
import { useCreateProfile } from "@/hooks/profiles/userProfile.hook";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Schema
const createProfileSchema = z.object({
  role: z
    .nativeEnum(UserRole)
    .refine((v) => v !== undefined && v !== null, "Please select a role"),

  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  mobileNumber: z
    .string()
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      "Invalid phone number format"
    )
    .optional()
    .or(z.literal("")),
  profilePictureId: z.string().optional(),
});

type CreateProfileFormData = z.infer<typeof createProfileSchema>;

export default function CreateProfileForm() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<CreateProfileFormData>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      role: undefined,
      bio: "",
      mobileNumber: "",
      profilePictureId: undefined,
    },
  });

  const { createProfile, loading: creatingProfile } = useCreateProfile({
    onSuccess: () => {
      setShowSuccess(true);
    },
    onError: (error) => {
      toast.error(`Failed to create profile: ${error.message}`);
    },
  });

  const selectedRole = form.watch("role");
  const bioValue = form.watch("bio") || "";

  const onSubmit = async (data: CreateProfileFormData) => {
    try {
      const profileData = {
        role: data.role,
        mobileNumber: data.mobileNumber || undefined,
        bio: data.bio || undefined,
        profilePictureId: data.profilePictureId || undefined,
      };

      const result = await createProfile(profileData);
      if (result) {
        toast.success("Profile created successfully");
        console.log(result);
      }
    } catch (error) {
      toast.error(`Error creating profile: ${error}`);
      console.error("Error creating profile:", error);
    }
  };

  const handleUploadComplete = (fileId: string) => {
    form.setValue("profilePictureId", fileId);
  };

  const handleUploadError = (error: string) => {
    console.error("Upload error:", error);
    toast.error("Failed to upload image");
  };

  const handleImageRemove = () => {
    form.setValue("profilePictureId", undefined);
  };

  const navigateToProfile = () => {
    router.push("/profile");
  };

  const navigateToRoleProfile = () => {
    if (selectedRole === UserRole.PROVIDER) {
      router.push("/Provider-profile");
    } else {
      router.push("/client-profile");
    }
  };

  if (showSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-white/10">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform duration-300 hover:scale-105">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          {/* Title & Subtitle */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Welcome Aboard 🎉
          </h2>
          <p className="text-gray-600 dark:text-white/80 mb-8 leading-relaxed">
            Your profile has been created successfully. Ready to take the next
            step?
          </p>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-400 dark:to-teal-500 hover:from-teal-600 hover:to-teal-700 text-white dark:text-gray-900"
              onClick={navigateToRoleProfile}
              size="lg">
              Complete{" "}
              {selectedRole === UserRole.PROVIDER ? "Business" : "Client"}{" "}
              Profile
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <button
              className="text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white underline text-sm"
              onClick={navigateToProfile}>
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg dark:shadow-2xl p-6 md:p-8 border border-gray-200 dark:border-white/10">
            {/* Profile Picture Section */}
            <FormField
              control={form.control}
              name="profilePictureId"
              render={({}) => (
                <FormItem className="mb-8">
                  <div className="text-center mb-4">
                    <FormLabel className="text-lg font-semibold">
                      Add Profile Photo
                    </FormLabel>
                  </div>

                  <FormControl>
                    <div className="flex justify-center">
                      <div className="w-32 h-32 md:w-40 md:h-40">
                        <ImageUploadWithPreview
                          type="profile"
                          onUploadComplete={handleUploadComplete}
                          onUploadError={handleUploadError}
                          onRemove={handleImageRemove}
                          aspectRatio="square"
                          maxSizeMB={5}
                          placeholder="Upload Photo"
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Selection */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="mb-8">
                  <FormLabel className="text-lg font-semibold">
                    I want to{" "}
                    <span className="text-rose-500 dark:text-rose-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div
                        onClick={() => field.onChange(UserRole.PROVIDER)}
                        className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          field.value === UserRole.PROVIDER
                            ? "border-teal-600 dark:border-teal-400 bg-gradient-to-br from-teal-400/30 to-teal-600/30 dark:from-teal-500/40 dark:to-teal-700/40 shadow-lg scale-[1.02]"
                            : "border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-md hover:bg-white/80 dark:hover:bg-white/10"
                        }`}>
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              field.value === UserRole.PROVIDER
                                ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-gray-900"
                                : "bg-gray-200/80 dark:bg-white/10 text-gray-700 dark:text-white/90"
                            }`}>
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                              Offer Services
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-white/90 leading-snug">
                              Share your skills and expertise with clients
                            </p>
                          </div>
                        </div>
                        {field.value === UserRole.PROVIDER && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                          </div>
                        )}
                      </div>

                      <div
                        onClick={() => field.onChange(UserRole.CUSTOMER)}
                        className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          field.value === UserRole.CUSTOMER
                            ? "border-sky-500 dark:border-sky-400 bg-gradient-to-br from-sky-400/30 to-sky-600/30 dark:from-sky-500/40 dark:to-sky-700/40 shadow-lg scale-[1.02]"
                            : "border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-md hover:bg-white/80 dark:hover:bg-white/10"
                        }`}>
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              field.value === UserRole.CUSTOMER
                                ? "bg-sky-500 dark:bg-sky-400 text-white dark:text-gray-900"
                                : "bg-gray-200/80 dark:bg-white/10 text-gray-700 dark:text-white/90"
                            }`}>
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                              Find Services
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-white/90 leading-snug">
                              Discover and hire talented service providers
                            </p>
                          </div>
                        </div>
                        {field.value === UserRole.CUSTOMER && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle2 className="w-6 h-6 text-sky-500 dark:text-sky-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Fields */}
            <div className="space-y-6 mb-8">
              {/* Mobile Number */}
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <Phone className="w-4 h-4" />
                      Mobile Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        disabled={creatingProfile}
                        className="border-2 bg-white/80 dark:bg-white/5 backdrop-blur-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <FileText className="w-4 h-4" />
                      Tell Us About Yourself
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        maxLength={500}
                        disabled={creatingProfile}
                        placeholder="Share a bit about yourself, your interests, or what you're looking for..."
                        className="border-2 bg-white/80 dark:bg-white/5 backdrop-blur-md resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="flex items-center justify-between">
                      <span className="text-xs">Maximum 500 characters</span>
                      <span className="text-xs font-medium">
                        {bioValue.length}/500
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={creatingProfile}
                onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creatingProfile}
                className="bg-teal-600 dark:bg-teal-400 hover:bg-teal-700 dark:hover:bg-teal-300 text-white dark:text-gray-900">
                {creatingProfile ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    Create Profile
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
