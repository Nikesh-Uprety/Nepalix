import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useLocation, useRoute } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageManager, type QueuedProductImage } from "@/components/admin/products/ImageManager";
import { ProductSidebar } from "@/components/admin/products/ProductSidebar";
import { VariantEditor } from "@/components/admin/products/VariantEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUnsavedChangesPrompt } from "@/hooks/useUnsavedChangesPrompt";
import { useToast } from "@/hooks/use-toast";
import {
  api,
  type AdminProductCategory,
  type AdminProductDetailResponse,
  type AdminProductImage,
  type AdminProductStatus,
} from "@/lib/api";
import {
  productEditSchema,
  type AttributeDefinitionValues,
  type ProductEditFormValues,
} from "@/pages/admin/products/form-schema";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function flattenCategories(
  categories: AdminProductCategory[],
  depth = 0,
): Array<{ id: string; label: string; category: AdminProductCategory }> {
  return categories.flatMap((category) => [
    {
      id: category.id,
      label: `${depth > 0 ? "— ".repeat(depth) : ""}${category.name}`,
      category,
    },
    ...flattenCategories(category.children ?? [], depth + 1),
  ]);
}

function buildAttributeDefinitions(
  detail: AdminProductDetailResponse | undefined,
): AttributeDefinitionValues[] {
  if (!detail?.variants.length) return [];

  const definitions = new Map<string, Set<string>>();
  for (const variant of detail.variants) {
    for (const [name, value] of Object.entries(variant.attributes ?? {})) {
      if (!definitions.has(name)) definitions.set(name, new Set());
      definitions.get(name)?.add(value);
    }
  }

  return Array.from(definitions.entries()).map(([name, values]) => ({
    name,
    valuesInput: Array.from(values).join(", "),
  }));
}

function mapDetailToForm(detail: AdminProductDetailResponse): ProductEditFormValues {
  const hasVariants = detail.variants.length > 0;

  return {
    name: detail.product.name,
    description: detail.product.description ?? "",
    slug: detail.product.slug ?? slugify(detail.product.name),
    sku: detail.product.sku ?? "",
    price: detail.product.price,
    compareAtPrice: detail.product.compareAtPrice ?? detail.product.comparePrice ?? null,
    costPrice: detail.product.costPrice ?? null,
    stock: detail.product.totalStock ?? detail.product.stock,
    weight: detail.product.weight ?? null,
    hasVariants,
    attributeDefinitions: buildAttributeDefinitions(detail),
    variants: detail.variants.map((variant) => ({
      id: variant.id,
      key:
        Object.entries(variant.attributes ?? {})
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([name, value]) => `${name}:${value}`)
          .join("|") || `manual-${variant.id}`,
      title: variant.title,
      attributes: variant.attributes ?? {},
      sku: variant.sku ?? "",
      price: variant.price,
      compareAtPrice: variant.compareAtPrice ?? variant.comparePrice ?? null,
      costPrice: variant.costPrice ?? null,
      stock: variant.stock,
      isActive: variant.isActive,
    })),
    status: (detail.product.status as AdminProductStatus) ?? "draft",
    categoryId: detail.product.categoryId ?? detail.category?.id ?? null,
    tags: detail.product.tags ?? [],
    seoTitle: detail.product.seoTitle ?? "",
    seoDescription: detail.product.seoDescription ?? "",
  };
}

function defaultValues(): ProductEditFormValues {
  return {
    name: "",
    description: "",
    slug: "",
    sku: "",
    price: 0,
    compareAtPrice: null,
    costPrice: null,
    stock: 0,
    weight: null,
    hasVariants: false,
    attributeDefinitions: [],
    variants: [],
    status: "draft",
    categoryId: null,
    tags: [],
    seoTitle: "",
    seoDescription: "",
  };
}

function reorderQueuedImages(
  images: QueuedProductImage[],
  dragId: string,
  dropId: string,
) {
  const next = [...images];
  const dragIndex = next.findIndex((image) => image.id === dragId);
  const dropIndex = next.findIndex((image) => image.id === dropId);
  if (dragIndex === -1 || dropIndex === -1) return images;
  const [moved] = next.splice(dragIndex, 1);
  next.splice(dropIndex, 0, moved);
  return next;
}

