// components/client/PaymentMethodDialog.tsx

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SavedPaymentMethod } from "@/types/profiles/client.profile.types";

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMethods: SavedPaymentMethod[];
  onSave?: (data: {
    savedPaymentMethods: SavedPaymentMethod[];
  }) => Promise<void>;
}

export function PaymentMethodDialog({
  open,
  onOpenChange,
  currentMethods,
  onSave,
}: PaymentMethodDialogProps) {
  const [methods, setMethods] = useState<SavedPaymentMethod[]>(currentMethods);
  const [newMethod, setNewMethod] = useState<Partial<SavedPaymentMethod>>({
    type: "mobile_money",
    provider: "",
    label: "",
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);

  const handleAddMethod = () => {
    if (!newMethod.type || !newMethod.label) return;

    const methodToAdd: SavedPaymentMethod = {
      type: newMethod.type as any,
      provider: newMethod.provider || "",
      label: newMethod.label,
      isDefault: newMethod.isDefault || false,
    };

    // If setting as default, unset others
    if (methodToAdd.isDefault) {
      setMethods((prev) => prev.map((m) => ({ ...m, isDefault: false })));
    }

    setMethods((prev) => [...prev, methodToAdd]);
    setNewMethod({
      type: "mobile_money",
      provider: "",
      label: "",
      isDefault: false,
    });
  };

  const handleRemoveMethod = (index: number) => {
    setMethods((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetDefault = (index: number) => {
    setMethods((prev) =>
      prev.map((method, i) => ({
        ...method,
        isDefault: i === index,
      }))
    );
  };

  const handleSave = async () => {
    if (!onSave) return;

    setLoading(true);
    try {
      await onSave({ savedPaymentMethods: methods });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Manage Payment Methods
          </DialogTitle>
          <DialogDescription>
            Add, edit, or remove your payment methods
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Current Methods */}
            {methods.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Saved Methods</h4>
                {methods.map((method, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 flex-1">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{method.label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {method.type.replace("_", " ").toUpperCase()}
                          </p>
                          {method.provider && (
                            <>
                              <span className="text-xs text-muted-foreground">
                                •
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {method.provider}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault ? (
                        <span className="text-xs font-medium text-primary">
                          Default
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(index)}>
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveMethod(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            {/* Add New Method */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Add New Method</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Payment Type</Label>
                  <Select
                    value={newMethod.type}
                    onValueChange={(value: any) =>
                      setNewMethod((prev) => ({ ...prev, type: value }))
                    }>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_account">Bank Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider">Provider (Optional)</Label>
                  <Input
                    id="provider"
                    placeholder="e.g., MTN, Vodafone"
                    value={newMethod.provider || ""}
                    onChange={(e) =>
                      setNewMethod((prev) => ({
                        ...prev,
                        provider: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  placeholder="e.g., Personal MTN Mobile Money"
                  value={newMethod.label || ""}
                  onChange={(e) =>
                    setNewMethod((prev) => ({
                      ...prev,
                      label: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="default"
                  checked={newMethod.isDefault}
                  onCheckedChange={(checked) =>
                    setNewMethod((prev) => ({
                      ...prev,
                      isDefault: checked as boolean,
                    }))
                  }
                />
                <Label
                  htmlFor="default"
                  className="text-sm font-normal cursor-pointer">
                  Set as default payment method
                </Label>
              </div>

              <Button
                onClick={handleAddMethod}
                variant="outline"
                className="w-full"
                disabled={!newMethod.type || !newMethod.label}>
                Add Payment Method
              </Button>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
