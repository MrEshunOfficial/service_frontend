"use client";

import React from "react";
import { useSearchParams, useParams } from "next/navigation";

export default function ProviderDetailsPage() {
  const { providerId } = useParams();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service");

  // Example: your hook could be:
  // const { data, loading, error } = useProviderById(providerId as string, serviceId);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Provider Details</h1>

      <div className="mt-4">
        <p>
          <strong>Provider ID:</strong> {providerId}
        </p>
        <p>
          <strong>Selected Service:</strong> {serviceId}
        </p>
      </div>

      {/* Render provider details here */}
    </div>
  );
}
