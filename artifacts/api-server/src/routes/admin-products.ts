import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import {
  categoriesTable,
  db,
  productImagesTable,
  productVariantsTable,
  productsTable,
  type Category,
  type Product,
  type ProductImage,
  type ProductVariant,
} from "@workspace/db";
import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";
import {
  resolveTenantContext,
  type TenantRequest,
} from "../middlewares/tenant.js";
import { uploadMediaAsset } from "../lib/media-upload.js";
import { incrementStoreUsage } from "../lib/usage.js";

const productStatusValues = ["draft", "active", "archived"] as const;
type ProductStatus = (typeof productStatusValues)[number];
type DbClient = typeof db;

type NormalizedVariantInput = {
  sku: string | null;
  title: string;
  attributes: Record<string, string>;
  position: number;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  currency: string;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
};

type NormalizedImageInput = {
  url: string;
  altText: string | null;
  position: number;
  isPrimary: boolean;
  variantId: string | null;
};

const sharedAdminMiddleware = [
  authMiddleware,
  resolveTenantContext,
  requireAdminPage("products"),
] as const;

const router: IRouter = Router();
export const categoriesRouter: IRouter = Router();

router.use(...sharedAdminMiddleware);
categoriesRouter.use(...sharedAdminMiddleware);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const optionalTextSchema = z.union([z.string(), z.literal(""), z.null()]).optional();
const optionalUuidSchema = z.union([z.string().uuid(), z.literal(""), z.null()]).optional();
const optionalUrlSchema = z.union([z.string().url(), z.literal(""), z.null()]).optional();
const statusSchema = z.enum(productStatusValues);

const variantInputSchema = z.object({
  sku: optionalTextSchema,
  title: optionalTextSchema,
  attributes: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  position: z.coerce.number().int().min(0).optional(),
  price: z.coerce.number().int().min(0).default(0),
  compareAtPrice: z.coerce.number().int().min(0).optional(),
  comparePrice: z.coerce.number().int().min(0).optional(),
  costPrice: z.coerce.number().int().min(0).optional(),
  currency: optionalTextSchema,
  stock: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(10),
  isActive: z.union([z.boolean(), z.string(), z.number()]).optional(),
});

const imageInputSchema = z.object({
  url: z.string().url(),
  altText: optionalTextSchema,
  alt: optionalTextSchema,
  position: z.coerce.number().int().min(0).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isPrimary: z.union([z.boolean(), z.string(), z.number()]).optional(),
  variantId: optionalUuidSchema,
});

const createProductSchema = z.object({
  name: z.string().trim().min(1),
  slug: optionalTextSchema,
  description: optionalTextSchema,
  sku: optionalTextSchema,
  price: z.coerce.number().int().min(0).default(0),
  compareAtPrice: z.coerce.number().int().min(0).optional(),
  comparePrice: z.coerce.number().int().min(0).optional(),
  costPrice: z.coerce.number().int().min(0).optional(),
  currency: optionalTextSchema,
  stock: z.coerce.number().int().min(0).default(0),
  categoryId: optionalUuidSchema,
  weight: z.coerce.number().int().min(0).optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  seoTitle: optionalTextSchema,
  seoDescription: optionalTextSchema,
  featuredImageUrl: optionalUrlSchema,
  status: statusSchema.optional(),
  isActive: z.union([z.boolean(), z.string(), z.number()]).optional(),
  variants: z.array(variantInputSchema).default([]),
  productImages: z.array(imageInputSchema).default([]),
  images: z.union([z.array(z.string().url()), z.array(imageInputSchema)]).optional(),
});

const updateProductSchema = createProductSchema.partial();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
  offset: z.coerce.number().int().min(0).optional(),
  q: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  categoryId: z.string().uuid().optional(),
  status: z.union([statusSchema, z.literal("all")]).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  inStock: z
    .preprocess((value) => parseBooleanInput(value), z.boolean().optional())
    .optional(),
  sortBy: z
    .enum(["name", "price", "createdAt", "updatedAt", "stock", "newest", "oldest"])
    .optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

const bulkActionSchema = z.object({
  action: z.enum(["archive", "activate", "delete", "updateCategory"]),
  ids: z.array(z.string().uuid()).min(1),
  payload: z
    .object({
      categoryId: optionalUuidSchema,
    })
    .passthrough()
    .optional(),
});

const categorySchema = z.object({
  name: z.string().trim().min(1),
  slug: optionalTextSchema,
  parentId: optionalUuidSchema,
  imageUrl: optionalUrlSchema,
  position: z.coerce.number().int().min(0).default(0),
});

const updateCategorySchema = categorySchema.partial();

const productSelect = {
  ...getTableColumns(productsTable),
  joinedCategoryId: categoriesTable.id,
  joinedCategoryStoreId: categoriesTable.storeId,
  categoryName: categoriesTable.name,
  categorySlug: categoriesTable.slug,
  categoryParentId: categoriesTable.parentId,
  categoryImageUrl: categoriesTable.imageUrl,
  categoryPosition: categoriesTable.position,
  categoryCreatedAt: categoriesTable.createdAt,
  categoryUpdatedAt: categoriesTable.updatedAt,
};

function parseBooleanInput(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  return undefined;
}

function trimToNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function normalizeTags(value: string[] | string | undefined): string[] {
  const rawValues = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return Array.from(
    new Set(
      rawValues
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  );
}

function firstNumber(...values: Array<number | null | undefined>): number | null {
  const match = values.find((value) => typeof value === "number" && Number.isFinite(value));
  return typeof match === "number" ? match : null;
}

function resolveStatus(
  status: ProductStatus | undefined,
  isActiveInput: boolean | undefined,
  currentStatus: ProductStatus = "active",
): ProductStatus {
  if (status) return status;
  if (typeof isActiveInput === "boolean") {
    return isActiveInput ? "active" : "archived";
  }
  return currentStatus;
}

function buildVariantTitle(
  attributes: Record<string, string>,
  titleInput: string | null,
  sku: string | null,
): string {
  if (titleInput) return titleInput;
  const attributeTitle = Object.values(attributes)
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" / ");
  if (attributeTitle) return attributeTitle;
  if (sku) return sku;
  return "Default";
}

function normalizeVariantInputs(
  variants: Array<z.infer<typeof variantInputSchema>>,
): NormalizedVariantInput[] {
  const prepared = variants.map((variant, index) => {
    const attributeEntries = Object.entries(variant.attributes ?? {})
      .map(([key, rawValue]) => [key.trim(), String(rawValue).trim()] as const)
      .filter(([key, value]) => key.length > 0 && value.length > 0);
    const attributes = Object.fromEntries(attributeEntries);
    const sku = trimToNull(variant.sku);
    return {
      sku,
      title: buildVariantTitle(attributes, trimToNull(variant.title), sku),
      attributes,
      position: typeof variant.position === "number" ? variant.position : index,
      price: variant.price,
      compareAtPrice: firstNumber(variant.compareAtPrice, variant.comparePrice),
      costPrice: firstNumber(variant.costPrice),
      currency: trimToNull(variant.currency) ?? "NPR",
      stock: variant.stock,
      lowStockThreshold: variant.lowStockThreshold,
      isActive: parseBooleanInput(variant.isActive) ?? true,
    };
  });

  prepared.sort((left, right) => left.position - right.position);
  return prepared.map((variant, index) => ({ ...variant, position: index }));
}

function normalizeImageInputs(
  images: Array<z.infer<typeof imageInputSchema>>,
): NormalizedImageInput[] {
  const prepared = images.map((image, index) => ({
    url: image.url,
    altText: trimToNull(image.altText) ?? trimToNull(image.alt),
    position:
      typeof image.position === "number"
        ? image.position
        : typeof image.sortOrder === "number"
          ? image.sortOrder
          : index,
    isPrimary: parseBooleanInput(image.isPrimary) ?? false,
    variantId: trimToNull(image.variantId),
  }));

  prepared.sort((left, right) => left.position - right.position);
  const primaryIndex = prepared.findIndex((image) => image.isPrimary);
  return prepared.map((image, index) => ({
    ...image,
    position: index,
    isPrimary: primaryIndex === -1 ? index === 0 : index === primaryIndex,
  }));
}

function extractImagePayload(
  value: z.infer<typeof createProductSchema> | z.infer<typeof updateProductSchema>,
): NormalizedImageInput[] | undefined {
  if (Array.isArray(value.productImages)) {
    return normalizeImageInputs(value.productImages);
  }
  if (!Array.isArray(value.images)) {
    return undefined;
  }
  if (value.images.length === 0) {
    return [];
  }
  if (typeof value.images[0] === "string") {
    return normalizeImageInputs(
      (value.images as string[]).map((url, index) => ({
        url,
        position: index,
        isPrimary: index === 0,
      })),
    );
  }
  return normalizeImageInputs(value.images as Array<z.infer<typeof imageInputSchema>>);
}

function buildCategoryTree(categories: Category[]) {
  const nodes = categories
    .slice()
    .sort((left, right) => left.position - right.position || left.name.localeCompare(right.name))
    .map((category) => ({
      ...category,
      children: [] as Array<Category & { children: unknown[] }>,
    }));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const roots: typeof nodes = [];

  for (const node of nodes) {
    if (node.parentId) {
      const parent = byId.get(node.parentId);
      if (parent) {
        parent.children.push(node);
        continue;
      }
    }
    roots.push(node);
  }

  return roots;
}

function serializeVariant(variant: ProductVariant) {
  return {
    ...variant,
    comparePrice: variant.compareAtPrice ?? null,
  };
}

function serializeImage(image: ProductImage) {
  return {
    ...image,
    alt: image.altText ?? null,
    sortOrder: image.position,
  };
}

function splitProductRow(row: Record<string, unknown>): { product: Product; category: Category | null } {
  const {
    joinedCategoryId,
    joinedCategoryStoreId,
    categoryName,
    categorySlug,
    categoryParentId,
    categoryImageUrl,
    categoryPosition,
    categoryCreatedAt,
    categoryUpdatedAt,
    ...productColumns
  } = row;

  const category =
    typeof joinedCategoryId === "string"
      ? ({
          id: joinedCategoryId,
          storeId:
            (joinedCategoryStoreId as string | null | undefined) ??
            (productColumns.storeId as string),
          name: (categoryName as string | null | undefined) ?? "",
          slug: (categorySlug as string | null | undefined) ?? "",
          parentId: (categoryParentId as string | null | undefined) ?? null,
          imageUrl: (categoryImageUrl as string | null | undefined) ?? null,
          position: (categoryPosition as number | null | undefined) ?? 0,
          createdAt:
            (categoryCreatedAt as Date | null | undefined) ?? new Date(0),
          updatedAt:
            (categoryUpdatedAt as Date | null | undefined) ?? new Date(0),
        } satisfies Category)
      : null;

  return { product: productColumns as Product, category };
}

