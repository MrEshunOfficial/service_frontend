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
import { Shield, Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { idType } from "@/types/base.types";
import { useEffect, useState } from "react";
import { ProviderProfileFormData } from "./providerProfileSchema";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
        // Find and clean up temp files that are being replaced
        const tempFiles = prev.filter((f) => f.id.startsWith("temp-"));
        tempFiles.forEach((tempFile) => {
          if (tempFile.url.startsWith("blob:")) {
            URL.revokeObjectURL(tempFile.url);
          }
        });

        // Keep only real uploaded files (non-temp)
        const existingRealFiles = prev.filter((f) => !f.id.startsWith("temp-"));

        // Get IDs of newly uploaded files
        const newFileIds = mappedFiles.map((f) => f.id);

        // Keep existing real files that aren't being replaced
        const keptExisting = existingRealFiles.filter(
          (f) => !newFileIds.includes(f.id),
        );

        // Combine kept existing with new uploads
        return [...keptExisting, ...mappedFiles];
      });

      // Update form with file IDs
      const fileIds = files.map((f: ProviderFileRecord) => f._id.toString());
      form.setValue("IdDetails.idImages", fileIds, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [files, form]);

  // Clear upload error after showing toast
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

    // Validate files before upload
    const validation = validateFiles(filesArray);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid files selected");
      e.target.value = "";
      return;
    }

    // Check if adding these files would exceed the limit
    if (localFiles.length + filesArray.length > 2) {
      toast.error(
        `You can only upload up to 2 images. Current: ${localFiles.length}`,
      );
      e.target.value = "";
      return;
    }

    // Show preview immediately with local URLs
    const previews = filesArray.map((file) => ({
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));

    setLocalFiles((prev) => [...prev, ...previews]);

    try {
      // Upload to server
      const uploadedFiles = await uploadMultiple(filesArray);

      toast.success(
        `Successfully uploaded ${uploadedFiles.length} ID image${uploadedFiles.length > 1 ? "s" : ""}`,
      );

      // Note: We DON'T remove temp files here - the useEffect will handle replacing them
      // with real uploaded files when the 'files' prop updates
    } catch (error) {
      console.error("Upload failed:", error);

      // Remove failed uploads from preview
      const tempIds = previews.map((p) => p.id);
      setLocalFiles((prev) => prev.filter((f) => !tempIds.includes(f.id)));

      // Clean up preview URLs
      previews.forEach((preview) => {
        if (preview.url.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      });

      toast.error("Failed to upload images. Please try again.");
    }

    // Reset input
    e.target.value = "";
  };

  const handleRemoveFile = (fileId: string) => {
    // Remove from local state
    const fileToRemove = localFiles.find((f) => f.id === fileId);
    if (fileToRemove?.url.startsWith("blob:")) {
      URL.revokeObjectURL(fileToRemove.url);
    }

    setLocalFiles((prev) => prev.filter((f) => f.id !== fileId));

    // Update form values
    const currentIds = form.getValues("IdDetails.idImages") || [];
    const updatedIds = currentIds.filter((id) => id !== fileId);
    form.setValue("IdDetails.idImages", updatedIds, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // Note: Actual deletion from server would happen on form submit or separately
    toast.info("ID image removed from upload queue");
  };

  const canUploadMore = localFiles.length < 2;
  const hasReachedLimit = localFiles.length >= 2;
  const hasUploadedFiles =
    localFiles.filter((f) => !f.id.startsWith("temp-")).length > 0;

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-blue-600 pl-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          ID Verification
        </h2>
        <p className="text-slate-600 mt-1">
          Verify your identity to build trust with customers
        </p>
      </div>

      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-900">
          <strong>Security Note:</strong> Your ID information is encrypted and
          only used for verification purposes. Upload clear photos of both the
          front and back of your ID.
        </AlertDescription>
      </Alert>

      {/* Validation Info */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 text-sm">
          <strong>Requirements:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Maximum 2 images (front and back)</li>
            <li>File size: Up to 5MB per image</li>
            <li>Formats: JPG, JPEG, PNG, WebP</li>
            <li>Images should be clear and legible</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="IdDetails.idType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                ID Type <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12">
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
              <FormLabel>
                ID Number <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter ID number"
                  {...field}
                  className="h-12"
                />
              </FormControl>
              <FormDescription>As shown on your ID</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="IdDetails.idImages"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              ID Images <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <div className="space-y-4">
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    hasReachedLimit
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-300 hover:border-blue-400 bg-white"
                  }`}
                >
                  <Upload
                    className={`w-12 h-12 mx-auto mb-4 ${
                      hasReachedLimit ? "text-gray-300" : "text-gray-400"
                    }`}
                  />

                  {hasReachedLimit ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <p className="text-sm font-medium">
                          Maximum files uploaded (2/2)
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Remove an image to upload a different one
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Upload front and back of your ID (PNG, JPG up to 5MB)
                      </p>
                      <p className="text-xs text-blue-600 font-medium mb-4">
                        {localFiles.length}/2 images uploaded
                      </p>
                    </>
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

                  <Button
                    type="button"
                    variant={hasReachedLimit ? "secondary" : "outline"}
                    onClick={() =>
                      document.getElementById("id-upload")?.click()
                    }
                    disabled={uploading || hasReachedLimit}
                    className="min-w-[140px]"
                  >
                    {uploading
                      ? "Uploading..."
                      : hasReachedLimit
                        ? "Limit Reached"
                        : "Select Files"}
                  </Button>
                </div>

                {/* Uploaded Files Preview */}
                {localFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {localFiles.map((file, index) => {
                      const isUploading = file.id.startsWith("temp-");
                      return (
                        <div
                          key={file.id}
                          className="relative group border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-32 object-cover"
                          />

                          {/* Overlay on hover */}
                          {!isUploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveFile(file.id)}
                                disabled={uploading}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          )}

                          {/* File info */}
                          <div className="p-2 bg-white border-t">
                            <p className="text-xs font-medium text-gray-700 truncate">
                              {index === 0 ? "Front" : "Back"} - {file.name}
                            </p>
                            {isUploading && (
                              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                <span className="inline-block w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
                                Uploading...
                              </p>
                            )}
                            {!isUploading && (
                              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
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
            <FormDescription>
              {localFiles.length === 0
                ? "Upload clear photos of both sides of your ID"
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

      {/* Upload Status */}
      {uploading && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600 animate-pulse" />
          <AlertDescription className="text-blue-900">
            Uploading ID images... Please wait.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
