// app/profile/create/page.tsx
import CreateProfileForm from "@/components/profiles/user.profile/user.profile.form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import React from "react";

export default function CreateProfilePage() {
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-50 to-gray-100 dark:from-slate-900 dark:to-slate-950">
      {/* Breadcrumb - Fixed positioning with backdrop */}
      <div className="w-full p-3">
        <div className="max-w-7xl mx-auto">
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
                  href="/profile"
                  className="text-gray-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-teal-400 transition-colors">
                  Profile
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-500 dark:text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-900 dark:text-white font-medium">
                  Create Profile
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content with Background */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-[url('/errand-logo.jpg')] bg-cover bg-center bg-no-repeat opacity-5 dark:opacity-[0.03]"
          aria-hidden="true"
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent dark:from-black/30 dark:to-transparent"
          aria-hidden="true"
        />

        {/* Content Layer */}
        <div className="relative h-full overflow-auto hide-scrollbar flex items-center justify-center p-4">
          <CreateProfileForm />
        </div>
      </div>
    </div>
  );
}
