"use client";

import { useParams } from "next/navigation";
import ServiceForm from "@/components/services/categories/form/service.form";
import { useServiceById } from "@/hooks/services/service.hook";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Home, Briefcase, Loader2, AlertCircle } from "lucide-react";

export default function EditServicePage() {
  const params = useParams();
  const serviceId = params.id as string;

  const { data: service, loading, error } = useServiceById(serviceId);

  if (loading) {
    return (
      <div className="flex flex-col h-[88vh]">
        <div className="shrink-0 w-full border-b bg-white dark:bg-gray-950 backdrop-blur-3xl z-50">
          <div className="p-3">
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
                    href="/service-offered"
                    className="flex items-center gap-2 text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors">
                    <Briefcase className="w-4 h-4" />
                    Services
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-900 dark:text-white font-medium">
                    Edit Service
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading service...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex flex-col h-[88vh]">
        <div className="shrink-0 w-full border-b bg-white dark:bg-gray-950 backdrop-blur-3xl z-50">
          <div className="p-3">
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
                    href="/service-offered"
                    className="flex items-center gap-2 text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors">
                    <Briefcase className="w-4 h-4" />
                    Services
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-900 dark:text-white font-medium">
                    Edit Service
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Service Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The service you're trying to edit could not be found or you don't
              have permission to edit it.
            </p>
            <a
              href="/service-offered"
              className="inline-flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              <Briefcase className="w-4 h-4" />
              Back to Services
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[88vh]">
      {/* Fixed Breadcrumb Header */}
      <div className="shrink-0 w-full border-b bg-white dark:bg-gray-950 backdrop-blur-3xl z-50">
        <div className="p-3">
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
                  href="/service-offered"
                  className="flex items-center gap-2 text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors">
                  <Briefcase className="w-4 h-4" />
                  Services
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/services/${service.slug}`}
                  className="text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors">
                  {service.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-900 dark:text-white font-medium">
                  Edit
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full max-w-3xl mx-auto p-4">
          <ServiceForm mode="edit" service={service} />
        </div>
      </div>
    </div>
  );
}
