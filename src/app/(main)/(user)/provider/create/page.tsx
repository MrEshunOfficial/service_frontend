// app/(provider)/provider/create/page.tsx
"use client";

import { ProviderProfileForm } from "@/components/profiles/provider/form/form.wrapper";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // or your toast library

export default function CreateProviderProfilePage() {
  const router = useRouter();

  const handleSubmitSuccess = () => {
    toast.success("Provider profile created successfully!");
    router.push("/profile");
  };

  const handleSubmitError = (error: Error) => {
    toast.error(error.message || "Failed to create provider profile");
  };

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
                create business profile
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <section className="flex-1 pb-4 overflow-hidden">
        <ProviderProfileForm
          mode="create"
          onSubmitSuccess={handleSubmitSuccess}
          onSubmitError={handleSubmitError}
        />
      </section>
    </div>
  );
}
