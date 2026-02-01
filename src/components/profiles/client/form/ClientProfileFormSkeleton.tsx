import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ClientProfileFormSkeleton() {
  return (
    <div className="space-y-8">
      {/* Progress Indicator Skeleton */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex-1 flex flex-col items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Form Content Skeleton */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid gap-6">
          {[1, 2, 3].map((field) => (
            <div key={field} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-64" />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Skeleton */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Skeleton className="h-10 w-24" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSuccessSkeleton() {
  return (
    <Card className="max-w-md w-full">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="mx-auto">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-64 mx-auto" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
