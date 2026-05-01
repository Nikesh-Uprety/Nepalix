import { z } from "zod";

export const productStatusOptions = ["draft", "active", "archived"] as const;

export const attributeDefinitionSchema = z.object({
  name: z.string().default(""),
  valuesInput: z.string().default(""),
});

export const productVariantFormSchema = z.object({
  id: z.string().optional(),
  key: z.string(),
  title: z.string().min(1, "Variant title is required"),
  attributes: z.record(z.string()).default({}),
  sku: z.string().default(""),
  price: z.coerce.number().min(0).default(0),
  compareAtPrice: z.coerce.number().min(0).nullable().optional(),
  costPrice: z.coerce.number().min(0).nullable().optional(),
  stock: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const productEditSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().default(""),
  slug: z.string().min(1, "Slug is required"),
  sku: z.string().default(""),
  price: z.coerce.number().min(0).default(0),
  compareAtPrice: z.coerce.number().min(0).nullable().optional(),
  costPrice: z.coerce.number().min(0).nullable().optional(),
  stock: z.coerce.number().min(0).default(0),
  weight: z.coerce.number().min(0).nullable().optional(),
  hasVariants: z.boolean().default(false),
  attributeDefinitions: z.array(attributeDefinitionSchema).default([]),
  variants: z.array(productVariantFormSchema).default([]),
  status: z.enum(productStatusOptions).default("draft"),
  categoryId: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().default(""),
  seoDescription: z.string().default(""),
});

export type ProductEditFormValues = z.infer<typeof productEditSchema>;
export type ProductVariantFormValues = z.infer<typeof productVariantFormSchema>;
export type AttributeDefinitionValues = z.infer<typeof attributeDefinitionSchema>;
