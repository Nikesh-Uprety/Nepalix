import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function TagInput({
  value,
  onChange,
  placeholder = "Type a tag and press Enter",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commitTag(rawTag: string) {
    const tag = rawTag.trim();
    if (!tag) return;
    if (value.includes(tag)) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-2 rounded-full border border-[#D6CCFF] bg-[#F7F4FF] px-3 py-1 text-xs font-semibold text-[#4C1D95]"
          >
            {tag}
            <button
              type="button"
              className="text-[#7C3AED] transition-colors hover:text-[#5B21B6]"
              onClick={() => onChange(value.filter((item) => item !== tag))}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commitTag(draft);
          }
          if (event.key === "Backspace" && !draft && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => commitTag(draft)}
        placeholder={placeholder}
      />
    </div>
  );
}
