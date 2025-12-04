"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import {
  useCompleteService,
  useServiceById,
} from "@/hooks/services/service.hook";
import { Home, Shield, Briefcase, ToolCase } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";

export default function page() {
  const params = useParams();
  const serviceId = params.id as string;
  const {
    data: service,
    loading,
    error,
    refetch,
  } = useServiceById(serviceId as string);

  // loading state
  if (loading) {
    <LoadingOverlay message="just a sec ... " show={true} />;
  }

  // no service state
  if (!service) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center p-8">
          <p className="text-red-300 dark:text-red-100 mb-4 text-lg">
            Service not found!
          </p>
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md"
            onClick={refetch}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // error state
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center p-8">
          <p className="text-red-600 dark:text-red-400 mb-4 text-lg">
            Failed to load service details.
          </p>
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md"
            onClick={refetch}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  console.log(service);

  return (
    <main className="h-full flex flex-col space-y-2">
      {/* Breadcrumb */}
      <div className="w-full p-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="flex items-center gap-2 text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/services"
                className="flex items-center gap-2 text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors"
              >
                <ToolCase className="w-4 h-4" />
                Service
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-900 dark:text-white font-medium">
                {service.slug}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <section className="w-full flex-1 p-2">{service.title}</section>
    </main>
  );
}
