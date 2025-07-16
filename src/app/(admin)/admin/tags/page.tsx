"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Hash,
  Tag as TagIcon,
  Loader2,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

type Tag = {
  id: string;
  name: string;
  color?: string;
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

const AdminTagsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: "", color: "" });
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  // State to hold the current input value for search, separate from URL param
  const [searchInput, setSearchInput] = useState("");

  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentLimit = parseInt(searchParams.get("limit") || "10");
  const currentSearchTermFromURL = searchParams.get("search") || ""; // Renamed for clarity

  // Defined tagColors for new tag creation
  const tagColors = [
    "#f59e0b",
    "#3b82f6",
    "#10b981",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4",
    "#f97316",
    "#84cc16",
    "#ec4899",
    "#6366f1",
  ];

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      // Always reset page to 1 when search term changes
      if (name === "search" && value !== currentSearchTermFromURL) {
        params.set("page", "1");
      }
      params.set(name, value);
      return params.toString();
    },
    [searchParams, currentSearchTermFromURL]
  );

  // Initialize searchInput when component mounts or URL search param changes
  useEffect(() => {
    setSearchInput(currentSearchTermFromURL);
  }, [currentSearchTermFromURL]);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("page", currentPage.toString());
      query.set("limit", currentLimit.toString());
      if (currentSearchTermFromURL) {
        query.set("search", currentSearchTermFromURL);
      }

      const response = await fetch(`/api/tag?${query.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }
      const result = await response.json();
      setTags(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast.error("Failed to load tags.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentLimit, currentSearchTermFromURL]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Debounced search handler
  useEffect(() => {
    // Set a timeout to delay the search
    const handler = setTimeout(() => {
      // Only push if the search input has actually changed from the URL param
      // and prevent immediate push on initial render if searchInput is empty
      if (searchInput !== currentSearchTermFromURL) {
        router.push(`?${createQueryString("search", searchInput)}`, {
          scroll: false,
        });
      }
    }, 500); // 500ms debounce delay

    // Cleanup function: This runs if the effect is re-executed (e.g., searchInput changes again)
    // or if the component unmounts. It clears the previous timeout.
    return () => {
      clearTimeout(handler);
    };
  }, [searchInput, createQueryString, router, currentSearchTermFromURL]); // Depend on searchInput to re-run effect

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value); // Update local state immediately
  };

  const handlePageChange = (page: number) => {
    router.push(`?${createQueryString("page", page.toString())}`, {
      scroll: false,
    });
  };

  const handleAddTag = async () => {
    if (!formData.name.trim()) {
      toast.error("Tag name cannot be empty.");
      return;
    }
    setIsMutating(true);
    try {
      const newTagData = {
        name: formData.name.trim(),
        color:
          formData.color ||
          tagColors[Math.floor(Math.random() * tagColors.length)],
      };
      const response = await fetch("/api/tag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTagData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add tag");
      }

      toast.success("Tag added successfully!");
      fetchTags();
      closeModals();
    } catch (error: any) {
      console.error("Error adding tag:", error);
      toast.error(error.message || "Failed to add tag.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleEditTag = async () => {
    if (!editingTag || !formData.name.trim()) {
      toast.error("Tag name cannot be empty.");
      return;
    }
    setIsMutating(true);
    try {
      const updatedTagData = {
        name: formData.name.trim(),
        color: formData.color,
      };
      const response = await fetch(`/api/tag/${editingTag.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTagData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update tag");
      }

      toast.success("Tag updated successfully!");
      fetchTags();
      closeModals();
    } catch (error: any) {
      console.error("Error updating tag:", error);
      toast.error(error.message || "Failed to update tag.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;

    setIsMutating(true);
    try {
      const response = await fetch(`/api/tag/${tagToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete tag");
      }

      toast.success("Tag deleted successfully!");
      fetchTags();
      setIsDeleteDialogOpen(false);
      setTagToDelete(null);
    } catch (error: any) {
      console.error("Error deleting tag:", error);
      toast.error(error.message || "Failed to delete tag.");
    } finally {
      setIsMutating(false);
    }
  };

  const openAddModal = () => {
    setFormData({ name: "", color: tagColors[0] });
    setIsAddModalOpen(true);
  };

  const openEditModal = (tag: Tag) => {
    setFormData({ name: tag.name, color: tag.color || tagColors[0] });
    setEditingTag(tag);
  };

  const openDeleteDialog = (tagId: string) => {
    setTagToDelete(tagId);
    setIsDeleteDialogOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingTag(null);
    setFormData({ name: "", color: "" });
    setIsDeleteDialogOpen(false);
    setTagToDelete(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editingTag) {
        handleEditTag();
      } else {
        handleAddTag();
      }
    }
  };

  const TagSkeleton = () => (
    <div className="bg-surface-raised border border-border rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-3 h-3 rounded-full bg-gray-200 flex-shrink-0"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-strong flex items-center gap-2">
            <Hash className="h-6 w-6 text-brand" />
            Tags Management
          </h1>
          <p className="text-text-subtle mt-1">
            Label and categorize your quizzes with tags
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Add Tag
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="bg-surface-raised border border-border rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-subtle h-4 w-4" />
            <Input
              type="text"
              placeholder="Search tags..."
              value={searchInput} // Use local state for input value
              onChange={handleSearchInputChange} // Use new handler
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none bg-background text-text-strong"
            />
          </div>
          {/* Filter button removed as it's not implemented yet */}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-feature-1-start to-feature-1-end p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Tags</p>
              <p className="text-2xl font-bold">{pagination.total}</p>
            </div>
            <Hash className="h-8 w-8 text-white/60" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-feature-2-start to-feature-2-end p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Most Used</p>
              <p className="text-lg font-semibold truncate">
                {tags.length > 0
                  ? tags.reduce((prev, current) =>
                      prev._count.quizzes > current._count.quizzes
                        ? prev
                        : current
                    ).name
                  : "N/A"}
              </p>
            </div>
            <TagIcon className="h-8 w-8 text-white/60" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-feature-3-start to-feature-3-end p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Usage</p>
              <p className="text-2xl font-bold">
                {tags.reduce((sum, tag) => sum + tag._count.quizzes, 0)}
              </p>
            </div>
            <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">∑</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: currentLimit }).map((_, i) => (
              <TagSkeleton key={i} />
            ))
          : tags.map((tag) => (
              <div
                key={tag.id}
                className="bg-surface-raised border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color || tagColors[0] }}
                    />
                    <span className="font-medium text-text-strong truncate">
                      #{tag.name}
                    </span>
                  </div>
                  <div className="relative flex-shrink-0"></div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-subtle">
                    {tag._count.quizzes} quizzes
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(tag)}
                      className="flex items-center gap-2 text-brand hover:bg-brand-subtle"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(tag.id)}
                      className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      disabled={isMutating && tagToDelete === tag.id}
                    >
                      {isMutating && tagToDelete === tag.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {loading === false && tags.length === 0 && (
        <div className="text-center py-12">
          <Hash className="h-12 w-12 text-text-subtle mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-strong mb-2">
            No tags found
          </h3>
          <p className="text-text-subtle mb-4">
            {currentSearchTermFromURL // Use currentSearchTermFromURL here
              ? "Try adjusting your search terms."
              : "Get started by creating your first tag."}
          </p>
          {!currentSearchTermFromURL && (
            <Button
              onClick={openAddModal}
              className="bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Create Tag
            </Button>
          )}
        </div>
      )}

      {loading === false && tags.length > 0 && (
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

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || !!editingTag} onOpenChange={closeModals}>
        <DialogContent className="sm:max-w-[425px] bg-surface-raised border border-border rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-brand" />
              {editingTag ? "Edit Tag" : "Add New Tag"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="name"
                className="text-right text-sm font-medium text-text-strong"
              >
                Tag Name
              </label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                onKeyPress={handleKeyPress}
                className="col-span-3 w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none bg-background text-text-strong"
                placeholder="Enter tag name"
                autoFocus
              />
            </div>
            {/* Color selection for tags */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="color"
                className="text-right text-sm font-medium text-text-strong"
              >
                Color
              </label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {tagColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full border-2 ${
                      formData.color === color
                        ? "border-brand"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModals}>
              Cancel
            </Button>
            <Button
              onClick={editingTag ? handleEditTag : handleAddTag}
              disabled={isMutating || !formData.name.trim()}
            >
              {isMutating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingTag ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog for Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-surface-raised border border-border rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tag
              and remove its association from all quizzes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
              disabled={isMutating}
              className="bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
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

export default AdminTagsPage;
