import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { idType } from "@/types/base.types";
import { useEffect, useState } from "react";
import { ProviderProfileFormData } from "./providerProfileSchema";
import { toast } from "sonner";
import { ProviderFileRecord } from "@/lib/api/file-manager/provider.file.manager";
import { useProviderIdImages } from "@/hooks/useProviderFileManager";

interface IdVerificationStepProps {
  form: UseFormReturn<ProviderProfileFormData>;
}

export function IdVerificationStep({ form }: IdVerificationStepProps) {
  const {
    uploadMultiple,
    uploading,
    files,
    error: uploadError,
    validateFiles,
    clearError,
  } = useProviderIdImages();

  const [localFiles, setLocalFiles] = useState<
    Array<{ id: string; name: string; url: string; file?: File }>
  >([]);

  // Sync uploaded files from hook to local state and form
  useEffect(() => {
    if (files.length > 0) {
      const mappedFiles = files.map((file: ProviderFileRecord) => ({
        id: file._id.toString(),
        name: file.fileName,
        url: file.url,
      }));

      setLocalFiles((prev) => {
        const tempFiles = prev.filter((f) => f.id.startsWith("temp-"));
        tempFiles.forEach((tempFile) => {
          if (tempFile.url.startsWith("blob:")) {
            URL.revokeObjectURL(tempFile.url);
          }
        });
        const existingRealFiles = prev.filter((f) => !f.id.startsWith("temp-"));
        const newFileIds = mappedFiles.map((f) => f.id);
        const keptExisting = existingRealFiles.filter(
          (f) => !newFileIds.includes(f.id),
        );
        return [...keptExisting, ...mappedFiles];
      });

      const fileIds = files.map((f: ProviderFileRecord) => f._id.toString());
      form.setValue("IdDetails.idImages", fileIds, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [files, form]);

  useEffect(() => {
    if (uploadError) {
      toast.error(uploadError);
      clearError();
    }
  }, [uploadError, clearError]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const filesArray = Array.from(selectedFiles);
    const validation = validateFiles(filesArray);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid files selected");
      e.target.value = "";
      return;
    }

    if (localFiles.length + filesArray.length > 2) {
      toast.error(
        `You can only upload up to 2 images. Current: ${localFiles.length}`,
      );
      e.target.value = "";
      return;
    }

    const previews = filesArray.map((file) => ({
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));

    setLocalFiles((prev) => [...prev, ...previews]);

    try {
      const uploadedFiles = await uploadMultiple(filesArray);
      toast.success(
        `Successfully uploaded ${uploadedFiles.length} ID image${uploadedFiles.length > 1 ? "s" : ""}`,
      );
    } catch (error) {
      const tempIds = previews.map((p) => p.id);
      setLocalFiles((prev) => prev.filter((f) => !tempIds.includes(f.id)));
      previews.forEach((preview) => {
        if (preview.url.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      });
      toast.error("Failed to upload images. Please try again.");
    }

    e.target.value = "";
  };

  const handleRemoveFile = (fileId: string) => {
    const fileToRemove = localFiles.find((f) => f.id === fileId);
    if (fileToRemove?.url.startsWith("blob:")) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    setLocalFiles((prev) => prev.filter((f) => f.id !== fileId));

    const currentIds = form.getValues("IdDetails.idImages") || [];
    const updatedIds = currentIds.filter((id) => id !== fileId);
    form.setValue("IdDetails.idImages", updatedIds, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    toast.info("ID image removed");
  };

  const hasReachedLimit = localFiles.length >= 2;
  const hasUploadedFiles =
    localFiles.filter((f) => !f.id.startsWith("temp-")).length > 0;

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 ring-1 ring-amber-100 dark:ring-amber-900">
          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            ID Verification
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verify your identity to build trust with customers
          </p>
        </div>
      </div>

      {/* Security note */}
      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 p-4">
        <div className="flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>Security Note:</strong> Your ID information is encrypted and
            only used for verification. Upload clear photos of both the front
            and back of your ID.
          </p>
        </div>
      </div>

      {/* ID Type + Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField
          control={form.control}
          name="IdDetails.idType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                ID Type <span className="text-rose-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100">
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={idType.NATIONAL_ID}>
                    National ID (Ghana Card)
                  </SelectItem>
                  <SelectItem value={idType.PASSPORT}>Passport</SelectItem>
                  <SelectItem value={idType.VOTERS_ID}>Voter's ID</SelectItem>
                  <SelectItem value={idType.DRIVERS_LICENSE}>
                    Driver's License
                  </SelectItem>
                  <SelectItem value={idType.NHIS}>NHIS Card</SelectItem>
                  <SelectItem value={idType.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="IdDetails.idNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                ID Number <span className="text-rose-500">*</span>
              </FormLabel>
              <FormControl>
                {/* FIX: Always pass a string value to prevent uncontrolled → controlled warning */}
                <Input
                  placeholder="Enter ID number"
                  {...field}
                  value={field.value ?? ""}
                  className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-amber-500/20 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </FormControl>
              <FormDescription className="text-xs text-slate-500">
                As shown on your ID document
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Image Upload */}
      <FormField
        control={form.control}
        name="IdDetails.idImages"
        render={() => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
              ID Images <span className="text-rose-500">*</span>
            </FormLabel>
            <FormControl>
              <div className="space-y-4">
                {/* Upload zone */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    hasReachedLimit
                      ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600 bg-white dark:bg-slate-900 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!hasReachedLimit && !uploading) {
                      document.getElementById("id-upload")?.click();
                    }
                  }}
                >
                  {hasReachedLimit ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Maximum images uploaded (2/2)
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Remove an image to replace it
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-900 flex items-center justify-center">
                        {uploading ? (
                          <Loader2 className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {uploading
                            ? "Uploading..."
                            : "Click to upload ID images"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          PNG, JPG or WebP — up to 5MB each
                        </p>
                      </div>
                      <div className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900">
                        {localFiles.length}/2 images uploaded
                      </div>
                    </div>
                  )}

                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading || hasReachedLimit}
                    className="hidden"
                    id="id-upload"
                  />
                </div>

                {/* Preview grid */}
                {localFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {localFiles.map((file, index) => {
                      const isUploading = file.id.startsWith("temp-");
                      return (
                        <div
                          key={file.id}
                          className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                        >
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-36 object-cover"
                          />

                          {/* Overlay */}
                          {!isUploading && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveFile(file.id)}
                                disabled={uploading}
                                className="rounded-lg"
                              >
                                <X className="w-3.5 h-3.5 mr-1.5" />
                                Remove
                              </Button>
                            </div>
                          )}

                          {/* File label */}
                          <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                              {index === 0 ? "📄 Front" : "📄 Back"} —{" "}
                              {file.name}
                            </p>
                            {isUploading ? (
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Uploading...
                              </p>
                            ) : (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Uploaded
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </FormControl>
            <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
              {localFiles.length === 0
                ? "Upload clear photos of both the front and back of your ID"
                : localFiles.length === 1
                  ? "Upload one more image (back side of ID)"
                  : hasUploadedFiles
                    ? "Both ID images uploaded successfully"
                    : "Uploading images..."}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Requirements */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
          Requirements
        </p>
        <ul className="space-y-1.5">
          {[
            "Maximum 2 images (front and back)",
            "File size up to 5MB per image",
            "Formats: JPG, JPEG, PNG, WebP",
            "Images must be clear and legible",
          ].map((req) => (
            <li
              key={req}
              className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2"
            >
              <div className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
              {req}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
