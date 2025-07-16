"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Search, FolderOpen, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming you use Sonner for toasts
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Shadcn Textarea
import { Button } from "@/components/ui/button"; // Shadcn Button
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"; // Shadcn Pagination

type Category = {
  id: string;
  name: string;
  description?: string;
  _count: {
    quizzes: number;
  };
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const AdminCategoriesContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false); // For add/edit/delete operations
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentLimit = parseInt(searchParams.get("limit") || "10");
  const currentSearch = searchParams.get("search") || "";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("page", currentPage.toString());
      query.set("limit", currentLimit.toString());
      if (currentSearch) {
        query.set("search", currentSearch);
      }

      const response = await fetch(`/api/category?${query.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const result = await response.json();
      setCategories(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentLimit, currentSearch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    router.push(`?${createQueryString("search", newSearchTerm)}`, {
      scroll: false,
    });
  };

  const handlePageChange = (page: number) => {
    router.push(`?${createQueryString("page", page.toString())}`, {
      scroll: false,
    });
  };

  const handleAddCategory = async () => {
    setIsMutating(true);
    try {
      const response = await fetch("/api/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add category");
      }

      toast.success("Category added successfully!");
      fetchCategories(); // Refresh data
      closeModals();
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast.error(error.message || "Failed to add category.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;
    setIsMutating(true);
    try {
      const response = await fetch(`/api/category/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update category");
      }

      toast.success("Category updated successfully!");
      fetchCategories(); // Refresh data
      closeModals();
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast.error(error.message || "Failed to update category.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setIsMutating(true);
    try {
      const response = await fetch(`/api/category/${categoryToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete category");
      }

      toast.success("Category deleted successfully!");
      fetchCategories(); // Refresh data
      setIsDeleteDialogOpen(false); // Close dialog on success
      setCategoryToDelete(null); // Clear category to delete
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Failed to delete category.");
    } finally {
      setIsMutating(false);
    }
  };

  // Fungsi baru untuk membuka dialog konfirmasi penghapusan
  const openDeleteDialog = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsDeleteDialogOpen(true);
  };

  const openAddModal = () => {
    setFormData({ name: "", description: "" });
    setIsAddModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setEditingCategory(category);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
  };

  const CategorySkeleton = () => (
    <div className="bg-surface-raised border border-border rounded-xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-subtle rounded-lg h-9 w-9"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="p-1 rounded-lg h-6 w-6 bg-gray-200"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded mb-4"></div>
      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <div className="h-6 w-16 bg-gray-200 rounded"></div>
        <div className="h-6 w-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-strong flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-brand" />
            Categories Management
          </h1>
          <p className="text-text-subtle mt-1">
            Organize your quizzes by categories
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="bg-surface-raised border border-border rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-subtle h-4 w-4" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={currentSearch}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none bg-background text-text-strong"
            />
          </div>
          {/* Filter button removed as it's not implemented yet */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: currentLimit }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))
          : categories.map((category) => (
              <div
                key={category.id}
                className="bg-surface-raised border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-subtle rounded-lg">
                      <FolderOpen className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-strong">
                        {category.name}
                      </h3>
                      <p className="text-sm text-text-subtle">
                        {category._count.quizzes} quizzes
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-text-subtle text-sm mb-4 line-clamp-2">
                  {category.description || "No description available"}
                </p>

                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(category)}
                    className="flex items-center gap-2 text-brand hover:bg-brand-subtle"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(category.id)} // Ubah ini untuk memanggil openDeleteDialog
                    className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    disabled={isMutating}
                  >
                    {isMutating && categoryToDelete === category.id ? ( // Tambahkan kondisi ini untuk spinner
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            ))}
      </div>

      {loading === false && categories.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-text-subtle mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-strong mb-2">
            No categories found
          </h3>
          <p className="text-text-subtle mb-4">
            {currentSearch
              ? "Try adjusting your search terms."
              : "Get started by creating your first category."}
          </p>
          {!currentSearch && (
            <Button
              onClick={openAddModal}
              className="bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Create Category
            </Button>
          )}
        </div>
      )}

      {loading === false && categories.length > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => handlePageChange(pagination.page - 1)}
                className={
                  pagination.page <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={() => handlePageChange(i + 1)}
                  isActive={i + 1 === pagination.page}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => handlePageChange(pagination.page + 1)}
                className={
                  pagination.page >= pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog
        open={isAddModalOpen || !!editingCategory}
        onOpenChange={closeModals}
      >
        <DialogContent className="sm:max-w-[425px] bg-surface-raised border border-border rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="name"
                className="text-right text-sm font-medium text-text-strong"
              >
                Category Name
              </label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3 w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none bg-background text-text-strong"
                placeholder="Enter category name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="description"
                className="text-right text-sm font-medium text-text-strong"
              >
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="col-span-3 w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none bg-background text-text-strong resize-none"
                rows={3}
                placeholder="Enter category description (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModals}>
              Cancel
            </Button>
            <Button
              onClick={editingCategory ? handleEditCategory : handleAddCategory}
              disabled={isMutating}
            >
              {isMutating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-surface-raised border border-border rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              category and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={isMutating}
              className="bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90" // Memastikan warna destructive
            >
              {isMutating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCategoriesContent;
