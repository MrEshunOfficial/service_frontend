// app/(provider)/provider/edit/page.tsx
"use client";

import { ProviderProfileFormData } from "@/components/profiles/provider/form/form.schema";
import ProviderProfileForm from "@/components/profiles/provider/form/form.wrapper";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Home, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditProviderProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [providerData, setProviderData] =
    useState<Partial<ProviderProfileFormData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) {
      setError("Provider ID is required");
      setLoading(false);
      return;
    }

    // Fetch existing provider data
    const fetchProviderData = async () => {
      try {
        const response = await fetch(`/api/provider/${providerId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch provider data");
        }

        const data = await response.json();
        setProviderData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load provider data"
        );
        toast.error("Failed to load provider data");
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [providerId]);

  const handleSubmitSuccess = () => {
    toast.success("Provider profile updated successfully!");
    router.push("/provider");
  };

  const handleSubmitError = (error: Error) => {
    toast.error(error.message || "Failed to update provider profile");
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !providerData || !providerId) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error || "Provider not found"}</p>
        <button
          onClick={() => router.push("/provider")}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto w-full p-3 mb-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="flex items-center gap-2 text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors">
                <Home className="w-4 h-4" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/provider"
                className="text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors">
                provider
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-900 dark:text-white font-medium">
                edit business profile
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <section className="flex-1 pb-8">
        <ProviderProfileForm
          mode="edit"
          providerId={providerId}
          existingData={providerData}
          onSubmitSuccess={handleSubmitSuccess}
          onSubmitError={handleSubmitError}
        />
      </section>
    </div>
  );
}
