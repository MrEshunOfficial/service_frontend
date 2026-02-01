"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Store,
  ArrowRight,
  Briefcase,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export function ProviderProfileEmptyState() {
  const router = useRouter();

  const benefits = [
    {
      icon: Briefcase,
      title: "Manage Your Business",
      description: "Control your services, pricing, and availability",
    },
    {
      icon: Users,
      title: "Connect with Clients",
      description: "Reach customers looking for your services",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Revenue",
      description: "Track bookings and business performance",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-600 mb-2">
          <Store className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold">
            Start Your Provider Journey
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with customers who need your services. Set up your business
            and start growing today.
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => router.push("/provider/setup")}
          className="gap-2 mt-2">
          <Sparkles className="w-4 h-4" />
          Create Business Profile
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <Card
              key={index}
              className="border-2 hover:shadow-md transition-shadow">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA Card */}
      <Card className="bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2">
        <CardContent className="p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold">Ready to Get Started?</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Set up your business profile in under 5 minutes and start accepting
            bookings right away.
          </p>
          <Button
            onClick={() => router.push("/provider/setup")}
            className="gap-2">
            Setup business Profile Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
