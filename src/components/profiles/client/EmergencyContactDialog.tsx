// components/client/EmergencyContactDialog.tsx

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
import { AlertCircle, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmergencyContact } from "@/types/profiles/client.profile.types";

interface EmergencyContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentContact?: EmergencyContact;
  onSave?: (data: EmergencyContact) => Promise<void>;
}

export function EmergencyContactDialog({
  open,
  onOpenChange,
  currentContact,
  onSave,
}: EmergencyContactDialogProps) {
  const [formData, setFormData] = useState<EmergencyContact>({
    name: "",
    relationship: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    relationship?: string;
    phoneNumber?: string;
  }>({});

  useEffect(() => {
    if (currentContact) {
      setFormData(currentContact);
    } else {
      setFormData({
        name: "",
        relationship: "",
        phoneNumber: "",
      });
    }
    setErrors({});
  }, [currentContact, open]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.relationship.trim()) {
      newErrors.relationship = "Relationship is required";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !onSave) return;

    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error: any) {
      setErrors({ name: error.message || "Failed to save emergency contact" });
    } finally {
      setLoading(false);
    }
  };

  const relationshipOptions = [
    "Parent",
    "Spouse",
    "Sibling",
    "Child",
    "Friend",
    "Relative",
    "Guardian",
    "Partner",
    "Other",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {currentContact ? "Update" : "Add"} Emergency Contact
          </DialogTitle>
          <DialogDescription>
            Add a trusted person we can contact in case of an emergency
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter contact's full name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              onBlur={validateForm}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Select
              value={formData.relationship}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, relationship: value }))
              }>
              <SelectTrigger id="relationship">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {relationshipOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.relationship && (
              <p className="text-xs text-destructive">{errors.relationship}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phoneNumber"
                placeholder="+233 XX XXX XXXX"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                onBlur={validateForm}
                className="pl-9"
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-xs text-destructive">{errors.phoneNumber}</p>
            )}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              This contact will only be reached in case of an emergency during
              service delivery. Please ensure they are aware and consent to
              being listed.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              loading ||
              !formData.name.trim() ||
              !formData.relationship.trim() ||
              !formData.phoneNumber.trim()
            }>
            {loading
              ? "Saving..."
              : currentContact
              ? "Update Contact"
              : "Add Contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
