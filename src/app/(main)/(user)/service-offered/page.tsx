// app/user-services/page.tsx
"use client";

import ServiceCard from "@/components/services/ServiceCard";
import { usePublicServices } from "@/hooks/services/service.hook";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ServiceList() {
  const router = useRouter();
  const { services, loading, error, refetch } = usePublicServices({
    page: 1,
    limit: 10,
  });

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // ============================================
  // UPDATED: Use ID for user/authenticated views
  // ============================================
  const handleView = (id: string) => {
    // User page: always use ID-based route for viewing own services
    router.push(`/services/d1/${id}`);
  };

  const handleEdit = (id: string) => {
    // Edit: use ID-based route
    router.push(`/services/${id}/edit`);
    // OR if your edit route is different:
    // router.push(`/services/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        // Call your delete API here
        console.log("Deleting service:", id);
        refetch();
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  const handleApprove = async (id: string) => {
    try {
      // Call your approve API here
      console.log("Approving service:", id);
      refetch();
    } catch (error) {
      console.error("Error approving service:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      // Call your reject API here
      console.log("Rejecting service:", id);
      refetch();
    } catch (error) {
      console.error("Error rejecting service:", error);
    }
  };

  const fallbackToClipboard = async (
    service: (typeof services)[0],
    url: string,
    priceText: string,
    tagsText: string
  ) => {
    // Create rich text for clipboard
    const shareText = `━━━━━━━━━━━━━━━━━━━━━
${service.title}
━━━━━━━━━━━━━━━━━━━━━

${service.description}

📂 Category: ${service.category?.catName || "General"}${priceText}${tagsText}

${
  service.coverImage?.url ? `📷 Image: ${service.coverImage.url}\n\n` : ""
}🔗 Link: ${url}
━━━━━━━━━━━━━━━━━━━━━`;

    try {
      await navigator.clipboard.writeText(shareText);
      alert("✓ Service details copied to clipboard!");
    } catch (clipboardError) {
      console.error("Error copying to clipboard:", clipboardError);
      // Final fallback: show a prompt with the text
      prompt("Copy this text:", shareText);
    }
  };

  // ============================================
  // UPDATED: Share still uses SLUG for public URLs
  // ============================================
  const handleShare = async (id: string) => {
    const service = services.find((s) => s._id === id);
    if (!service) return;

    // For sharing, use slug if available (public-facing URL)
    // This ensures shared links are SEO-friendly
    const url = service.slug
      ? `${window.location.origin}/services/${service.slug}`
      : `${window.location.origin}/services/d1/${id}`;

    // Format price if available
    const priceText = service.servicePricing
      ? `\nStarting at: ${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: service.servicePricing.currency || "USD",
        }).format(service.servicePricing.serviceBasePrice)}`
      : "";

    // Format tags if available
    const tagsText =
      service.tags && service.tags.length > 0
        ? `\nTags: ${service.tags.slice(0, 3).join(", ")}`
        : "";

    // Create a concise share text that combines everything
    const shareText = `${service.title}

${service.description}

Category: ${service.category?.catName || "General"}${priceText}${tagsText}

${url}`;

    const shareData = {
      title: service.title,
      text: shareText,
      url: url,
    };

    if (navigator.share) {
      try {
        // Try native share first
        await navigator.share(shareData);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error sharing:", error);
          // Fallback to clipboard
          await fallbackToClipboard(service, url, priceText, tagsText);
        }
      }
    } else {
      // Browser doesn't support Web Share API - use clipboard
      await fallbackToClipboard(service, url, priceText, tagsText);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
    // TODO: Persist to backend/localStorage
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading services...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Error: {error.message}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">No services found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-3 bg-white dark:bg-gray-950 h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Our Services
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse through our available services
        </p>
      </div>

      <ScrollArea className="flex flex-wrap items-start justify-start gap-4 p-2 h-[77vh] overflow-y-auto">
        {services.map((service) => (
          <ServiceCard
            key={service._id}
            service={service}
            variant="user"
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
            onShare={handleShare}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favoriteIds.includes(service._id)}
          />
        ))}
      </ScrollArea>
    </div>
  );
}

// ==========================================
// ROUTING SUMMARY
// ==========================================

/*
PUBLIC PAGE (/services):
✓ View: /services/{slug} (SEO-friendly)
✓ Share: /services/{slug} (SEO-friendly)

USER PAGE (/user-services):
✓ View: /services/d1/{id} (authenticated view)
✓ Edit: /services/{id}/edit (authenticated edit)
✓ Share: /services/{slug} (public sharing - still SEO-friendly)

This ensures:
- Public users see pretty URLs
- Authenticated users use IDs for direct access
- Shared links are always SEO-friendly regardless of where shared from
*/
