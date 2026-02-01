import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, Shield } from "lucide-react";

export function ClientProfileEmptyState() {
  const router = useRouter();

  return (
    <div className="w-full h-[80vh] max-w-5xl mx-auto p-4 flex flex-col items-center justify-center">
      {/* Icon & Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Complete Your Client Profile
        </h2>

        <p className="text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
          Your basic account is ready! Let's set up your client profile to
          unlock personalized services and connect with top providers.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-white/10 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Verified Access
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get verified status and access premium service providers
          </p>
        </div>

        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-white/10 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Quick Setup
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Takes only 2-3 minutes to complete your profile
          </p>
        </div>

        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-white/10 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Secure & Private
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your information is encrypted and protected
          </p>
        </div>
      </div>

      {/* Steps Preview */}
      <div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-800/50">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-500 dark:bg-blue-400 text-white text-xs rounded-full flex items-center justify-center">
            ✓
          </span>
          What's Next?
        </h3>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 shrink-0 mt-0.5 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
            </div>
            <span>Add your preferred location and contact details</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 shrink-0 mt-0.5 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
            </div>
            <span>Set your service preferences and budget range</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 shrink-0 mt-0.5 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
            </div>
            <span>Start browsing and booking services instantly</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Button
          size="lg"
          className="w-full sm:w-auto bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8"
          onClick={() => router.push("/client/setup")}
        >
          Complete Client Profile
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="w-full sm:w-auto border-2"
          onClick={() => router.push("/services")}
        >
          Explore Services
        </Button>
      </div>

      {/* Help Text */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
        Need help? Contact our support team at{" "}
        <a
          href="mailto:errandsupport@gmail.com"
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          errandsupport@gmail.com
        </a>
      </p>
    </div>
  );
}
