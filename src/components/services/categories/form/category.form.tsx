import { useState } from "react";
import {
  Loader2,
  Tag,
  X,
  Plus,
  FolderTree,
  ChevronDown,
  Search,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface CategoryFormData {
  catName: string;
  catDesc: string;
  tags?: string[];
  parentCategoryId?: string;
}

interface CategoryOption {
  _id: string;
  catName: string;
  slug: string;
  parentCategoryId?: string;
}

interface CategoryFormProps {
  initialData?: CategoryFormData;
  availableTags?: string[];
  availableCategories?: CategoryOption[];
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  currentCategoryId?: string;
}

export default function CategoryForm({
  initialData = {
    catName: "",
    catDesc: "",
    tags: [],
    parentCategoryId: undefined,
  },
  availableTags = [],
  availableCategories = [],
  onSubmit,
  onCancel,
  submitLabel = "Submit",
  isLoading = false,
  currentCategoryId,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>(initialData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CategoryFormData, string>>
  >({});
  const [newTag, setNewTag] = useState("");
  const [searchTag, setSearchTag] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Combine available tags with form tags to show all
  const allTags = Array.from(
    new Set([...availableTags, ...(formData.tags || [])])
  );

  // Filter tags based on search
  const filteredTags = allTags.filter((tag) =>
    tag.toLowerCase().includes(searchTag.toLowerCase())
  );

  // Filter out current category and its descendants from parent options
  const validParentCategories = availableCategories.filter(
    (cat) => cat._id !== currentCategoryId
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CategoryFormData, string>> = {};

    if (!formData.catName.trim()) {
      newErrors.catName = "Category name is required";
    } else if (formData.catName.trim().length < 2) {
      newErrors.catName = "Category name must be at least 2 characters";
    }

    if (!formData.catDesc.trim()) {
      newErrors.catDesc = "Description is required";
    } else if (formData.catDesc.trim().length < 10) {
      newErrors.catDesc = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      toast.success("category created successfully");
    } catch (error) {
      toast.error("error creating categories, please try again");
    }
  };

  const handleToggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...(prev.tags || []), tag],
    }));
  };

  const handleAddNewTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !allTags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), trimmedTag],
      }));
      setNewTag("");
      setSearchTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleParentChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      parentCategoryId: value === "" ? undefined : value,
    }));
  };

  return (
    <div className="space-y-5">
      {/* Category Name */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Category Name *
        </label>
        <input
          type="text"
          value={formData.catName}
          onChange={(e) => handleInputChange("catName", e.target.value)}
          className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:outline-none transition-all ${
            errors.catName
              ? "border-red-500 dark:border-red-400 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
          }`}
          placeholder="Enter category name"
          disabled={isLoading}
        />
        {errors.catName && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {errors.catName}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Description *
        </label>
        <textarea
          value={formData.catDesc}
          onChange={(e) => handleInputChange("catDesc", e.target.value)}
          className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:outline-none transition-all resize-none ${
            errors.catDesc
              ? "border-red-500 dark:border-red-400 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
          }`}
          placeholder="Enter category description"
          rows={4}
          disabled={isLoading}
        />
        {errors.catDesc && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {errors.catDesc}
          </p>
        )}
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {formData.catDesc.length} characters
        </p>
      </div>

      {/* Parent Category */}
      {validParentCategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Parent Category (Optional)
          </label>
          <div className="relative">
            <FolderTree className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <select
              value={formData.parentCategoryId || ""}
              onChange={(e) => handleParentChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all appearance-none cursor-pointer"
              disabled={isLoading}
            >
              <option value="">None (Top Level Category)</option>
              {validParentCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.catName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
          </div>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Make this a subcategory of another category
          </p>
        </div>
      )}

      {/* Tags - Shadcn Popover */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Tags
          {formData.tags && formData.tags.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
              ({formData.tags.length} selected)
            </span>
          )}
        </label>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              onClick={() => !isLoading && setPopoverOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  !isLoading && setPopoverOpen(true);
                }
              }}
              className={`min-h-[44px] w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 transition-all ${
                popoverOpen
                  ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 dark:ring-blue-400"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              } ${
                isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <div className="flex flex-wrap gap-2">
                {formData.tags && formData.tags.length > 0 ? (
                  <>
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTag(tag);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveTag(tag);
                            }
                          }}
                          className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </span>
                      </span>
                    ))}
                    <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 py-1">
                      Click to manage tags
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400 py-1">
                    Click to select or add tags
                  </span>
                )}
              </div>
            </div>
          </PopoverTrigger>

          <PopoverContent
            className="w-80 p-0"
            align="start"
            side="bottom"
            sideOffset={8}
          >
            {/* Search/Add New Tag Input */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchTag || newTag}
                  onChange={(e) => {
                    setSearchTag(e.target.value);
                    setNewTag(e.target.value);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newTag.trim() && !allTags.includes(newTag.trim())) {
                        handleAddNewTag();
                      }
                    }
                  }}
                  placeholder="Search or create new tag..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all"
                  autoFocus
                />
              </div>
              {newTag.trim() && !allTags.includes(newTag.trim()) && (
                <button
                  type="button"
                  onClick={handleAddNewTag}
                  className="w-full mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create "{newTag.trim()}"
                </button>
              )}
            </div>

            {/* Tags List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredTags.length > 0 ? (
                <div className="p-2">
                  {filteredTags.map((tag) => {
                    const isSelected = formData.tags?.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5" />
                          {tag}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Tag className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchTag ? "No tags found" : "No tags available"}
                  </p>
                  {searchTag && newTag.trim() && (
                    <button
                      type="button"
                      onClick={handleAddNewTag}
                      className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      Create "{newTag.trim()}" tag
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer with count */}
            {filteredTags.length > 0 && (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.tags?.length || 0} of {allTags.length} tags selected
                </p>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          Select existing tags or create new ones
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-medium shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            submitLabel
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