function serializeProduct(
  product: Product,
  extras: {
    category?: Category | null;
    firstImage?: ProductImage | null;
    variantCount?: number;
    totalStock?: number;
  } = {},
) {
  return {
    ...product,
    comparePrice: product.compareAtPrice ?? null,
    category: extras.category ?? null,
    firstImage: extras.firstImage ? serializeImage(extras.firstImage) : null,
    variantCount: extras.variantCount ?? 0,
    totalStock: extras.totalStock ?? product.totalStock ?? product.stock,
  };
}

function resolveProductOrder(
  sortBy: z.infer<typeof listQuerySchema>["sortBy"],
  sortDir: z.infer<typeof listQuerySchema>["sortDir"],
) {
  const direction = sortDir ?? "desc";
  switch (sortBy) {
    case "name":
      return [direction === "asc" ? asc(productsTable.name) : desc(productsTable.name)];
    case "price":
      return [direction === "asc" ? asc(productsTable.price) : desc(productsTable.price)];
    case "stock":
      return [
        direction === "asc" ? asc(productsTable.totalStock) : desc(productsTable.totalStock),
      ];
    case "updatedAt":
      return [
        direction === "asc"
          ? asc(productsTable.updatedAt)
          : desc(productsTable.updatedAt),
      ];
    case "oldest":
      return [asc(productsTable.createdAt)];
    case "createdAt":
      return [
        direction === "asc"
          ? asc(productsTable.createdAt)
          : desc(productsTable.createdAt),
      ];
    case "newest":
    default:
      return [desc(productsTable.createdAt)];
  }
}

async function ensureProductExists(
  client: DbClient,
  storeId: string,
  productId: string,
): Promise<Product | null> {
  const [product] = await client
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.id, productId), eq(productsTable.storeId, storeId)))
    .limit(1);
  return product ?? null;
}

async function normalizeProductImages(
  client: DbClient,
  storeId: string,
  productId: string,
): Promise<ProductImage[]> {
  const images = await client
    .select()
    .from(productImagesTable)
    .where(
      and(
        eq(productImagesTable.storeId, storeId),
        eq(productImagesTable.productId, productId),
      ),
    )
    .orderBy(asc(productImagesTable.position), asc(productImagesTable.createdAt));

  if (images.length === 0) {
    await client
      .update(productsTable)
      .set({
        images: [],
        featuredImageUrl: null,
        updatedAt: new Date(),
      })
      .where(and(eq(productsTable.id, productId), eq(productsTable.storeId, storeId)));
    return [];
  }

  const preferredPrimary =
    images.find((image) => image.isPrimary)?.id ?? images[0]?.id ?? null;
  const normalized = images.map((image, index) => ({
    ...image,
    position: index,
    isPrimary: image.id === preferredPrimary,
  }));

  for (const image of normalized) {
    const original = images.find((candidate) => candidate.id === image.id);
    if (
      original &&
      (original.position !== image.position || original.isPrimary !== image.isPrimary)
    ) {
      await client
        .update(productImagesTable)
        .set({
          position: image.position,
          isPrimary: image.isPrimary,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(productImagesTable.id, image.id),
            eq(productImagesTable.storeId, storeId),
            eq(productImagesTable.productId, productId),
          ),
        );
    }
  }

  await client
    .update(productsTable)
    .set({
      images: normalized.map((image) => image.url),
      featuredImageUrl:
        normalized.find((image) => image.isPrimary)?.url ?? normalized[0]?.url ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(productsTable.id, productId), eq(productsTable.storeId, storeId)));

  return normalized;
}

async function syncProductStock(
  client: DbClient,
  storeId: string,
  productId: string,
  fallbackStock?: number,
): Promise<{ variants: ProductVariant[]; totalStock: number }> {
  const variants = await client
    .select()
    .from(productVariantsTable)
    .where(
      and(
        eq(productVariantsTable.storeId, storeId),
        eq(productVariantsTable.productId, productId),
      ),
    )
    .orderBy(asc(productVariantsTable.position), asc(productVariantsTable.createdAt));

  for (const [index, variant] of variants.entries()) {
    if (variant.position !== index) {
      await client
        .update(productVariantsTable)
        .set({ position: index, updatedAt: new Date() })
        .where(
          and(
            eq(productVariantsTable.id, variant.id),
            eq(productVariantsTable.storeId, storeId),
            eq(productVariantsTable.productId, productId),
          ),
        );
    }
  }

  const totalStock =
    variants.length > 0
      ? variants.reduce((sum, variant) => sum + variant.stock, 0)
      : Math.max(0, fallbackStock ?? 0);

  await client
    .update(productsTable)
    .set({
      stock: totalStock,
      totalStock,
      updatedAt: new Date(),
    })
    .where(and(eq(productsTable.id, productId), eq(productsTable.storeId, storeId)));

  return { variants, totalStock };
}

