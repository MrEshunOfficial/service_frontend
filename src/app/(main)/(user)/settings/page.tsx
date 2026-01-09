"use client";
import React, { useState, useEffect } from "react";
import {
  Bell,
  Globe,
  Heart,
  Mail,
  MessageSquare,
  Smartphone,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useClientProfile } from "@/hooks/profiles/useClientProfile";
import { useActiveCategories } from "@/hooks/services/services.category.hook";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "tw", label: "Twi" },
  { code: "ga", label: "Ga" },
  { code: "ewe", label: "Ewe" },
  { code: "dag", label: "Dagbani" },
];

type SaveStatus = "idle" | "success" | "error";

export default function ClientPreferencesPage() {
  const {
    profile,
    loading: profileLoading,
    error,
    updateProfile,
    updateCommunicationPreferences,
  } = useClientProfile();

  const { data: categories, loading: categoriesLoading } =
    useActiveCategories();

  const [formData, setFormData] = useState({
    communicationPreferences: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
    languagePreference: "en",
    preferredCategories: [] as string[],
  });

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update form data when profile loads
  useEffect(() => {
    if (profile?.preferences) {
      setFormData({
        communicationPreferences: profile.preferences
          .communicationPreferences || {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
        },
        languagePreference: profile.preferences.languagePreference || "en",
        preferredCategories: profile.preferences.preferredCategories || [],
      });
    }
  }, [profile]);

  // Handle communication preference toggle
  const handleCommPrefChange = (
    key: keyof typeof formData.communicationPreferences
  ) => {
    setFormData((prev) => ({
      ...prev,
      communicationPreferences: {
        ...prev.communicationPreferences,
        [key]: !prev.communicationPreferences[key],
      },
    }));
    setHasChanges(true);
  };

  // Handle language change
  const handleLanguageChange = (e: { target: { value: any } }) => {
    setFormData((prev) => ({
      ...prev,
      languagePreference: e.target.value,
    }));
    setHasChanges(true);
  };

  // Handle category toggle
  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => {
      const isSelected = prev.preferredCategories.includes(categoryId);
      return {
        ...prev,
        preferredCategories: isSelected
          ? prev.preferredCategories.filter((id) => id !== categoryId)
          : [...prev.preferredCategories, categoryId],
      };
    });
    setHasChanges(true);
  };

  // Save all preferences
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      // Update communication preferences
      await updateCommunicationPreferences(formData.communicationPreferences);

      // Update other preferences
      await updateProfile({
        preferences: {
          languagePreference: formData.languagePreference,
          preferredCategories: formData.preferredCategories,
        },
      });

      setSaveStatus("success");
      setHasChanges(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  if (profileLoading && !profile) {
    return (
      <main className="w-full h-full flex flex-col items-center justify-center gap-2 relative">
        <div className="absolute inset-0 opacity-25 dark:opacity-35 pointer-events-none">
          <div className="w-full h-full bg-linear-to-br from-red-100 via-pink-50 to-blue-100 dark:from-red-950 dark:via-pink-950 dark:to-blue-950 blur-3xl"></div>
        </div>
        <div className="flex flex-col items-center gap-3 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading preferences...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full h-full flex flex-col items-center justify-center gap-2 relative">
        <div className="absolute inset-0 opacity-25 dark:opacity-35 pointer-events-none">
          <div className="w-full h-full bg-linear-to-br from-red-100 via-pink-50 to-blue-100 dark:from-red-950 dark:via-pink-950 dark:to-blue-950 blur-3xl"></div>
        </div>
        <div className="flex flex-col items-center gap-3 z-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Error Loading Preferences
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {error.message || "Unable to load your preferences"}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full h-full flex flex-col items-center justify-center gap-2 relative">
      <div className="absolute inset-0 opacity-25 dark:opacity-35 pointer-events-none">
        <div className="w-full h-full bg-linear-to-br from-red-100 via-pink-50 to-blue-100 dark:from-red-950 dark:via-pink-950 dark:to-blue-950 blur-3xl"></div>
      </div>

      <header className="w-full flex flex-col items-start justify-center border-b-4 p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          Preferences
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Customize your experience and manage your preferences
        </p>
      </header>

      <section className="w-full flex-1 flex items-center justify-center p-4 overflow-hidden z-10">
        <div className="w-full max-w-2xl max-h-[75vh] overflow-y-auto hide-scrollbar space-y-6">
          {/* Communication Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Communication Preferences
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose how you want to receive notifications
            </p>

            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Email Notifications
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCommPrefChange("emailNotifications")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.communicationPreferences.emailNotifications
                      ? "bg-blue-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.communicationPreferences.emailNotifications
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      SMS Notifications
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Receive updates via text message
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCommPrefChange("smsNotifications")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.communicationPreferences.smsNotifications
                      ? "bg-blue-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.communicationPreferences.smsNotifications
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Push Notifications
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Receive updates on your device
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCommPrefChange("pushNotifications")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.communicationPreferences.pushNotifications
                      ? "bg-blue-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.communicationPreferences.pushNotifications
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Language Preference */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Language
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose your preferred language
            </p>

            <select
              value={formData.languagePreference}
              onChange={handleLanguageChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Preferred Service Categories
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select the services you're most interested in
            </p>

            {categoriesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => {
                  const isSelected = formData.preferredCategories.includes(
                    category._id
                  );
                  return (
                    <button
                      key={category._id}
                      onClick={() => handleCategoryToggle(category._id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}>
                      {category.catCoverId?.thumbnailUrl && (
                        <img
                          src={category.catCoverId.thumbnailUrl}
                          alt={category.catName}
                          className="w-6 h-6 object-cover rounded"
                        />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          isSelected
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300"
                        }`}>
                        {category.catName}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No categories available
              </p>
            )}
          </div>

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSaveAll}
              disabled={!hasChanges || isSaving}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                !hasChanges || isSaving
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
              }`}>
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveStatus === "success" ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Saved Successfully!</span>
                </>
              ) : saveStatus === "error" ? (
                <>
                  <XCircle className="w-5 h-5" />
                  <span>Save Failed - Try Again</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
