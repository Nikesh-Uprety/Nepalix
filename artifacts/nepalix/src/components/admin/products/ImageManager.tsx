import { useState } from "react";
import { ImagePlus, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminProductImage } from "@/lib/api";

export type QueuedProductImage = {
  id: string;
  file: File;
  previewUrl: string;
  altText: string;
  isPrimary: boolean;
};

export function ImageManager({
  productId,
  images,
  pendingImages,
  onQueueFiles,
  onPendingAltChange,
  onPendingDelete,
  onPendingSetPrimary,
  onPendingReorder,
  onPersistedAltUpdate,
  onPersistedDelete,
  onPersistedSetPrimary,
  onPersistedReorder,
}: {
  productId: string | null;
  images: AdminProductImage[];
  pendingImages: QueuedProductImage[];
  onQueueFiles: (files: File[]) => void;
  onPendingAltChange: (id: string, altText: string) => void;
  onPendingDelete: (id: string) => void;
  onPendingSetPrimary: (id: string) => void;
  onPendingReorder: (dragId: string, dropId: string) => void;
  onPersistedAltUpdate: (id: string, altText: string) => void;
  onPersistedDelete: (id: string) => void;
  onPersistedSetPrimary: (id: string) => void;
  onPersistedReorder: (id: string, position: number) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedSource, setDraggedSource] = useState<"persisted" | "pending" | null>(
    null,
  );
  const [isDropzoneActive, setIsDropzoneActive] = useState(false);

  function handleDrop(
    dropId: string,
    source: "persisted" | "pending",
    position: number,
  ) {
    if (!draggedId || !draggedSource || draggedSource !== source || draggedId === dropId) {
      setDraggedId(null);
      setDraggedSource(null);
      return;
    }

    if (source === "persisted") {
      onPersistedReorder(draggedId, position);
    } else {
      onPendingReorder(draggedId, dropId);
    }

    setDraggedId(null);
    setDraggedSource(null);
  }

  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#111827]">Images</h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            Upload product photos, drag to reorder them, and set the primary image.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-dashed border-[#C4B5FD] bg-[#F7F4FF] px-4 py-2 text-sm font-semibold text-[#5B21B6] transition-colors hover:bg-[#F1ECFF]">
          <Upload className="mr-2 h-4 w-4" />
          Upload Images
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              if (!event.target.files?.length) return;
              onQueueFiles(Array.from(event.target.files));
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      <div
        className={`mt-6 rounded-xl border border-dashed p-6 text-center transition-colors ${
          isDropzoneActive
            ? "border-[#5B21B6] bg-[#F7F4FF]"
            : "border-[#D8DEE8] bg-[#F9FAFB]"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDropzoneActive(true);
        }}
        onDragLeave={() => setIsDropzoneActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDropzoneActive(false);
          const files = Array.from(event.dataTransfer.files).filter((file) =>
            file.type.startsWith("image/"),
          );
          if (files.length > 0) {
            onQueueFiles(files);
          }
        }}
      >
        <ImagePlus className="mx-auto h-8 w-8 text-[#9CA3AF]" />
        <p className="mt-3 text-sm font-medium text-[#111827]">
          Drop images here or browse to upload
        </p>
        <p className="mt-1 text-sm text-[#6B7280]">
          {productId
            ? "New uploads are added to this product immediately."
            : "Save the product and your queued images will upload automatically."}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => {
              setDraggedId(image.id);
              setDraggedSource("persisted");
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(image.id, "persisted", index)}
            className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm"
          >
            <img
              src={image.url}
              alt={image.altText ?? "Product image"}
              className="h-48 w-full rounded-lg object-cover"
            />
            <div className="mt-3 space-y-3">
              <Input
                defaultValue={image.altText ?? ""}
                placeholder="Alt text"
                onBlur={(event) => onPersistedAltUpdate(image.id, event.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onPersistedSetPrimary(image.id)}
                >
                  <Star className={`mr-2 h-3.5 w-3.5 ${image.isPrimary ? "fill-current" : ""}`} />
                  {image.isPrimary ? "Primary" : "Set primary"}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => onPersistedDelete(image.id)}>
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}

        {pendingImages.map((image) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => {
              setDraggedId(image.id);
              setDraggedSource("pending");
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(image.id, "pending", 0)}
            className="rounded-xl border border-[#D8DEE8] bg-[#F9FAFB] p-3 shadow-sm"
          >
            <img
              src={image.previewUrl}
              alt={image.altText || image.file.name}
              className="h-48 w-full rounded-lg object-cover"
            />
            <div className="mt-3 space-y-3">
              <Input
                value={image.altText}
                placeholder="Alt text"
                onChange={(event) => onPendingAltChange(image.id, event.target.value)}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => onPendingSetPrimary(image.id)}>
                  <Star className={`mr-2 h-3.5 w-3.5 ${image.isPrimary ? "fill-current" : ""}`} />
                  {image.isPrimary ? "Primary" : "Set primary"}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => onPendingDelete(image.id)}>
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
