import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  ArrowUpDown,
  Eye,
  Package,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { ProductStatusBadge } from "@/components/admin/products/ProductStatusBadge";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useBulkSelect } from "@/hooks/useBulkSelect";
import { useToast } from "@/hooks/use-toast";
import {
  api,
  type AdminProduct,
  type AdminProductCategory,
  type AdminProductStatus,
  type AdminProductsListResponse,
} from "@/lib/api";

type SortValue =
  | "createdAt:desc"
  | "createdAt:asc"
  | "name:asc"
  | "name:desc"
  | "price:asc"
  | "price:desc";

type FiltersState = {
  page: number;
  search: string;
  categoryId: string;
  status: "all" | AdminProductStatus;
  minPrice: string;
  maxPrice: string;
  inStock: "all" | "true" | "false";
  sortBy: "createdAt" | "name" | "price";
  sortDir: "asc" | "desc";
};

const DEFAULT_FILTERS: FiltersState = {
  page: 1,
  search: "",
  categoryId: "",
  status: "all",
  minPrice: "",
  maxPrice: "",
  inStock: "all",
  sortBy: "createdAt",
  sortDir: "desc",
};

const PAGE_SIZE = 20;

const SORT_OPTIONS: Array<{ value: SortValue; label: string }> = [
  { value: "name:asc", label: "Name A-Z" },
  { value: "name:desc", label: "Name Z-A" },
  { value: "price:asc", label: "Price Low-High" },
  { value: "price:desc", label: "Price High-Low" },
  { value: "createdAt:desc", label: "Newest" },
  { value: "createdAt:asc", label: "Oldest" },
];

function parseFilters(location: string): FiltersState {
  const searchPart = location.includes("?") ? location.split("?")[1] ?? "" : "";
  const params = new URLSearchParams(searchPart);
  const page = Number(params.get("page") ?? DEFAULT_FILTERS.page);

  return {
    page: Number.isFinite(page) && page > 0 ? page : DEFAULT_FILTERS.page,
    search: params.get("search") ?? DEFAULT_FILTERS.search,
    categoryId: params.get("categoryId") ?? DEFAULT_FILTERS.categoryId,
    status:
      params.get("status") === "active" ||
      params.get("status") === "draft" ||
      params.get("status") === "archived"
        ? (params.get("status") as AdminProductStatus)
        : DEFAULT_FILTERS.status,
    minPrice: params.get("minPrice") ?? DEFAULT_FILTERS.minPrice,
    maxPrice: params.get("maxPrice") ?? DEFAULT_FILTERS.maxPrice,
    inStock:
      params.get("inStock") === "true" || params.get("inStock") === "false"
        ? (params.get("inStock") as "true" | "false")
        : DEFAULT_FILTERS.inStock,
    sortBy:
      params.get("sortBy") === "name" || params.get("sortBy") === "price"
        ? (params.get("sortBy") as "name" | "price")
        : DEFAULT_FILTERS.sortBy,
    sortDir: params.get("sortDir") === "asc" ? "asc" : DEFAULT_FILTERS.sortDir,
  };
}

function flattenCategories(
  categories: AdminProductCategory[],
  depth = 0,
): Array<{ id: string; label: string }> {
  return categories.flatMap((category) => [
    {
      id: category.id,
      label: `${depth > 0 ? "— ".repeat(depth) : ""}${category.name}`,
    },
    ...flattenCategories(category.children ?? [], depth + 1),
  ]);
}

function getThumbnail(product: AdminProduct) {
  return product.firstImage?.url ?? product.featuredImageUrl ?? product.images[0] ?? null;
}

function getCategoryLabel(product: AdminProduct) {
  return product.category?.name ?? "Uncategorized";
}

function getProductStock(product: AdminProduct) {
  return product.totalStock ?? product.stock;
}

function getSortValue(filters: FiltersState): SortValue {
  return `${filters.sortBy}:${filters.sortDir}` as SortValue;
}