async function loadProductDetail(
  storeId: string,
  productId: string,
  client: DbClient = db,
) {
  const [row] = await client
    .select(productSelect)
    .from(productsTable)
    .leftJoin(
      categoriesTable,
      and(
        eq(categoriesTable.id, productsTable.categoryId),
        eq(categoriesTable.storeId, productsTable.storeId),
      ),
    )
    .where(and(eq(productsTable.id, productId), eq(productsTable.storeId, storeId)))
    .limit(1);

  if (!row) {
    return null;
  }

  const { product, category } = splitProductRow(row as Record<string, unknown>);
  const [variants, images] = await Promise.all([
    client
      .select()
      .from(productVariantsTable)
      .where(
        and(
          eq(productVariantsTable.productId, productId),
          eq(productVariantsTable.storeId, storeId),
        ),
      )
      .orderBy(asc(productVariantsTable.position), asc(productVariantsTable.createdAt)),
    client
      .select()
      .from(productImagesTable)
      .where(
        and(
          eq(productImagesTable.productId, productId),
          eq(productImagesTable.storeId, storeId),
        ),
      )
      .orderBy(asc(productImagesTable.position), asc(productImagesTable.createdAt)),
  ]);

  const firstImage = images.find((image) => image.isPrimary) ?? images[0] ?? null;
  const derivedStock =
    variants.length > 0
      ? variants.reduce((sum, variant) => sum + variant.stock, 0)
      : product.totalStock ?? product.stock;

  return {
    product: serializeProduct(product, {
      category,
      firstImage,
      variantCount: variants.length,
      totalStock: derivedStock,
    }),
    variants: variants.map(serializeVariant),
    images: images.map(serializeImage),
    category,
  };
}

