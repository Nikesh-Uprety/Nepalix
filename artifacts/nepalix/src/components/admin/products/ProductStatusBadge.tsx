import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AdminProductStatus } from "@/lib/api";

const statusStyles: Record<
  AdminProductStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "border-[#BBF7D0] bg-[#DCFCE7] text-[#166534]",
  },
  draft: {
    label: "Draft",
    className: "border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563]",
  },
  archived: {
    label: "Archived",
    className: "border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]",
  },
};

export function ProductStatusBadge({
  status,
  className,
}: {
  status: AdminProductStatus;
  className?: string;
}) {
  const config = statusStyles[status] ?? statusStyles.draft;

  return (
    <Badge
      variant="outline"
      className={cn("justify-center font-semibold", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
