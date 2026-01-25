// components/client/PreferredCategoriesDialog.tsx

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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { X, Search, Tags } from "lucide-react";
import { useActiveCategories } from "@/hooks/services/services.category.hook";

interface PreferredCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCategories: string[];
  onSave?: (data: {
    preferences: { preferredCategories: string[] };
  }) => Promise<void>;
}

export function PreferredCategoriesDialog({
  open,
  onOpenChange,
  currentCategories,
  onSave,
}: PreferredCategoriesDialogProps) {
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(currentCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: categories, loading: categoriesLoading } =
    useActiveCategories();

  useEffect(() => {
    setSelectedCategories(currentCategories);
  }, [currentCategories, open]);

  const filteredCategories =
    categories?.filter((cat) =>
      cat.catName.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const handleToggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName],
    );
  };

  const handleRemoveCategory = (categoryName: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c !== categoryName));
  };

  const handleSave = async () => {
    if (!onSave) return;

    setLoading(true);
    try {
      await onSave({
        preferences: { preferredCategories: selectedCategories },
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving categories:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Preferred Categories
          </DialogTitle>
          <DialogDescription>
            Select your favorite service categories for personalized
            recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Selected Categories */}
          {selectedCategories.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Selected ({selectedCategories.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <Badge key={category} variant="default" className="gap-1">
                    {category}
                    <button
                      onClick={() => handleRemoveCategory(category)}
                      className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Available Categories */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            {categoriesLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading categories...
              </div>
            ) : filteredCategories.length > 0 ? (
              <div className="space-y-2 py-2">
                {filteredCategories.map((category) => {
                  const isSelected = selectedCategories.includes(
                    category.catName,
                  );
                  return (
                    <div
                      key={category._id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => handleToggleCategory(category.catName)}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() =>
                          handleToggleCategory(category.catName)
                        }
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {category.catName}
                        </p>
                        {category.catDesc && (
                          <p className="text-xs text-muted-foreground">
                            {category.catDesc}
                          </p>
                        )}
                      </div>
                      {/* {category.serviceCount !== undefined && (
                        <Badge variant="secondary">
                          {category.serviceCount} services
                        </Badge>
                      )} */}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery
                  ? "No categories found"
                  : "No categories available"}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Preferences"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