export default function AdminProducts() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const filters = useMemo(() => parseFilters(location), [location]);
  const [searchInput, setSearchInput] = useState(filters.search);
  const deferredSearchInput = useDeferredValue(searchInput);
  const categoryOptionsQuery = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => api.admin.categories.list(),
  });
  const statsQuery = useQuery({
    queryKey: ["product-stats"],
    queryFn: () => api.admin.products.stats(),
  });
  const productsQuery = useQuery({
    queryKey: ["products", filters],
    queryFn: () =>
      api.admin.products.list({
        page: filters.page,
        limit: PAGE_SIZE,
        search: filters.search || undefined,
        categoryId: filters.categoryId || undefined,
        status: filters.status === "all" ? undefined : filters.status,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        inStock:
          filters.inStock === "all"
            ? undefined
            : filters.inStock === "true",
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
      }),
    placeholderData: (previous) => previous,
  });
  const categories = categoryOptionsQuery.data?.categories ?? [];
  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);
  const products = productsQuery.data?.products ?? [];
  const total = productsQuery.data?.total ?? 0;
  const totalPages = productsQuery.data?.totalPages ?? 1;
  const {
    selectedArray,
    selectedCount,
    selectedIds,
    toggleAll,
    toggleOne,
    clearAll,
    isAllSelected,
  } = useBulkSelect();
  const [confirmDialog, setConfirmDialog] = useState<null | {
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState("");

  function updateUrl(
    updates: Partial<Record<keyof FiltersState, string | number | undefined>>,
    replace = true,
  ) {
    const params = new URLSearchParams();
    const next: FiltersState = {
      ...filters,
      ...updates,
    } as FiltersState;

    if (next.page > 1) params.set("page", String(next.page));
    if (next.search) params.set("search", next.search);
    if (next.categoryId) params.set("categoryId", next.categoryId);
    if (next.status !== "all") params.set("status", next.status);
    if (next.minPrice) params.set("minPrice", next.minPrice);
    if (next.maxPrice) params.set("maxPrice", next.maxPrice);
    if (next.inStock !== "all") params.set("inStock", next.inStock);
    if (next.sortBy !== DEFAULT_FILTERS.sortBy) params.set("sortBy", next.sortBy);
    if (next.sortDir !== DEFAULT_FILTERS.sortDir) params.set("sortDir", next.sortDir);

    const qs = params.toString();
    startTransition(() => {
      setLocation(`/admin/products${qs ? `?${qs}` : ""}`, { replace });
    });
  }

  useEffect(() => {
    if (searchInput !== filters.search) {
      setSearchInput(filters.search);
    }
  }, [filters.search, searchInput]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (deferredSearchInput === filters.search) return;
      updateUrl({ search: deferredSearchInput || undefined, page: 1 }, true);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [deferredSearchInput, filters.search]);

  useEffect(() => {
    if (filters.page > totalPages && totalPages > 0) {
      updateUrl({ page: totalPages }, true);
    }
  }, [filters.page, totalPages]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminProductStatus }) =>
      api.admin.products.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previous = queryClient.getQueriesData<AdminProductsListResponse>({
        queryKey: ["products"],
      });
      queryClient.setQueriesData<AdminProductsListResponse>(
        { queryKey: ["products"] },
        (current) =>
          current
            ? {
                ...current,
                products: current.products.map((product) =>
                  product.id === id
                    ? { ...product, status, isActive: status === "active" }
                    : product,
                ),
              }
            : current,
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      context?.previous.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      toast({
        title: "Status update failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({ title: "Product status updated" });
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product-stats"] }),
      ]);
    },
  });

  const bulkMutation = useMutation({
    mutationFn: (payload: {
      action: "archive" | "activate" | "delete" | "updateCategory";
      ids: string[];
      payload?: Record<string, unknown>;
    }) => api.admin.products.bulk(payload),
    onSuccess: async (_data, variables) => {
      clearAll();
      setCategoryDialogOpen(false);
      setBulkCategoryId("");
      toast({
        title:
          variables.action === "updateCategory"
            ? "Category updated"
            : "Products updated",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product-stats"] }),
      ]);
    },
    onError: (error) => {
      toast({
        title: "Bulk action failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.categoryId ||
      filters.status !== "all" ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.inStock !== "all",
  );
  const currentPageIds = products.map((product) => product.id);
  const showingFrom = total === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1;
  const showingTo = total === 0 ? 0 : Math.min(filters.page * PAGE_SIZE, total);

  function openRow(product: AdminProduct) {
    setLocation(`/admin/products/${product.id}/edit`);
  }

  function triggerBulkAction(action: "archive" | "activate" | "delete") {
    setConfirmDialog({
      title:
        action === "activate"
          ? "Activate selected products?"
          : action === "archive"
            ? "Archive selected products?"
            : "Delete selected products?",
      description:
        action === "delete"
          ? "Delete performs a soft-delete and moves the selected products to archived."
          : `This will update ${selectedCount} selected products.`,
      confirmLabel:
        action === "activate" ? "Activate" : action === "archive" ? "Archive" : "Delete",
      onConfirm: () => {
        void bulkMutation.mutate({ action, ids: selectedArray });
      },
    });
  }

  return (
    <AdminLayout
      title="Products"
      subtitle="Browse, filter, and manage your full product catalog."
      actions={
        <Button onClick={() => setLocation("/admin/products/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Product
        </Button>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total Products" value={statsQuery.data?.stats.total ?? "—"} icon={<Package className="h-4 w-4" />} />
          <StatCard label="Active" value={statsQuery.data?.stats.active ?? "—"} accent="emerald" />
          <StatCard label="Draft" value={statsQuery.data?.stats.draft ?? "—"} accent="purple" />
          <StatCard label="Archived" value={statsQuery.data?.stats.archived ?? "—"} accent="amber" />
          <StatCard label="Out of Stock" value={statsQuery.data?.stats.outOfStock ?? "—"} accent="rose" icon={<Sparkles className="h-4 w-4" />} />
        </section>

        <section className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[minmax(260px,1.5fr)_repeat(5,minmax(0,1fr))]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by product name, SKU, or slug"
                className="pl-9"
              />
            </div>

            <Select
              value={filters.categoryId || "all"}
              onValueChange={(value) => updateUrl({ categoryId: value === "all" ? undefined : value, page: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {flatCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => updateUrl({ status: value === "all" ? undefined : value, page: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.inStock}
              onValueChange={(value) => updateUrl({ inStock: value === "all" ? undefined : value, page: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stock</SelectItem>
                <SelectItem value="true">In stock</SelectItem>
                <SelectItem value="false">Out of stock</SelectItem>
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-2">
              <Input value={filters.minPrice} onChange={(event) => updateUrl({ minPrice: event.target.value || undefined, page: 1 })} placeholder="Min Rs" inputMode="numeric" />
              <Input value={filters.maxPrice} onChange={(event) => updateUrl({ maxPrice: event.target.value || undefined, page: 1 })} placeholder="Max Rs" inputMode="numeric" />
            </div>

            <Select
              value={getSortValue(filters)}
              onValueChange={(value) => {
                const [sortBy, sortDir] = value.split(":") as [FiltersState["sortBy"], FiltersState["sortDir"]];
                updateUrl({ sortBy, sortDir, page: 1 });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort products" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  updateUrl(
                    {
                      page: 1,
                      search: undefined,
                      categoryId: undefined,
                      status: undefined,
                      minPrice: undefined,
                      maxPrice: undefined,
                      inStock: undefined,
                    },
                    true,
                  );
                }}
              >
                <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                Clear filters
              </Button>
            )}
            <span className="text-xs text-[#6B7280]">
              {productsQuery.isFetching ? "Refreshing results…" : `${total.toLocaleString()} matching products`}
            </span>
          </div>
        </section>

        {selectedCount > 0 && (
          <section className="flex flex-wrap items-center gap-3 rounded-xl border border-[#D6CCFF] bg-[#F7F4FF] p-4">
            <span className="text-sm font-semibold text-[#312E81]">{selectedCount} selected</span>
            <Button size="sm" variant="outline" onClick={() => void bulkMutation.mutate({ action: "activate", ids: selectedArray })}>
              Activate
            </Button>
            <Button size="sm" variant="outline" onClick={() => triggerBulkAction("archive")}>
              Archive
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCategoryDialogOpen(true)}>
              <Tag className="mr-2 h-3.5 w-3.5" />
              Change category
            </Button>
            <Button size="sm" variant="outline" onClick={() => triggerBulkAction("delete")}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={clearAll}>
              Clear selection
            </Button>
          </section>
        )}

        <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-[#FAFBFF] text-xs uppercase tracking-[0.18em] text-[#9CA3AF]">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={isAllSelected(currentPageIds)}
                      onCheckedChange={() => toggleAll(currentPageIds)}
                      aria-label="Select all products on this page"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Thumbnail</th>
                  <th className="px-4 py-3 text-left">Name + SKU</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsQuery.isLoading ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <tr key={index} className="border-t border-[#F3F4F6]">
                      <td className="px-4 py-4"><Skeleton className="h-4 w-4" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-12 w-12 rounded-xl" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-44" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-4 py-4"><Skeleton className="ml-auto h-9 w-48" /></td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-14 text-center">
                      <div className="mx-auto max-w-md space-y-2">
                        <h3 className="text-base font-semibold text-[#111827]">
                          {hasActiveFilters ? "No products match these filters" : "No products yet"}
                        </h3>
                        <p className="text-sm text-[#6B7280]">
                          {hasActiveFilters
                            ? "Try broadening your search, clearing a filter, or changing the stock and price range."
                            : "Create your first product to start building the catalog for your store."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const thumbnail = getThumbnail(product);
                    const stock = getProductStock(product);
                    const safeStatus =
                      product.status === "active" ||
                      product.status === "draft" ||
                      product.status === "archived"
                        ? product.status
                        : "draft";
                    const nextStatus: AdminProductStatus =
                      safeStatus === "active" ? "archived" : "active";

                    return (
                      <tr
                        key={product.id}
                        className="cursor-pointer border-t border-[#F3F4F6] hover:bg-[#FAFBFF]"
                        onClick={() => openRow(product)}
                      >
                        <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(product.id)}
                            onCheckedChange={() => toggleOne(product.id)}
                            aria-label={`Select ${product.name}`}
                          />
                        </td>
                        <td className="px-4 py-4">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={product.name}
                              className="h-12 w-12 rounded-xl border border-[#E5E7EB] object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] text-[#9CA3AF]">
                              <Package className="h-5 w-5" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-[#111827]">{product.name}</div>
                          <div className="mt-1 text-xs text-[#6B7280]">
                            {product.sku || "No SKU"}
                            {product.variantCount ? ` · ${product.variantCount} variants` : ""}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#374151]">{getCategoryLabel(product)}</td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-[#111827]">
                            Rs {product.price.toLocaleString()}
                          </div>
                          {product.comparePrice ? (
                            <div className="text-xs text-[#9CA3AF] line-through">
                              Rs {product.comparePrice.toLocaleString()}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-4">
                          <div className={`font-semibold ${stock > 0 ? "text-[#111827]" : "text-[#DC2626]"}`}>
                            {stock.toLocaleString()}
                          </div>
                          <div className="text-xs text-[#6B7280]">
                            {stock > 0 ? "In stock" : "Out of stock"}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <ProductStatusBadge status={safeStatus} />
                        </td>
                        <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => openRow(product)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setConfirmDialog({
                                  title: nextStatus === "active" ? "Activate product?" : "Archive product?",
                                  description: `${product.name} will be updated immediately.`,
                                  confirmLabel: nextStatus === "active" ? "Activate" : "Archive",
                                  onConfirm: () => void statusMutation.mutate({ id: product.id, status: nextStatus }),
                                });
                              }}
                            >
                              <Archive className="mr-2 h-3.5 w-3.5" />
                              {nextStatus === "active" ? "Activate" : "Archive"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(`/admin/products/${product.id}/edit`, "_blank", "noopener,noreferrer")}
                            >
                              <Eye className="mr-2 h-3.5 w-3.5" />
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#F3F4F6] px-4 py-4 text-sm text-[#6B7280] md:flex-row md:items-center md:justify-between">
            <span>
              Showing {showingFrom.toLocaleString()}–{showingTo.toLocaleString()} of {total.toLocaleString()} products
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={filters.page <= 1} onClick={() => updateUrl({ page: filters.page - 1 }, false)}>
                Previous
              </Button>
              <span className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#374151]">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Page {filters.page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={filters.page >= totalPages} onClick={() => updateUrl({ page: filters.page + 1 }, false)}>
                Next
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change category</DialogTitle>
          </DialogHeader>
          <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {flatCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!bulkCategoryId} onClick={() => void bulkMutation.mutate({ action: "updateCategory", ids: selectedArray, payload: { categoryId: bulkCategoryId } })}>
              Save category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(confirmDialog)} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirmDialog?.onConfirm();
                setConfirmDialog(null);
              }}
            >
              {confirmDialog?.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
