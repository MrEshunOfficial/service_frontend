"use client";
import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  Filter,
  AlertCircle,
  Tag,
  Image as ImageIcon,
  Ban,
  CheckCircle,
  X,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import Image from "next/image";
import {
  useAllCategories,
  useCategoryAdmin,
  useCategoryTags,
} from "@/hooks/services/services.category.hook";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import CategoryForm from "../form/category.form";
import { ImageUploadWithPreview } from "@/components/filemanager/shared/ImageUploadWithPreview";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function AdminCategoryList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "deleted"
  >("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [changingCoverId, setChangingCoverId] = useState<string | null>(null);

  // Alert Dialog states
  const [deleteAlert, setDeleteAlert] = useState<{
    open: boolean;
    categoryId: string | null;
    permanent: boolean;
  }>({ open: false, categoryId: null, permanent: false });

  const [bulkActionAlert, setBulkActionAlert] = useState<{
    open: boolean;
    action: "activate" | "deactivate" | "delete" | "restore" | null;
  }>({ open: false, action: null });

  const includeDeleted = filterStatus === "deleted";

  const {
    data: categories,
    loading,
    error,
    refetch,
  } = useAllCategories(includeDeleted);

  const admin = useCategoryAdmin();
  const { data: availableTags } = useCategoryTags();

  const categoriesArray = Array.isArray(categories) ? categories : [];

  const filteredCategories = useMemo(() => {
    return categoriesArray.filter((cat) => {
      const matchesSearch =
        cat.catName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.catDesc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && cat.isActive && !cat.isDeleted) ||
        (filterStatus === "inactive" && !cat.isActive && !cat.isDeleted) ||
        (filterStatus === "deleted" && cat.isDeleted);
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => cat.tags?.includes(tag));

      return matchesSearch && matchesStatus && matchesTags;
    });
  }, [categoriesArray, searchQuery, filterStatus, selectedTags]);

  const getBulkActionOptions = () => {
    const selected = categoriesArray.filter((c) =>
      selectedCategories.includes(c._id)
    );
    const hasDeleted = selected.some((c) => c.isDeleted);
    const hasActive = selected.some((c) => c.isActive && !c.isDeleted);
    const hasInactive = selected.some((c) => !c.isActive && !c.isDeleted);
    const allDeleted = selected.every((c) => c.isDeleted);

    return {
      showActivate: !allDeleted && (hasInactive || hasDeleted),
      showDeactivate: !allDeleted && hasActive,
      showDelete: !allDeleted,
      showRestore: hasDeleted,
    };
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map((c) => c._id));
    }
  };

  const handleSelectCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleUpdateCategory = async (categoryId: string, data: any) => {
    try {
      await admin.updateCategory(categoryId, data);
      setEditingId(null);
      refetch();
    } catch (err) {
      console.error("Failed to update category:", err);
      throw err;
    }
  };

  const handleCreateCategory = async (data: any) => {
    try {
      await admin.createCategory(data);
      setShowCreateModal(false);
      refetch();
    } catch (err) {
      console.error("Failed to create category:", err);
      throw err;
    }
  };

  const handleDelete = async (id: string, permanent = false) => {
    try {
      if (permanent) {
        await admin.permanentlyDelete(id);
      } else {
        await admin.deleteCategory(id);
      }
      setDeleteAlert({ open: false, categoryId: null, permanent: false });
      refetch();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await admin.restoreCategory(id);
      refetch();
    } catch (err) {
      console.error("Failed to restore:", err);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await admin.toggleStatus(id);
      refetch();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleBulkAction = async (
    action: "activate" | "deactivate" | "delete" | "restore"
  ) => {
    if (selectedCategories.length === 0) return;

    try {
      if (action === "activate" || action === "deactivate") {
        await admin.bulkUpdate({
          categoryIds: selectedCategories,
          updates: { isActive: action === "activate" },
        });
      } else if (action === "delete") {
        for (const id of selectedCategories) {
          await admin.deleteCategory(id);
        }
      } else if (action === "restore") {
        for (const id of selectedCategories) {
          await admin.restoreCategory(id);
        }
      }

      setSelectedCategories([]);
      setBulkActionAlert({ open: false, action: null });
      refetch();
    } catch (err) {
      console.error("Bulk action failed:", err);
    }
  };

  if (loading) {
    return (
      <LoadingOverlay
        message="Getting categories ready, please wait..."
        show={true}
      />
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>Error loading categories: {error.message}</span>
        </div>
      </div>
    );
  }

  const bulkOptions = getBulkActionOptions();

  return (
    <div className="w-full h-full flex flex-col gap-1">
      <header className="h-auto border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Categories Management</h1>
            <p className="text-sm text-muted-foreground">
              {filteredCategories.length} of {categoriesArray.length} categories
            </p>
          </div>

          {/* Create Category Dialog */}
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Add a new category to organize your content.
                </DialogDescription>
              </DialogHeader>
              <CategoryForm
                availableTags={availableTags || []}
                availableCategories={categoriesArray}
                onSubmit={handleCreateCategory}
                onCancel={() => setShowCreateModal(false)}
                submitLabel="Create Category"
                isLoading={admin.loading}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Filter Popover */}
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`flex items-center gap-2 ${
                  showFilters ||
                  selectedTags.length > 0 ||
                  filterStatus !== "all"
                    ? "ring-2 ring-primary"
                    : ""
                }`}
              >
                <Filter className="w-4 h-4" />
                {(selectedTags.length > 0 || filterStatus !== "all") && (
                  <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    {(filterStatus !== "all" ? 1 : 0) + selectedTags.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-xs font-medium mb-2 block">
                    Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["all", "active", "inactive", "deleted"].map((status) => (
                      <Button
                        key={status}
                        variant={
                          filterStatus === status ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setFilterStatus(status as any)}
                        className="capitalize"
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tags Filter */}
                {availableTags && availableTags.length > 0 && (
                  <div>
                    <label className="text-xs font-medium mb-2 block">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {availableTags.map((tag) => (
                        <Button
                          key={tag}
                          variant={
                            selectedTags.includes(tag) ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setSelectedTags((prev) =>
                              prev.includes(tag)
                                ? prev.filter((t) => t !== tag)
                                : [...prev, tag]
                            );
                          }}
                          className="flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clear Filters */}
                {(selectedTags.length > 0 || filterStatus !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTags([]);
                      setFilterStatus("all");
                    }}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Bulk Actions Popover */}
          {selectedCategories.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button className="flex items-center gap-2">
                  Bulk Actions ({selectedCategories.length})
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="end">
                {bulkOptions.showActivate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setBulkActionAlert({ open: true, action: "activate" })
                    }
                    className="w-full justify-start text-green-600 dark:text-green-400"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                )}
                {bulkOptions.showDeactivate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setBulkActionAlert({ open: true, action: "deactivate" })
                    }
                    className="w-full justify-start text-yellow-600 dark:text-yellow-400"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Deactivate
                  </Button>
                )}
                {bulkOptions.showRestore && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setBulkActionAlert({ open: true, action: "restore" })
                    }
                    className="w-full justify-start text-blue-600 dark:text-blue-400"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore
                  </Button>
                )}
                {bulkOptions.showDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setBulkActionAlert({ open: true, action: "delete" })
                    }
                    className="w-full justify-start text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
                <div className="border-t my-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategories([])}
                  className="w-full justify-start"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Selection
                </Button>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </header>

      <div className="h-[59vh] p-2 overflow-auto styled-scrollbar border rounded-lg shadow-sm">
        <div className="space-y-3">
          {filteredCategories.length > 0 && (
            <div className="flex items-center gap-3 p-3 border rounded-md sticky top-0 z-10">
              <input
                type="checkbox"
                checked={
                  selectedCategories.length === filteredCategories.length &&
                  filteredCategories.length > 0
                }
                onChange={handleSelectAll}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm font-medium">Select All</span>
            </div>
          )}

          {filteredCategories.map((category) => (
            <div
              key={category._id}
              className={`p-5 border rounded-lg transition-all ${
                category.isDeleted
                  ? "opacity-50"
                  : !category.isActive
                  ? "opacity-70"
                  : selectedCategories.includes(category._id)
                  ? "ring-2 ring-primary"
                  : "hover:ring-2 hover:ring-muted"
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category._id)}
                  onChange={() => handleSelectCategory(category._id)}
                  className="w-4 h-4 mt-1 text-primary rounded"
                />

                {/* Category Cover with Dialog */}
                <Dialog
                  open={changingCoverId === category._id}
                  onOpenChange={(open) =>
                    setChangingCoverId(open ? category._id : null)
                  }
                >
                  <DialogTrigger asChild>
                    <div className="relative w-24 h-24 shrink-0 border-2 border-dashed rounded-lg overflow-hidden cursor-pointer group">
                      {(() => {
                        const imageUrl = category.catCoverId?.thumbnailUrl;
                        return imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={category.catName}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        );
                      })()}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Edit className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Update Cover Image</DialogTitle>
                      <DialogDescription>
                        Upload a new cover image for this category.
                      </DialogDescription>
                    </DialogHeader>
                    <ImageUploadWithPreview
                      type="category"
                      entityId={category._id}
                      onUploadComplete={() => {
                        setChangingCoverId(null);
                        refetch();
                      }}
                      aspectRatio="video"
                      placeholder="Upload category cover image"
                    />
                  </DialogContent>
                </Dialog>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="font-semibold text-lg">
                          {category.catName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            category.isActive
                              ? "text-green-700 dark:text-green-300"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                        {category.isDeleted && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium border text-red-700 dark:text-red-300">
                            Deleted
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.catDesc}
                      </p>
                      {category.tags && category.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {category.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 border rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {category.tags.length > 3 && (
                            <span className="px-3 py-1 border rounded-full text-xs font-medium text-muted-foreground">
                              +{category.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Single Category Actions - Popover */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-1" align="end">
                        {category.isDeleted ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestore(category._id)}
                              disabled={admin.loading}
                              className="w-full justify-start text-green-600 dark:text-green-400"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Restore
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setDeleteAlert({
                                  open: true,
                                  categoryId: category._id,
                                  permanent: true,
                                })
                              }
                              disabled={admin.loading}
                              className="w-full justify-start text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Permanently
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(category._id)}
                              disabled={admin.loading}
                              className="w-full justify-start"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(category._id)}
                              disabled={admin.loading}
                              className={`w-full justify-start ${
                                category.isActive
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : "text-green-600 dark:text-green-400"
                              }`}
                            >
                              {category.isActive ? (
                                <>
                                  <Ban className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </Button>
                            <div className="border-t my-1" />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setDeleteAlert({
                                  open: true,
                                  categoryId: category._id,
                                  permanent: false,
                                })
                              }
                              disabled={admin.loading}
                              className="w-full justify-start text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <AlertCircle className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg">No categories found</p>
              <p className="text-sm mt-2">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="h-16 border rounded-lg px-4 shadow-sm flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          Total: {categoriesArray.length} | Active:{" "}
          {categoriesArray.filter((c) => c.isActive && !c.isDeleted).length} |
          Inactive:{" "}
          {categoriesArray.filter((c) => !c.isActive && !c.isDeleted).length}
          {includeDeleted &&
            ` | Deleted: ${categoriesArray.filter((c) => c.isDeleted).length}`}
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </footer>

      {/* Edit Modal */}
      <Dialog
        open={editingId !== null}
        onOpenChange={(open) => !open && setEditingId(null)}
      >
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Make changes to the category details.
            </DialogDescription>
          </DialogHeader>
          {(() => {
            const category = categoriesArray.find((c) => c._id === editingId);
            return category ? (
              <CategoryForm
                initialData={{
                  catName: category.catName,
                  catDesc: category.catDesc,
                  tags: category.tags || [],
                  parentCategoryId: category.parentCategoryId,
                }}
                availableTags={availableTags || []}
                availableCategories={categoriesArray}
                currentCategoryId={category._id}
                onSubmit={async (data) => {
                  await handleUpdateCategory(category._id, data);
                }}
                onCancel={() => setEditingId(null)}
                submitLabel="Save Changes"
                isLoading={admin.loading}
              />
            ) : null;
          })()}
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog
        open={deleteAlert.open}
        onOpenChange={(open) =>
          !open &&
          setDeleteAlert({ open: false, categoryId: null, permanent: false })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteAlert.permanent
                ? "Permanently Delete Category?"
                : "Delete Category?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteAlert.permanent
                ? "This action cannot be undone. This will permanently delete the category and all associated data."
                : "This will move the category to trash. You can restore it later if needed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteAlert.categoryId &&
                handleDelete(deleteAlert.categoryId, deleteAlert.permanent)
              }
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteAlert.permanent ? "Delete Permanently" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Action Alert Dialog */}
      <AlertDialog
        open={bulkActionAlert.open}
        onOpenChange={(open) =>
          !open && setBulkActionAlert({ open: false, action: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkActionAlert.action === "activate" && "Activate Categories?"}
              {bulkActionAlert.action === "deactivate" &&
                "Deactivate Categories?"}
              {bulkActionAlert.action === "delete" && "Delete Categories?"}
              {bulkActionAlert.action === "restore" && "Restore Categories?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkActionAlert.action === "activate" &&
                `This will activate ${selectedCategories.length} selected ${
                  selectedCategories.length === 1 ? "category" : "categories"
                }.`}
              {bulkActionAlert.action === "deactivate" &&
                `This will deactivate ${selectedCategories.length} selected ${
                  selectedCategories.length === 1 ? "category" : "categories"
                }.`}
              {bulkActionAlert.action === "delete" &&
                `This will move ${selectedCategories.length} selected ${
                  selectedCategories.length === 1 ? "category" : "categories"
                } to trash. You can restore them later if needed.`}
              {bulkActionAlert.action === "restore" &&
                `This will restore ${selectedCategories.length} selected ${
                  selectedCategories.length === 1 ? "category" : "categories"
                } from trash.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                bulkActionAlert.action &&
                handleBulkAction(bulkActionAlert.action)
              }
              className={
                bulkActionAlert.action === "delete"
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }
            >
              {bulkActionAlert.action === "activate" && "Activate"}
              {bulkActionAlert.action === "deactivate" && "Deactivate"}
              {bulkActionAlert.action === "delete" && "Delete"}
              {bulkActionAlert.action === "restore" && "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