function reorderPersistedImages(
  images: AdminProductImage[],
  dragId: string,
  targetPosition: number,
) {
  const next = [...images];
  const dragIndex = next.findIndex((image) => image.id === dragId);
  if (dragIndex === -1 || targetPosition < 0 || targetPosition >= next.length) {
    return images;
  }

  const [moved] = next.splice(dragIndex, 1);
  next.splice(targetPosition, 0, moved);
  return next.map((image, index) => ({
    ...image,
    position: index,
    sortOrder: index,
  }));
}

function getPricingSummary(values: ProductEditFormValues) {
  if (values.hasVariants && values.variants.length > 0) {
    const sorted = [...values.variants].sort((left, right) => left.price - right.price);
    const first = sorted[0];
    return {
      price: first?.price ?? 0,
      compareAtPrice: first?.compareAtPrice ?? null,
      costPrice: first?.costPrice ?? null,
    };
  }

  return {
    price: values.price,
    compareAtPrice: values.compareAtPrice ?? null,
    costPrice: values.costPrice ?? null,
  };
}

function getStockSummary(values: ProductEditFormValues) {
  if (values.hasVariants && values.variants.length > 0) {
    return values.variants.reduce((sum, variant) => sum + variant.stock, 0);
  }

  return values.stock;
}

const nullableNumberInput = {
  setValueAs: (value: string) => (value === "" ? null : Number(value)),
};

