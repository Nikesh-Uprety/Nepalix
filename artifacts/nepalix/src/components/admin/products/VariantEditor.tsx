import { useEffect } from "react";
import {
  Controller,
  useFieldArray,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { ProductEditFormValues, ProductVariantFormValues } from "@/pages/admin/products/form-schema";

function cartesianProduct(definitions: Array<{ name: string; values: string[] }>) {
  return definitions.reduce<Array<Record<string, string>>>(
    (accumulator, definition) =>
      accumulator.flatMap((current) =>
        definition.values.map((value) => ({
          ...current,
          [definition.name]: value,
        })),
      ),
    [{}],
  );
}

function buildVariantKey(attributes: Record<string, string>) {
  const orderedEntries = Object.entries(attributes).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  return orderedEntries.map(([name, value]) => `${name}:${value}`).join("|") || "default";
}

function buildVariantTitle(attributes: Record<string, string>) {
  return Object.values(attributes).join(" / ") || "Default";
}

export function VariantEditor({
  control,
  register,
  watch,
  setValue,
}: {
  control: Control<ProductEditFormValues>;
  register: UseFormRegister<ProductEditFormValues>;
  watch: UseFormWatch<ProductEditFormValues>;
  setValue: UseFormSetValue<ProductEditFormValues>;
}) {
  const hasVariants = watch("hasVariants");
  const definitions = watch("attributeDefinitions");
  const currentVariants = watch("variants");
  const attributeDefinitions = useFieldArray({ control, name: "attributeDefinitions" });
  const variants = useFieldArray({ control, name: "variants" });

  useEffect(() => {
    if (!hasVariants) return;

    const normalizedDefinitions = definitions
      .map((definition) => ({
        name: definition.name.trim(),
        values: definition.valuesInput
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      }))
      .filter((definition) => definition.name && definition.values.length > 0);

    if (normalizedDefinitions.length === 0) return;

    const generatedCombinations = cartesianProduct(normalizedDefinitions);
    const persistedVariants = new Map(
      currentVariants.map((variant) => [variant.key, variant]),
    );
    const manualVariants = currentVariants.filter((variant) =>
      variant.key.startsWith("manual-"),
    );

    const nextVariants = generatedCombinations.map((attributes) => {
      const key = buildVariantKey(attributes);
      const existing = persistedVariants.get(key);
      return {
        id: existing?.id,
        key,
        title: buildVariantTitle(attributes),
        attributes,
        sku: existing?.sku ?? "",
        price: existing?.price ?? 0,
        compareAtPrice: existing?.compareAtPrice ?? null,
        costPrice: existing?.costPrice ?? null,
        stock: existing?.stock ?? 0,
        isActive: existing?.isActive ?? true,
      } satisfies ProductVariantFormValues;
    });

    const mergedVariants = [...nextVariants, ...manualVariants];
    const currentSignature = JSON.stringify(
      currentVariants.map((variant) => ({
        key: variant.key,
        sku: variant.sku,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice ?? null,
        costPrice: variant.costPrice ?? null,
        stock: variant.stock,
        isActive: variant.isActive,
      })),
    );
    const nextSignature = JSON.stringify(
      mergedVariants.map((variant) => ({
        key: variant.key,
        sku: variant.sku,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice ?? null,
        costPrice: variant.costPrice ?? null,
        stock: variant.stock,
        isActive: variant.isActive,
      })),
    );

    if (currentSignature !== nextSignature) {
      setValue("variants", mergedVariants, { shouldDirty: true, shouldValidate: false });
    }
  }, [currentVariants, definitions, hasVariants, setValue]);

  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#111827]">Variants</h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            Turn variants on to manage options like color and size.
          </p>
        </div>
        <Controller
          control={control}
          name="hasVariants"
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#111827]">This product has variants</span>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
      </div>

      {!hasVariants ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">Price</label>
            <Input type="number" inputMode="numeric" {...register("price", { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">Compare At Price</label>
            <Input type="number" inputMode="numeric" {...register("compareAtPrice", { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">Stock</label>
            <Input type="number" inputMode="numeric" {...register("stock", { valueAsNumber: true })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">SKU</label>
            <Input {...register("sku")} />
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-[#111827]">Attribute Definitions</h4>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Add attribute names and comma-separated values to generate variant rows.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => attributeDefinitions.append({ name: "", valuesInput: "" })}>
                <Plus className="mr-2 h-4 w-4" />
                Add attribute
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {attributeDefinitions.fields.length === 0 ? (
                <p className="text-sm text-[#6B7280]">Start with something like Color = Red, Blue or Size = S, M, L.</p>
              ) : (
                attributeDefinitions.fields.map((field, index) => (
                  <div key={field.id} className="grid gap-3 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto]">
                    <Input placeholder="Attribute name" {...register(`attributeDefinitions.${index}.name`)} />
                    <Input placeholder="Comma-separated values" {...register(`attributeDefinitions.${index}.valuesInput`)} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => attributeDefinitions.remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-[#FAFBFF] text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">
                <tr>
                  <th className="px-4 py-3 text-left">Variant</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Compare At</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">Image</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {variants.fields.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#6B7280]">
                      Add attribute definitions or create a manual variant to begin.
                    </td>
                  </tr>
                ) : (
                  variants.fields.map((field, index) => (
                    <tr key={field.id} className="border-t border-[#F3F4F6]">
                      <td className="px-4 py-3 align-top">
                        <Input {...register(`variants.${index}.title`)} />
                        <div className="mt-2 text-xs text-[#6B7280]">
                          {Object.entries(watch(`variants.${index}.attributes`) ?? {})
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(" · ") || "Manual variant"}
                        </div>
                      </td>
                      <td className="px-4 py-3"><Input {...register(`variants.${index}.sku`)} /></td>
                      <td className="px-4 py-3"><Input type="number" inputMode="numeric" {...register(`variants.${index}.price`, { valueAsNumber: true })} /></td>
                      <td className="px-4 py-3"><Input type="number" inputMode="numeric" {...register(`variants.${index}.compareAtPrice`, { valueAsNumber: true })} /></td>
                      <td className="px-4 py-3"><Input type="number" inputMode="numeric" {...register(`variants.${index}.stock`, { valueAsNumber: true })} /></td>
                      <td className="px-4 py-3 text-[#6B7280]">Optional</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Controller
                            control={control}
                            name={`variants.${index}.isActive`}
                            render={({ field }) => (
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            )}
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => variants.remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              variants.append({
                key: `manual-${crypto.randomUUID()}`,
                title: "Custom Variant",
                attributes: {},
                sku: "",
                price: 0,
                compareAtPrice: null,
                costPrice: null,
                stock: 0,
                isActive: true,
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add manual variant
          </Button>
        </div>
      )}
    </section>
  );
}
