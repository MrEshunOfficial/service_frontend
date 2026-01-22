import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";
import { PopulatedProviderProfile } from "@/types/profiles/provider-profile.types";
import Image from "next/image";

interface ProviderGalleryProps {
  profile: PopulatedProviderProfile;
}

export const ProviderGallery: React.FC<ProviderGalleryProps> = ({
  profile,
}) => {
  return (
    <Card className="border border-slate-300 dark:border-slate-600 bg-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-900 dark:text-slate-100">
              Business Gallery
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Showcase your work and services
            </CardDescription>
          </div>
          <Button size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload Images
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {profile.BusinessGalleryImages &&
        profile.BusinessGalleryImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.BusinessGalleryImages.map((img, idx) => {
              if (typeof img === "string") return null;

              return (
                <div
                  key={idx}
                  className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer aspect-square"
                >
                  <Image
                    src={img.thumbnailUrl || img.url}
                    alt={`Gallery ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300 z-50"
                  />

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No Gallery Images
            </h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Upload images to showcase your work
            </p>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Images
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