export default function ProductEditPage() {
  const [location, setLocation] = useLocation();
  const [matchEdit, editParams] = useRoute("/admin/products/:id/edit");
  const isNew = location.split("?")[0] === "/admin/products/new";
  const productId = matchEdit ? editParams.id : null;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const pendingImagesRef = useRef<QueuedProductImage[]>([]);

  const form = useForm<ProductEditFormValues>({
    resolver: zodResolver(productEditSchema),
    defaultValues: defaultValues(),
  });

  const [persistedImages, setPersistedImages] = useState<AdminProductImage[]>([]);
  const [pendingImages, setPendingImages] = useState<QueuedProductImage[]>([]);
  const [slugTouched, setSlugTouched] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => api.admin.categories.list(),
  });

  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => api.admin.products.get(productId!),
    enabled: Boolean(productId),
  });

  const guardNavigation = useUnsavedChangesPrompt(
    form.formState.isDirty || pendingImages.length > 0,
  );

  const flatCategories = useMemo(
    () => flattenCategories(categoriesQuery.data?.categories ?? []),
    [categoriesQuery.data?.categories],
  );

  const watchedName = form.watch("name");
  const watchedVariants = form.watch("variants");
  const watchedHasVariants = form.watch("hasVariants");
  const watchedPrice = form.watch("price");
  const watchedCompareAtPrice = form.watch("compareAtPrice");
  const watchedCostPrice = form.watch("costPrice");
  const watchedStock = form.watch("stock");
  const watchedStatus = form.watch("status");
  const watchedCategoryId = form.watch("categoryId") ?? "";
  const watchedTags = form.watch("tags");
  const watchedSlug = form.watch("slug");

  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);

  useEffect(() => {
    if (!slugTouched) {
      form.setValue("slug", slugify(watchedName), { shouldDirty: false });
    }
  }, [form, slugTouched, watchedName]);

  useEffect(() => {
    if (!productQuery.data) return;

    form.reset(mapDetailToForm(productQuery.data));
    setPersistedImages(productQuery.data.images);
    setPendingImages([]);
    setSlugTouched(Boolean(productQuery.data.product.slug));
  }, [form, productQuery.data]);

  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const priceSummary = useMemo(
    () =>
      watchedHasVariants && watchedVariants.length > 0
        ? getPricingSummary({
            ...form.getValues(),
            hasVariants: watchedHasVariants,
            variants: watchedVariants,
          })
        : {
            price: watchedPrice,
            compareAtPrice: watchedCompareAtPrice ?? null,
            costPrice: watchedCostPrice ?? null,
          },
    [
      form,
      watchedCompareAtPrice,
      watchedCostPrice,
      watchedHasVariants,
      watchedPrice,
      watchedVariants,
    ],
  );

  const stockSummary = useMemo(() => {
    if (watchedHasVariants && watchedVariants.length > 0) {
      return watchedVariants.reduce((sum, variant) => sum + variant.stock, 0);
    }
    return watchedStock;
  }, [watchedHasVariants, watchedStock, watchedVariants]);

  async function refreshProductImages(activeProductId = productId) {
    if (!activeProductId) return;
    const response = await api.admin.products.listImages(activeProductId);
    setPersistedImages(response.images);
    await queryClient.invalidateQueries({ queryKey: ["product", activeProductId] });
  }

  const uploadImagesMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (!productId) return;

      const hasPrimary = persistedImages.some((image) => image.isPrimary);
      for (const [index, file] of files.entries()) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "altText",
          file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        );
        formData.append("position", String(persistedImages.length + index));
        formData.append("isPrimary", String(!hasPrimary && index === 0));
        await api.admin.products.createImage(productId, formData);
      }
    },
    onSuccess: async () => {
      await refreshProductImages();
      toast({ title: "Images uploaded" });
    },
    onError: (error) => {
      toast({
        title: "Image upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: async ({
      imageId,
      payload,
    }: {
      imageId: string;
      payload: {
        altText?: string;
        position?: number;
        isPrimary?: boolean;
      };
    }) => {
      if (!productId) return;
      await api.admin.products.updateImage(productId, imageId, payload);
    },
    onError: (error) => {
      toast({
        title: "Image update failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      if (!productId) return;
      await api.admin.products.removeImage(productId, imageId);
    },
    onSuccess: async () => {
      await refreshProductImages();
      toast({ title: "Image removed" });
    },
    onError: (error) => {
      toast({
        title: "Image delete failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      if (!productId) return;
      await api.admin.products.update(productId, { status: "archived" });
    },
    onSuccess: async () => {
      form.setValue("status", "archived", { shouldDirty: false });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["product", productId] }),
      ]);
      toast({ title: "Product archived" });
    },
    onError: (error) => {
      toast({
        title: "Archive failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: ProductEditFormValues) => {
      const pricing = getPricingSummary(values);
      const stock = getStockSummary(values);

      const payload = {
        name: values.name,
        description: values.description,
        slug: values.slug,
        sku: values.hasVariants ? undefined : values.sku,
        price: pricing.price,
        compareAtPrice: pricing.compareAtPrice ?? undefined,
        costPrice: pricing.costPrice ?? undefined,
        stock,
        weight: values.weight ?? undefined,
        status: values.status,
        categoryId: values.categoryId || null,
        tags: values.tags,
        seoTitle: values.seoTitle,
        seoDescription: values.seoDescription,
        variants: values.hasVariants
          ? values.variants.map((variant, index) => ({
              sku: variant.sku,
              title: variant.title,
              attributes: variant.attributes,
              position: index,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice ?? undefined,
              costPrice: variant.costPrice ?? undefined,
              stock: variant.stock,
              isActive: variant.isActive,
            }))
          : [],
      };

      const detail = productId
        ? await api.admin.products.update(productId, payload)
        : await api.admin.products.create(payload);

      const savedId = detail.product.id;
      for (const [index, image] of pendingImages.entries()) {
        const formData = new FormData();
        formData.append("file", image.file);
        formData.append("altText", image.altText);
        formData.append("position", String(index));
        formData.append("isPrimary", String(image.isPrimary));
        await api.admin.products.createImage(savedId, formData);
      }

      return savedId;
    },
    onSuccess: async (savedId) => {
      toast({ title: "Product saved" });
      pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setPendingImages([]);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["product", savedId] }),
      ]);

      form.reset(form.getValues());

      if (!productId || savedId !== productId) {
        setLocation(`/admin/products/${savedId}/edit`, { replace: true });
      } else {
        await refreshProductImages(savedId);
      }
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  function queueFiles(files: File[]) {
    if (productId) {
      void uploadImagesMutation.mutateAsync(files);
      return;
    }

    setPendingImages((current) => {
      const hasPrimary = current.some((image) => image.isPrimary);
      const nextImages = files.map((file, index) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        altText: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        isPrimary: !hasPrimary && current.length === 0 && index === 0,
      }));
      return [...current, ...nextImages];
    });
  }

  async function updatePersistedImage(
    imageId: string,
    payload: {
      altText?: string;
      position?: number;
      isPrimary?: boolean;
    },
  ) {
    if (!productId) return;
    await updateImageMutation.mutateAsync({ imageId, payload });
    await refreshProductImages();
  }

  const nameField = form.register("name");
  const slugField = form.register("slug");
  const descriptionField = form.register("description");
  const skuField = form.register("sku");
  const weightField = form.register("weight", nullableNumberInput);
  const seoTitleField = form.register("seoTitle");
  const seoDescriptionField = form.register("seoDescription");

  const productName = productQuery.data?.product.name || watchedName || "New Product";
  const canSave = form.formState.isDirty || pendingImages.length > 0;
  const loadingEdit = Boolean(productId) && productQuery.isPending;
  const slugPreviewBase =
    typeof window === "undefined" ? "https://nepalixx.com" : window.location.origin;

  if (productId && productQuery.isError) {
    return (
      <AdminLayout
        title="Product"
        subtitle="We couldn’t load this product."
        actions={
          <Button type="button" variant="outline" onClick={() => void productQuery.refetch()}>
            Retry
          </Button>
        }
      >
        <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-6 text-[#991B1B] shadow-sm">
          <p className="text-sm font-semibold">The product could not be loaded.</p>
          <p className="mt-2 text-sm">
            {productQuery.error instanceof Error
              ? productQuery.error.message
              : "Please try again."}
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isNew ? "New Product" : productName}
      subtitle={
        isNew
          ? "Create a product with variants, images, and search metadata."
          : "Manage product details, inventory, media, and merchandising."
      }
      actions={
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => guardNavigation(() => setLocation("/admin/products"))}
          >
            Back to products
          </Button>
          <Button
            type="submit"
            form="product-edit-form"
            disabled={!canSave || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Product"
            )}
          </Button>
        </div>
      }
    >
      <div className="mb-6 flex items-center gap-2 text-sm text-[#6B7280]">
        <button
          type="button"
          className="transition-colors hover:text-[#111827]"
          onClick={() => guardNavigation(() => setLocation("/admin"))}
        >
          Admin
        </button>
        <ChevronRight className="h-4 w-4" />
        <button
          type="button"
          className="transition-colors hover:text-[#111827]"
          onClick={() => guardNavigation(() => setLocation("/admin/products"))}
        >
          Products
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-[#111827]">{isNew ? "New Product" : productName}</span>
      </div>

      {loadingEdit ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          <div className="space-y-6">
            <Skeleton className="h-[260px] w-full rounded-2xl" />
            <Skeleton className="h-[320px] w-full rounded-2xl" />
            <Skeleton className="h-[340px] w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <Skeleton className="h-[240px] w-full rounded-2xl" />
          </div>
        </div>
      ) : (
        <form
          id="product-edit-form"
          className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]"
          onSubmit={form.handleSubmit((values) => void saveMutation.mutateAsync(values))}
        >
          <div className="space-y-6">
            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-[#111827]">Basic Info</h3>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Set the core details customers and search engines will see first.
                </p>
              </div>

              <div className="grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">
                    Product Name
                  </label>
                  <Input
                    {...nameField}
                    placeholder="Classic Hoodie"
                    onChange={(event) => nameField.onChange(event)}
                  />
                  {form.formState.errors.name && (
                    <p className="mt-2 text-sm text-[#DC2626]">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">
                    Description
                  </label>
                  <Textarea
                    {...descriptionField}
                    rows={6}
                    placeholder="Describe the product, materials, sizing, and what makes it special."
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#111827]">Slug</label>
                    <Input
                      {...slugField}
                      placeholder="classic-hoodie"
                      onChange={(event) => {
                        setSlugTouched(true);
                        slugField.onChange(event);
                      }}
                    />
                    {form.formState.errors.slug && (
                      <p className="mt-2 text-sm text-[#DC2626]">
                        {form.formState.errors.slug.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#111827]">
                      Default SKU
                    </label>
                    <Input
                      {...skuField}
                      placeholder="HD-001"
                      disabled={watchedHasVariants}
                    />
                    <p className="mt-2 text-xs text-[#6B7280]">
                      Used when the product does not have variants.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">
                    Weight
                  </label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    {...weightField}
                    placeholder="0.75"
                  />
                </div>
              </div>
            </section>

            <VariantEditor
              control={form.control}
              register={form.register}
              watch={form.watch}
              setValue={form.setValue}
            />

            <ImageManager
              productId={productId}
              images={persistedImages}
              pendingImages={pendingImages}
              onQueueFiles={queueFiles}
              onPendingAltChange={(id, altText) => {
                setPendingImages((current) =>
                  current.map((image) => (image.id === id ? { ...image, altText } : image)),
                );
              }}
              onPendingDelete={(id) => {
                setPendingImages((current) => {
                  const image = current.find((item) => item.id === id);
                  if (image) URL.revokeObjectURL(image.previewUrl);
                  const next = current.filter((item) => item.id !== id);
                  if (next.length > 0 && !next.some((item) => item.isPrimary)) {
                    next[0] = { ...next[0], isPrimary: true };
                  }
                  return next;
                });
              }}
              onPendingSetPrimary={(id) => {
                setPendingImages((current) =>
                  current.map((image) => ({
                    ...image,
                    isPrimary: image.id === id,
                  })),
                );
              }}
              onPendingReorder={(dragId, dropId) => {
                setPendingImages((current) => reorderQueuedImages(current, dragId, dropId));
              }}
              onPersistedAltUpdate={(id, altText) => {
                const existing = persistedImages.find((image) => image.id === id);
                if ((existing?.altText ?? "") === altText) return;
                setPersistedImages((current) =>
                  current.map((image) => (image.id === id ? { ...image, altText } : image)),
                );
                void updatePersistedImage(id, { altText });
              }}
              onPersistedDelete={(id) => {
                if (!window.confirm("Delete this product image?")) return;
                setPersistedImages((current) => current.filter((image) => image.id !== id));
                void deleteImageMutation.mutateAsync(id);
              }}
              onPersistedSetPrimary={(id) => {
                setPersistedImages((current) =>
                  current.map((image) => ({
                    ...image,
                    isPrimary: image.id === id,
                  })),
                );
                void updatePersistedImage(id, { isPrimary: true });
              }}
              onPersistedReorder={(id, position) => {
                setPersistedImages((current) =>
                  reorderPersistedImages(current, id, position),
                );
                void updatePersistedImage(id, { position });
              }}
            />

            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-[#111827]">SEO</h3>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Fine-tune how this product appears in search and previews.
                </p>
              </div>

              <div className="grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">
                    SEO Title
                  </label>
                  <Input {...seoTitleField} placeholder="Classic Hoodie | Nepalixx Store" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">
                    SEO Description
                  </label>
                  <Textarea
                    {...seoDescriptionField}
                    rows={4}
                    placeholder="Write a concise summary for search snippets and social cards."
                  />
                </div>

                <div className="rounded-lg border border-dashed border-[#D8DEE8] bg-[#F9FAFB] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">
                    URL Preview
                  </p>
                  <p className="mt-2 text-sm text-[#111827]">
                    {slugPreviewBase}/products/{watchedSlug || "your-product-slug"}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <ProductSidebar
            status={watchedStatus}
            onStatusChange={(next) =>
              form.setValue("status", next, { shouldDirty: true, shouldValidate: true })
            }
            categoryId={watchedCategoryId}
            onCategoryChange={(next) =>
              form.setValue("categoryId", next || null, { shouldDirty: true })
            }
            categories={flatCategories}
            tags={watchedTags}
            onTagsChange={(next) => form.setValue("tags", next, { shouldDirty: true })}
            price={priceSummary.price}
            compareAtPrice={priceSummary.compareAtPrice}
            costPrice={priceSummary.costPrice}
            stockSummary={stockSummary}
            onArchive={() => {
              if (!productId) return;
              if (!window.confirm("Archive this product? It can be restored later.")) return;
              void archiveMutation.mutateAsync();
            }}
            showDangerZone={Boolean(productId)}
          />
        </form>
      )}
    </AdminLayout>
  );
}