async function parseImageUploadRequest(req: Request, res: Response) {
  if (!req.is("multipart/form-data")) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    upload.single("file")(req, res, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

router.get("/stats", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${productsTable.status} = 'active')::int`,
      draft: sql<number>`count(*) filter (where ${productsTable.status} = 'draft')::int`,
      archived: sql<number>`count(*) filter (where ${productsTable.status} = 'archived')::int`,
      outOfStock: sql<number>`count(*) filter (where coalesce(${productsTable.totalStock}, ${productsTable.stock}, 0) <= 0)::int`,
    })
    .from(productsTable)
    .where(eq(productsTable.storeId, storeId));

  res.json({ stats });
});

router.get("/", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
    return;
  }

  const {
    categoryId,
    inStock,
    limit,
    maxPrice,
    minPrice,
    offset,
    page,
    q,
    search,
    sortBy,
    sortDir,
    status,
  } = parsed.data;

  const resolvedOffset = typeof offset === "number" ? offset : (page - 1) * limit;
  const searchTerm = search ?? q;
  const filters = [eq(productsTable.storeId, storeId)];

  if (searchTerm) {
    const pattern = `%${searchTerm}%`;
    filters.push(
      or(
        ilike(productsTable.name, pattern),
        ilike(productsTable.slug, pattern),
        ilike(productsTable.sku, pattern),
        ilike(productsTable.description, pattern),
      )!,
    );
  }

  if (categoryId) {
    filters.push(eq(productsTable.categoryId, categoryId));
  }

  if (status && status !== "all") {
    filters.push(eq(productsTable.status, status));
  }

  if (typeof minPrice === "number") {
    filters.push(gte(productsTable.price, minPrice));
  }

  if (typeof maxPrice === "number") {
    filters.push(lte(productsTable.price, maxPrice));
  }

  if (inStock === true) {
    filters.push(gte(productsTable.totalStock, 1));
  }

  if (inStock === false) {
    filters.push(lte(productsTable.totalStock, 0));
  }

  const where = and(...filters);
  const rows = await db
    .select(productSelect)
    .from(productsTable)
    .leftJoin(
      categoriesTable,
      and(
        eq(categoriesTable.id, productsTable.categoryId),
        eq(categoriesTable.storeId, productsTable.storeId),
      ),
    )
    .where(where)
    .orderBy(...resolveProductOrder(sortBy, sortDir))
    .limit(limit)
    .offset(resolvedOffset);

  const [{ count: total }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(where);

  const productIds = rows.map((row) => row.id);
  const variantCounts =
    productIds.length > 0
      ? await db
          .select({
            productId: productVariantsTable.productId,
            variantCount: sql<number>`count(*)::int`,
            totalStock: sql<number>`coalesce(sum(${productVariantsTable.stock}), 0)::int`,
          })
          .from(productVariantsTable)
          .where(
            and(
              eq(productVariantsTable.storeId, storeId),
              inArray(productVariantsTable.productId, productIds),
            ),
          )
          .groupBy(productVariantsTable.productId)
      : [];

  const firstImages =
    productIds.length > 0
      ? await db
          .select()
          .from(productImagesTable)
          .where(
            and(
              eq(productImagesTable.storeId, storeId),
              inArray(productImagesTable.productId, productIds),
            ),
          )
          .orderBy(
            asc(productImagesTable.productId),
            desc(productImagesTable.isPrimary),
            asc(productImagesTable.position),
            asc(productImagesTable.createdAt),
          )
      : [];

  const countsByProductId = new Map(
    variantCounts.map((item) => [item.productId, item]),
  );
  const firstImageByProductId = new Map<string, ProductImage>();

  for (const image of firstImages) {
    if (!firstImageByProductId.has(image.productId)) {
      firstImageByProductId.set(image.productId, image);
    }
  }

  const products = rows.map((row) => {
    const { product, category } = splitProductRow(row as Record<string, unknown>);
    const counts = countsByProductId.get(product.id);
    return serializeProduct(product, {
      category,
      firstImage: firstImageByProductId.get(product.id) ?? null,
      variantCount: counts?.variantCount ?? 0,
      totalStock: counts?.totalStock ?? product.totalStock ?? product.stock,
    });
  });

  res.json({
    products,
    total,
    page,
    limit,
    totalPages: total === 0 ? 1 : Math.ceil(total / limit),
  });
});

router.get("/:id", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const productId = req.params.id as string;
  const detail = await loadProductDetail(storeId, productId);
  if (!detail) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(detail);
});

router.post("/", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const input = parsed.data;
  const normalizedVariants = normalizeVariantInputs(input.variants ?? []);
  const normalizedImages = extractImagePayload(input) ?? [];
  const resolvedStatus = resolveStatus(
    input.status,
    parseBooleanInput(input.isActive),
    "active",
  );
  const derivedStock =
    normalizedVariants.length > 0
      ? normalizedVariants.reduce((sum, variant) => sum + variant.stock, 0)
      : input.stock;

  const productId = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(productsTable)
      .values({
        storeId,
        name: input.name.trim(),
        slug: trimToNull(input.slug) ?? toSlug(input.name),
        description: trimToNull(input.description),
        sku: trimToNull(input.sku),
        price: input.price,
        compareAtPrice: firstNumber(input.compareAtPrice, input.comparePrice),
        costPrice: firstNumber(input.costPrice),
        currency: trimToNull(input.currency) ?? "NPR",
        categoryId: trimToNull(input.categoryId),
        weight: firstNumber(input.weight),
        tags: normalizeTags(input.tags),
        seoTitle: trimToNull(input.seoTitle),
        seoDescription: trimToNull(input.seoDescription),
        featuredImageUrl: trimToNull(input.featuredImageUrl),
        stock: derivedStock,
        totalStock: derivedStock,
        status: resolvedStatus,
        isActive: resolvedStatus === "active",
      })
      .returning();

    if (normalizedVariants.length > 0) {
      await tx.insert(productVariantsTable).values(
        normalizedVariants.map((variant) => ({
          storeId,
          productId: created.id,
          ...variant,
        })),
      );
    }

    if (normalizedImages.length > 0) {
      await tx.insert(productImagesTable).values(
        normalizedImages.map((image) => ({
          storeId,
          productId: created.id,
          ...image,
        })),
      );
      await normalizeProductImages(tx as unknown as DbClient, storeId, created.id);
    }

    await syncProductStock(tx as unknown as DbClient, storeId, created.id, input.stock);
    return created.id;
  });

  await incrementStoreUsage(storeId, "products", 1);

  const detail = await loadProductDetail(storeId, productId);
  res.status(201).json(detail);
});

async function handleProductUpdate(
  req: TenantRequest,
  res: Response,
  method: "patch" | "put",
) {
  const productId = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const existing = await ensureProductExists(db, storeId, productId);
  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const input = parsed.data;
  const normalizedVariants = Array.isArray(input.variants)
    ? normalizeVariantInputs(input.variants)
    : undefined;
  const normalizedImages =
    Object.prototype.hasOwnProperty.call(input, "productImages") ||
    Object.prototype.hasOwnProperty.call(input, "images")
      ? extractImagePayload(input) ?? []
      : undefined;

  const patch: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (typeof input.name === "string") {
    patch.name = input.name.trim();
    if (input.slug === undefined) {
      patch.slug = existing.slug ?? toSlug(input.name);
    }
  }

  if (input.slug !== undefined) {
    patch.slug =
      trimToNull(input.slug) ??
      (typeof input.name === "string" ? toSlug(input.name) : existing.slug);
  }

  if (input.description !== undefined) patch.description = trimToNull(input.description);
  if (input.sku !== undefined) patch.sku = trimToNull(input.sku);
  if (typeof input.price === "number") patch.price = input.price;
  if (input.compareAtPrice !== undefined || input.comparePrice !== undefined) {
    patch.compareAtPrice = firstNumber(input.compareAtPrice, input.comparePrice);
  }
  if (input.costPrice !== undefined) patch.costPrice = firstNumber(input.costPrice);
  if (input.currency !== undefined) patch.currency = trimToNull(input.currency) ?? "NPR";
  if (input.categoryId !== undefined) patch.categoryId = trimToNull(input.categoryId);
  if (input.weight !== undefined) patch.weight = firstNumber(input.weight);
  if (input.tags !== undefined) patch.tags = normalizeTags(input.tags);
  if (input.seoTitle !== undefined) patch.seoTitle = trimToNull(input.seoTitle);
  if (input.seoDescription !== undefined) {
    patch.seoDescription = trimToNull(input.seoDescription);
  }
  if (input.featuredImageUrl !== undefined) {
    patch.featuredImageUrl = trimToNull(input.featuredImageUrl);
  }
  if (typeof input.stock === "number") {
    patch.stock = input.stock;
    patch.totalStock = input.stock;
  }
  if (input.status !== undefined || input.isActive !== undefined) {
    const nextStatus = resolveStatus(
      input.status,
      parseBooleanInput(input.isActive),
      existing.status,
    );
    patch.status = nextStatus;
    patch.isActive = nextStatus === "active";
  }

  await db.transaction(async (tx) => {
    if (Object.keys(patch).length > 1 || method === "put") {
      await tx
        .update(productsTable)
        .set(patch)
        .where(and(eq(productsTable.id, productId), eq(productsTable.storeId, storeId)));
    }

    if (normalizedVariants) {
      await tx
        .delete(productVariantsTable)
        .where(
          and(
            eq(productVariantsTable.productId, productId),
            eq(productVariantsTable.storeId, storeId),
          ),
        );

      if (normalizedVariants.length > 0) {
        await tx.insert(productVariantsTable).values(
          normalizedVariants.map((variant) => ({
            storeId,
            productId,
            ...variant,
          })),
        );
      }
    }

    if (normalizedImages) {
      await tx
        .delete(productImagesTable)
        .where(
          and(
            eq(productImagesTable.productId, productId),
            eq(productImagesTable.storeId, storeId),
          ),
        );

      if (normalizedImages.length > 0) {
        await tx.insert(productImagesTable).values(
          normalizedImages.map((image) => ({
            storeId,
            productId,
            ...image,
          })),
        );
      }

      await normalizeProductImages(tx as unknown as DbClient, storeId, productId);
    }

    const fallbackStock =
      typeof input.stock === "number" ? input.stock : existing.stock;
    await syncProductStock(
      tx as unknown as DbClient,
      storeId,
      productId,
      fallbackStock,
    );
  });

  const detail = await loadProductDetail(storeId, productId);
  res.json(detail);
}

router.patch("/:id", async (req: TenantRequest, res: Response) => {
  await handleProductUpdate(req, res, "patch");
});

router.put("/:id", async (req: TenantRequest, res: Response) => {
  await handleProductUpdate(req, res, "put");
});

router.delete("/:id", async (req: TenantRequest, res: Response) => {
  const productId = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const [product] = await db
    .update(productsTable)
    .set({
      status: "archived",
      isActive: false,
      updatedAt: new Date(),
    })
    .where(and(eq(productsTable.id, productId), eq(productsTable.storeId, storeId)))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({ success: true, product: serializeProduct(product) });
});

router.post("/bulk", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const parsed = bulkActionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const { action, ids, payload } = parsed.data;
  let updateValues: Record<string, unknown> | null = null;

  if (action === "archive" || action === "delete") {
    updateValues = {
      status: "archived",
      isActive: false,
      updatedAt: new Date(),
    };
  }

  if (action === "activate") {
    updateValues = {
      status: "active",
      isActive: true,
      updatedAt: new Date(),
    };
  }

  if (action === "updateCategory") {
    updateValues = {
      categoryId: trimToNull(payload?.categoryId),
      updatedAt: new Date(),
    };
  }

  if (!updateValues) {
    res.status(400).json({ error: "Unsupported action" });
    return;
  }

  const products = await db
    .update(productsTable)
    .set(updateValues)
    .where(and(eq(productsTable.storeId, storeId), inArray(productsTable.id, ids)))
    .returning();

  res.json({
    success: true,
    updated: products.length,
    products: products.map((product) => serializeProduct(product)),
  });
});

router.get("/:id/variants", async (req: TenantRequest, res: Response) => {
  const productId = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const product = await ensureProductExists(db, storeId, productId);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const variants = await db
    .select()
    .from(productVariantsTable)
    .where(
      and(
        eq(productVariantsTable.productId, productId),
        eq(productVariantsTable.storeId, storeId),
      ),
    )
    .orderBy(asc(productVariantsTable.position), asc(productVariantsTable.createdAt));

  res.json({ variants: variants.map(serializeVariant) });
});

router.post("/:id/variants", async (req: TenantRequest, res: Response) => {
  const productId = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const product = await ensureProductExists(db, storeId, productId);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const parsed = variantInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const [variantInput] = normalizeVariantInputs([parsed.data]);
  const [{ count: currentCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productVariantsTable)
    .where(
      and(
        eq(productVariantsTable.storeId, storeId),
        eq(productVariantsTable.productId, productId),
      ),
    );

  const [variant] = await db
    .insert(productVariantsTable)
    .values({
      storeId,
      productId,
      ...variantInput,
      position: currentCount,
    })
    .returning();

  await syncProductStock(db, storeId, productId, product.stock);
  res.status(201).json({ variant: serializeVariant(variant) });
});

async function handleVariantUpdate(
  req: TenantRequest,
  res: Response,
  method: "patch" | "put",
) {
  const productId = req.params.id as string;
  const variantId = req.params.variantId as string;
  const storeId = req.tenant!.storeId;
  const product = await ensureProductExists(db, storeId, productId);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const parsed = variantInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const [existingVariant] = await db
    .select()
    .from(productVariantsTable)
    .where(
      and(
        eq(productVariantsTable.id, variantId),
        eq(productVariantsTable.productId, productId),
        eq(productVariantsTable.storeId, storeId),
      ),
    )
    .limit(1);

  if (!existingVariant) {
    res.status(404).json({ error: "Variant not found" });
    return;
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.sku !== undefined) patch.sku = trimToNull(parsed.data.sku);
  if (parsed.data.attributes !== undefined) {
    patch.attributes = Object.fromEntries(
      Object.entries(parsed.data.attributes)
        .map(([key, value]) => [key.trim(), String(value).trim()] as const)
        .filter(([key, value]) => key.length > 0 && value.length > 0),
    );
  }
  if (typeof parsed.data.position === "number") patch.position = parsed.data.position;
  if (typeof parsed.data.price === "number") patch.price = parsed.data.price;
  if (parsed.data.compareAtPrice !== undefined || parsed.data.comparePrice !== undefined) {
    patch.compareAtPrice = firstNumber(
      parsed.data.compareAtPrice,
      parsed.data.comparePrice,
    );
  }
  if (parsed.data.costPrice !== undefined) {
    patch.costPrice = firstNumber(parsed.data.costPrice);
  }
  if (parsed.data.currency !== undefined) {
    patch.currency = trimToNull(parsed.data.currency) ?? "NPR";
  }
  if (typeof parsed.data.stock === "number") patch.stock = parsed.data.stock;
  if (typeof parsed.data.lowStockThreshold === "number") {
    patch.lowStockThreshold = parsed.data.lowStockThreshold;
  }
  if (parsed.data.isActive !== undefined) {
    patch.isActive = parseBooleanInput(parsed.data.isActive) ?? true;
  }

  const nextAttributes =
    (patch.attributes as Record<string, string> | undefined) ?? existingVariant.attributes;
  const nextSku =
    patch.sku !== undefined
      ? ((patch.sku as string | null) ?? null)
      : existingVariant.sku;
  const explicitTitle =
    parsed.data.title !== undefined ? trimToNull(parsed.data.title) : existingVariant.title;
  patch.title = buildVariantTitle(nextAttributes, explicitTitle, nextSku);

  const [variant] = await db
    .update(productVariantsTable)
    .set(patch)
    .where(
      and(
        eq(productVariantsTable.id, variantId),
        eq(productVariantsTable.productId, productId),
        eq(productVariantsTable.storeId, storeId),
      ),
    )
    .returning();

  if (!variant) {
    res.status(404).json({ error: "Variant not found" });
    return;
  }

  await syncProductStock(db, storeId, productId, product.stock);
  res.json({ variant: serializeVariant(variant), method });
}

router.patch("/:id/variants/:variantId", async (req: TenantRequest, res: Response) => {
  await handleVariantUpdate(req, res, "patch");
});

router.put("/:id/variants/:variantId", async (req: TenantRequest, res: Response) => {
  await handleVariantUpdate(req, res, "put");
});

router.delete("/:id/variants/:variantId", async (req: TenantRequest, res: Response) => {
  const productId = req.params.id as string;
  const variantId = req.params.variantId as string;
  const storeId = req.tenant!.storeId;

  const [variant] = await db
    .delete(productVariantsTable)
    .where(
      and(
        eq(productVariantsTable.id, variantId),
        eq(productVariantsTable.productId, productId),
        eq(productVariantsTable.storeId, storeId),
      ),
    )
    .returning();

  if (!variant) {
    res.status(404).json({ error: "Variant not found" });
    return;
  }

  const product = await ensureProductExists(db, storeId, productId);
  await syncProductStock(db, storeId, productId, product?.stock ?? 0);
  res.json({ success: true, variant: serializeVariant(variant) });
});

router.get("/:id/images", async (req: TenantRequest, res: Response) => {
  const productId = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const product = await ensureProductExists(db, storeId, productId);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const images = await db
    .select()
    .from(productImagesTable)
    .where(
      and(
        eq(productImagesTable.productId, productId),
        eq(productImagesTable.storeId, storeId),
      ),
    )
    .orderBy(asc(productImagesTable.position), asc(productImagesTable.createdAt));

  res.json({ images: images.map(serializeImage) });
});

router.post("/:id/images", async (req: TenantRequest, res: Response) => {
  const productId = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const product = await ensureProductExists(db, storeId, productId);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  try {
    await parseImageUploadRequest(req, res);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Image upload failed",
    });
    return;
  }

  let imagePayload: NormalizedImageInput | null = null;
  const file = (req as Request & { file?: Express.Multer.File }).file;

  if (file) {
    const uploaded = await uploadMediaAsset({
      storeId,
      fileName: file.originalname,
      contentType: file.mimetype,
      dataBase64: file.buffer.toString("base64"),
    });
    imagePayload = normalizeImageInputs([
      {
        url: uploaded.url,
        altText: typeof req.body.altText === "string" ? req.body.altText : undefined,
        position: typeof req.body.position === "string" ? Number(req.body.position) : undefined,
        isPrimary: typeof req.body.isPrimary === "string" ? req.body.isPrimary : undefined,
        variantId: typeof req.body.variantId === "string" ? req.body.variantId : undefined,
      },
    ])[0]!;
  } else {
    const parsed = imageInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }
    imagePayload = normalizeImageInputs([parsed.data])[0]!;
  }

  const [image] = await db
    .insert(productImagesTable)
    .values({
      storeId,
      productId,
      ...imagePayload,
    })
    .returning();

  await normalizeProductImages(db, storeId, productId);
  res.status(201).json({ image: serializeImage(image) });
});

async function handleImageUpdate(
  req: TenantRequest,
  res: Response,
  method: "patch" | "put",
) {
  const productId = req.params.id as string;
  const imageId = req.params.imageId as string;
  const storeId = req.tenant!.storeId;
  const product = await ensureProductExists(db, storeId, productId);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const parsed = imageInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.url !== undefined) patch.url = parsed.data.url;
  if (parsed.data.altText !== undefined || parsed.data.alt !== undefined) {
    patch.altText = trimToNull(parsed.data.altText) ?? trimToNull(parsed.data.alt);
  }
  if (parsed.data.position !== undefined || parsed.data.sortOrder !== undefined) {
    patch.position =
      typeof parsed.data.position === "number"
        ? parsed.data.position
        : parsed.data.sortOrder;
  }
  if (parsed.data.isPrimary !== undefined) {
    patch.isPrimary = parseBooleanInput(parsed.data.isPrimary) ?? false;
  }
  if (parsed.data.variantId !== undefined) {
    patch.variantId = trimToNull(parsed.data.variantId);
  }

  const [image] = await db
    .update(productImagesTable)
    .set(patch)
    .where(
      and(
        eq(productImagesTable.id, imageId),
        eq(productImagesTable.productId, productId),
        eq(productImagesTable.storeId, storeId),
      ),
    )
    .returning();

  if (!image) {
    res.status(404).json({ error: "Image not found" });
    return;
  }

  await normalizeProductImages(db, storeId, productId);
  res.json({ image: serializeImage(image), method });
}

router.patch("/:id/images/:imageId", async (req: TenantRequest, res: Response) => {
  await handleImageUpdate(req, res, "patch");
});

router.put("/:id/images/:imageId", async (req: TenantRequest, res: Response) => {
  await handleImageUpdate(req, res, "put");
});

router.delete("/:id/images/:imageId", async (req: TenantRequest, res: Response) => {
  const productId = req.params.id as string;
  const imageId = req.params.imageId as string;
  const storeId = req.tenant!.storeId;

  const [image] = await db
    .delete(productImagesTable)
    .where(
      and(
        eq(productImagesTable.id, imageId),
        eq(productImagesTable.productId, productId),
        eq(productImagesTable.storeId, storeId),
      ),
    )
    .returning();

  if (!image) {
    res.status(404).json({ error: "Image not found" });
    return;
  }

  await normalizeProductImages(db, storeId, productId);
  res.json({ success: true, image: serializeImage(image) });
});

categoriesRouter.get("/", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const categories = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.storeId, storeId))
    .orderBy(asc(categoriesTable.position), asc(categoriesTable.name));

  res.json({ categories: buildCategoryTree(categories) });
});

categoriesRouter.post("/", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const payload = parsed.data;
  const parentId = trimToNull(payload.parentId);
  if (parentId) {
    const [parent] = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(and(eq(categoriesTable.id, parentId), eq(categoriesTable.storeId, storeId)))
      .limit(1);
    if (!parent) {
      res.status(400).json({ error: "Parent category not found" });
      return;
    }
  }

  const [category] = await db
    .insert(categoriesTable)
    .values({
      storeId,
      name: payload.name.trim(),
      slug: trimToNull(payload.slug) ?? toSlug(payload.name),
      parentId,
      imageUrl: trimToNull(payload.imageUrl),
      position: payload.position,
    })
    .returning();

  res.status(201).json({ category });
});

categoriesRouter.put("/:id", async (req: TenantRequest, res: Response) => {
  const categoryId = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const [existing] = await db
    .select()
    .from(categoriesTable)
    .where(and(eq(categoriesTable.id, categoryId), eq(categoriesTable.storeId, storeId)))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.name !== undefined) patch.name = parsed.data.name.trim();
  if (parsed.data.slug !== undefined) {
    patch.slug =
      trimToNull(parsed.data.slug) ??
      (typeof patch.name === "string" ? toSlug(patch.name) : existing.slug);
  }
  if (parsed.data.parentId !== undefined) {
    const parentId = trimToNull(parsed.data.parentId);
    if (parentId === categoryId) {
      res.status(400).json({ error: "Category cannot be its own parent" });
      return;
    }
    if (parentId) {
      const [parent] = await db
        .select({ id: categoriesTable.id })
        .from(categoriesTable)
        .where(and(eq(categoriesTable.id, parentId), eq(categoriesTable.storeId, storeId)))
        .limit(1);
      if (!parent) {
        res.status(400).json({ error: "Parent category not found" });
        return;
      }
    }
    patch.parentId = parentId;
  }
  if (parsed.data.imageUrl !== undefined) patch.imageUrl = trimToNull(parsed.data.imageUrl);
  if (typeof parsed.data.position === "number") patch.position = parsed.data.position;

  const [category] = await db
    .update(categoriesTable)
    .set(patch)
    .where(and(eq(categoriesTable.id, categoryId), eq(categoriesTable.storeId, storeId)))
    .returning();

  res.json({ category });
});

categoriesRouter.delete("/:id", async (req: TenantRequest, res: Response) => {
  const categoryId = req.params.id as string;
  const storeId = req.tenant!.storeId;

  const [category] = await db
    .select()
    .from(categoriesTable)
    .where(and(eq(categoriesTable.id, categoryId), eq(categoriesTable.storeId, storeId)))
    .limit(1);

  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  await db.transaction(async (tx) => {
    await tx
      .update(categoriesTable)
      .set({ parentId: null, updatedAt: new Date() })
      .where(
        and(eq(categoriesTable.parentId, categoryId), eq(categoriesTable.storeId, storeId)),
      );

    await tx
      .update(productsTable)
      .set({ categoryId: null, updatedAt: new Date() })
      .where(and(eq(productsTable.categoryId, categoryId), eq(productsTable.storeId, storeId)));

    await tx
      .delete(categoriesTable)
      .where(and(eq(categoriesTable.id, categoryId), eq(categoriesTable.storeId, storeId)));
  });

  res.json({ success: true });
});

export default router;
