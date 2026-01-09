// components/client/IdDetailsDialog.tsx

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IdDetails, idType } from "@/types/base.types";

interface IdDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentIdDetails?: IdDetails;
  onSave?: (data: { idType: idType; idNumber: string }) => Promise<void>;
}

export function IdDetailsDialog({
  open,
  onOpenChange,
  currentIdDetails,
  onSave,
}: IdDetailsDialogProps) {
  const [formData, setFormData] = useState<{
    idType: idType;
    idNumber: string;
  }>({
    idType: idType.NATIONAL_ID,
    idNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentIdDetails) {
      setFormData({
        idType: currentIdDetails.idType,
        idNumber: currentIdDetails.idNumber,
      });
    } else {
      setFormData({
        idType: idType.NATIONAL_ID,
        idNumber: "",
      });
    }
    setError("");
  }, [currentIdDetails, open]);

  const validateIdNumber = () => {
    if (!formData.idNumber.trim()) {
      setError("ID number is required");
      return false;
    }

    // Basic validation based on ID type
    switch (formData.idType) {
      case idType.NATIONAL_ID:
        if (formData.idNumber.length < 10) {
          setError("National ID should be at least 10 characters");
          return false;
        }
        break;
      case idType.PASSPORT:
        if (formData.idNumber.length < 6) {
          setError("Passport number should be at least 6 characters");
          return false;
        }
        break;
      case idType.VOTERS_ID:
        if (formData.idNumber.length < 10) {
          setError("Voter's ID should be at least 10 characters");
          return false;
        }
        break;
      case idType.DRIVERS_LICENSE:
        if (formData.idNumber.length < 8) {
          setError("Driver's license should be at least 8 characters");
          return false;
        }
        break;
    }

    setError("");
    return true;
  };

  const handleSave = async () => {
    if (!validateIdNumber() || !onSave) return;

    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || "Failed to update ID details");
    } finally {
      setLoading(false);
    }
  };

  const idTypeOptions = [
    { value: idType.NATIONAL_ID, label: "National ID (Ghana Card)" },
    { value: idType.PASSPORT, label: "Passport" },
    { value: idType.VOTERS_ID, label: "Voter's ID" },
    { value: idType.DRIVERS_LICENSE, label: "Driver's License" },
    { value: idType.NHIS, label: "NHIS Card" },
    { value: idType.OTHER, label: "Other" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {currentIdDetails ? "Update" : "Add"} ID Details
          </DialogTitle>
          <DialogDescription>
            Provide your identification details for verification purposes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="idType">ID Type</Label>
            <Select
              value={formData.idType}
              onValueChange={(value: idType) =>
                setFormData((prev) => ({ ...prev, idType: value }))
              }>
              <SelectTrigger id="idType">
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                {idTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              id="idNumber"
              placeholder="Enter your ID number"
              value={formData.idNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  idNumber: e.target.value.toUpperCase(),
                }))
              }
              onBlur={validateIdNumber}
            />
            <p className="text-xs text-muted-foreground">
              Enter your {formData.idType.replace("_", " ")} number exactly as
              it appears on your document
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Your ID information is encrypted and will only be used for
              verification purposes. We take your privacy seriously.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !formData.idNumber.trim()}>
            {loading ? "Saving..." : currentIdDetails ? "Update" : "Add"} ID
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
