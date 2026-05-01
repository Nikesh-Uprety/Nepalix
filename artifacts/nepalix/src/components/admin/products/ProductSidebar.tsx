import { useMemo, useState } from "react";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "@/components/admin/products/TagInput";
import type { AdminProductCategory, AdminProductStatus } from "@/lib/api";

export function ProductSidebar({
  status,
  onStatusChange,
  categoryId,
  onCategoryChange,
  categories,
  tags,
  onTagsChange,
  price,
  compareAtPrice,
  costPrice,
  stockSummary,
  onArchive,
  showDangerZone,
}: {
  status: AdminProductStatus;
  onStatusChange: (next: AdminProductStatus) => void;
  categoryId: string;
  onCategoryChange: (next: string) => void;
  categories: Array<{ id: string; label: string; category: AdminProductCategory }>;
  tags: string[];
  onTagsChange: (next: string[]) => void;
  price: number;
  compareAtPrice: number | null | undefined;
  costPrice: number | null | undefined;
  stockSummary: number;
  onArchive: () => void;
  showDangerZone: boolean;
}) {
  const [categorySearch, setCategorySearch] = useState("");
  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    if (!search) return categories;
    return categories.filter(({ category, label }) =>
      `${category.name} ${category.slug} ${label}`.toLowerCase().includes(search),
    );
  }, [categories, categorySearch]);
  const margin =
    price > 0 && typeof costPrice === "number"
      ? Math.round(((price - costPrice) / price) * 100)
      : null;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#111827]">Status</h3>
        <div className="mt-3">
          <Select value={status} onValueChange={(value) => onStatusChange(value as AdminProductStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#111827]">Category</h3>
        <div className="mt-3 space-y-3">
          <Input
            value={categorySearch}
            onChange={(event) => setCategorySearch(event.target.value)}
            placeholder="Filter categories"
          />
          <Select value={categoryId || "uncategorized"} onValueChange={(value) => onCategoryChange(value === "uncategorized" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
              {filteredCategories.map(({ id, label }) => (
                <SelectItem key={id} value={id}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#111827]">Tags</h3>
        <div className="mt-3">
          <TagInput value={tags} onChange={onTagsChange} />
        </div>
      </section>

      <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#111827]">Pricing Summary</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-[#6B7280]">Price</dt>
            <dd className="font-semibold text-[#111827]">Rs {price.toLocaleString()}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[#6B7280]">Compare At</dt>
            <dd className="font-semibold text-[#111827]">
              {typeof compareAtPrice === "number" ? `Rs ${compareAtPrice.toLocaleString()}` : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[#6B7280]">Cost</dt>
            <dd className="font-semibold text-[#111827]">
              {typeof costPrice === "number" ? `Rs ${costPrice.toLocaleString()}` : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[#6B7280]">Margin</dt>
            <dd className="font-semibold text-[#111827]">
              {margin === null ? "—" : `${margin}%`}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#111827]">Stock Summary</h3>
        <p className="mt-3 text-2xl font-bold tracking-tight text-[#111827]">
          {stockSummary.toLocaleString()}
        </p>
        <p className="mt-1 text-sm text-[#6B7280]">Total units available</p>
      </section>

      {showDangerZone && (
        <section className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#991B1B]">Danger Zone</h3>
          <p className="mt-2 text-sm text-[#B91C1C]">
            Archive the product without deleting its data.
          </p>
          <Button className="mt-4 w-full" variant="outline" onClick={onArchive}>
            <Archive className="mr-2 h-4 w-4" />
            Archive product
          </Button>
        </section>
      )}
    </div>
  );
}
