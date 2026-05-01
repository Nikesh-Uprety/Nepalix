import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles,
  Store,
  MapPin,
  Tags,
  ImageUp,
  Package,
  Rocket,
  Wand2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { getAuthenticatedHomeRoute } from "@/lib/portal-routing";

type Step = 0 | 1 | 2 | 3;

const CATEGORIES = [
  "Fashion",
  "Beauty",
  "Coffee & Bakery",
  "Electronics",
  "Grocery",
  "Home Decor",
  "Health",
  "Other",
];

async function uploadFile(file: File): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read file"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
  const [meta, dataBase64] = dataUrl.split(",");
  const contentType = meta.replace("data:", "").replace(";base64", "");
  const result = await api.auth.uploadOnboardingImage({ fileName: file.name, contentType, dataBase64 });
  return result.url;
}

export default function OnboardingPage() {
  const { user, completeOnboarding } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [storeCategory, setStoreCategory] = useState("Fashion");
  const [otherCategory, setOtherCategory] = useState("");
  const [locationName, setLocationName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryProductName, setPrimaryProductName] = useState("");
  const [primaryProductImageUrl, setPrimaryProductImageUrl] = useState("");
  const [extraProductImageUrls, setExtraProductImageUrls] = useState<string[]>([""]);

  const effectiveCategory = useMemo(
    () => (storeCategory === "Other" ? otherCategory.trim() || "General" : storeCategory),
    [otherCategory, storeCategory],
  );

  useEffect(() => {
    if (!user) return;
    const isFreshUser = !user.onboardingCompletedAt && !user.storeId && !user.activeStoreId;
    if (!isFreshUser) {
      setLocation(getAuthenticatedHomeRoute(user), { replace: true });
    }
  }, [setLocation, user]);

  const theme = {
    page: "from-[#FFF8E7] via-[#F9F3E8] to-[#FFF8E7]",
    panel: "bg-[#FFF8E7]/85 border-[#1A0D00]/12",
    text: "text-[#1A0D00]",
    sub: "text-[#5C4633]",
    accent: "bg-[#1A0D00] text-[#FFF8E7]",
  };

  async function onLogoFile(file: File | null) {
    if (!file) return;
    setError("");
    try {
      const url = await uploadFile(file);
      setLogoUrl(url);
    } catch {
      setError("Logo upload failed. Please try again.");
    }
  }

  async function onPrimaryProductFile(file: File | null) {
    if (!file) return;
    setError("");
    try {
      const url = await uploadFile(file);
      setPrimaryProductImageUrl(url);
    } catch {
      setError("Product image upload failed. Please try again.");
    }
  }

  async function onExtraProductFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");
    try {
      const urls = await Promise.all(Array.from(files).slice(0, 4).map((file) => uploadFile(file)));
      setExtraProductImageUrls((prev) => [...prev.filter((v) => v.trim().length > 0), ...urls]);
    } catch {
      setError("Some images failed to upload. Please try again.");
    }
  }

  function next() {
    setError("");
    if (step === 0) {
      if (!storeName.trim() || !locationName.trim() || !effectiveCategory.trim()) {
        setError("Please fill store name, location, and category.");
        return;
      }
    }
    if (step === 1) {
      if (!primaryProductName.trim() || !primaryProductImageUrl.trim()) {
        setError("Please add a product name and one product image.");
        return;
      }
    }
    setStep((s) => (Math.min(3, s + 1) as Step));
  }

  function back() {
    setError("");
    setStep((s) => (Math.max(0, s - 1) as Step));
  }

  async function publishAndGoLive() {
    setError("");
    setProcessing(true);
    try {
      const result = await completeOnboarding({
        storeName: storeName.trim(),
        storeCategory: effectiveCategory.trim(),
        location: locationName.trim(),
        logoUrl: logoUrl.trim() || undefined,
        primaryProductName: primaryProductName.trim(),
        primaryProductImageUrl: primaryProductImageUrl.trim(),
        extraProductImageUrls: extraProductImageUrls.map((url) => url.trim()).filter(Boolean),
      });
      setDone(true);
      setTimeout(() => {
        setLocation(getAuthenticatedHomeRoute(result.user), { replace: true });
      }, 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not finish onboarding");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.page} ${theme.text}`}>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className={`rounded-3xl border ${theme.panel} backdrop-blur-md shadow-[0_30px_80px_rgba(26,13,0,0.08)] overflow-hidden`}>
          <div className="px-6 py-5 border-b border-[#1A0D00]/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[#1A0D00] text-[#FFF8E7] grid place-items-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Create your online store in under 1 minute</p>
                <p className={`text-xs ${theme.sub}`}>
                  {user?.firstName ? `${user.firstName},` : "Welcome,"} we will auto-build your first live template.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-[#1A0D00]/70">Step {step + 1} / 4</div>
          </div>

          <div className="h-1 w-full bg-[#1A0D00]/8">
            <div className="h-full bg-[#1A0D00] transition-all duration-500" style={{ width: `${((step + 1) / 4) * 100}%` }} />
          </div>

          <div className="p-6 md:p-8">
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h2 className="text-xl font-bold flex items-center gap-2"><Store className="h-5 w-5" /> Store Basics</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="space-y-1">
                    <span className="text-sm font-medium">Store name</span>
                    <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="h-11 w-full rounded-xl border border-[#1A0D00]/20 bg-white/70 px-3 outline-none focus:ring-2 focus:ring-[#1A0D00]/30" placeholder="Nikesh Cafe" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium flex items-center gap-1"><MapPin className="h-4 w-4" /> Location</span>
                    <input value={locationName} onChange={(e) => setLocationName(e.target.value)} className="h-11 w-full rounded-xl border border-[#1A0D00]/20 bg-white/70 px-3 outline-none focus:ring-2 focus:ring-[#1A0D00]/30" placeholder="Kathmandu, Nepal" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium flex items-center gap-1"><Tags className="h-4 w-4" /> Category</span>
                    <select value={storeCategory} onChange={(e) => setStoreCategory(e.target.value)} className="h-11 w-full rounded-xl border border-[#1A0D00]/20 bg-white/70 px-3 outline-none focus:ring-2 focus:ring-[#1A0D00]/30">
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  {storeCategory === "Other" && (
                    <label className="space-y-1">
                      <span className="text-sm font-medium">Other category</span>
                      <input value={otherCategory} onChange={(e) => setOtherCategory(e.target.value)} className="h-11 w-full rounded-xl border border-[#1A0D00]/20 bg-white/70 px-3 outline-none focus:ring-2 focus:ring-[#1A0D00]/30" placeholder="Handmade crafts" />
                    </label>
                  )}
                </div>
                <label className="space-y-1 block">
                  <span className="text-sm font-medium">Store logo (optional)</span>
                  <div className="flex gap-2 flex-col md:flex-row">
                    <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="h-11 flex-1 rounded-xl border border-[#1A0D00]/20 bg-white/70 px-3 outline-none focus:ring-2 focus:ring-[#1A0D00]/30" placeholder="https://... or upload below" />
                    <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-[#1A0D00]/25 px-4 text-sm font-medium hover:bg-[#1A0D00]/5">
                      <ImageUp className="h-4 w-4 mr-2" /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => void onLogoFile(e.target.files?.[0] ?? null)} />
                    </label>
                  </div>
                </label>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h2 className="text-xl font-bold flex items-center gap-2"><Package className="h-5 w-5" /> Add First Product</h2>
                <p className={`text-sm ${theme.sub}`}>This helps us auto-generate a realistic live template with your own content.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="space-y-1">
                    <span className="text-sm font-medium">Primary product name</span>
                    <input value={primaryProductName} onChange={(e) => setPrimaryProductName(e.target.value)} className="h-11 w-full rounded-xl border border-[#1A0D00]/20 bg-white/70 px-3 outline-none focus:ring-2 focus:ring-[#1A0D00]/30" placeholder="Iced Caramel Latte" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium">Primary product image URL</span>
                    <input value={primaryProductImageUrl} onChange={(e) => setPrimaryProductImageUrl(e.target.value)} className="h-11 w-full rounded-xl border border-[#1A0D00]/20 bg-white/70 px-3 outline-none focus:ring-2 focus:ring-[#1A0D00]/30" placeholder="https://..." />
                  </label>
                </div>
                <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-[#1A0D00]/25 px-4 text-sm font-medium hover:bg-[#1A0D00]/5">
                  <ImageUp className="h-4 w-4 mr-2" /> Upload primary image
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => void onPrimaryProductFile(e.target.files?.[0] ?? null)} />
                </label>

                <div className="space-y-2">
                  <p className="text-sm font-medium">More product images (optional)</p>
                  {extraProductImageUrls.map((url, idx) => (
                    <input key={idx} value={url} onChange={(e) => {
                      const next = [...extraProductImageUrls];
                      next[idx] = e.target.value;
                      setExtraProductImageUrls(next);
                    }} className="h-10 w-full rounded-xl border border-[#1A0D00]/20 bg-white/70 px-3 outline-none focus:ring-2 focus:ring-[#1A0D00]/30" placeholder={`Extra image URL ${idx + 1}`} />
                  ))}
                  <div className="flex gap-2">
                    <button type="button" className="rounded-lg border border-[#1A0D00]/25 px-3 py-1.5 text-xs font-semibold hover:bg-[#1A0D00]/5" onClick={() => setExtraProductImageUrls((prev) => [...prev, ""])}>+ Add URL</button>
                    <label className="rounded-lg border border-[#1A0D00]/25 px-3 py-1.5 text-xs font-semibold hover:bg-[#1A0D00]/5 cursor-pointer">
                      Upload more
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => void onExtraProductFiles(e.target.files)} />
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><Wand2 className="h-5 w-5" /> AI-style Template Generation</h2>
                <div className="rounded-2xl border border-[#1A0D00]/15 bg-white/60 p-5 space-y-3">
                  <p className="text-sm"><strong>Store:</strong> {storeName || "—"}</p>
                  <p className="text-sm"><strong>Category:</strong> {effectiveCategory || "—"}</p>
                  <p className="text-sm"><strong>Location:</strong> {locationName || "—"}</p>
                  <p className="text-sm"><strong>Primary Product:</strong> {primaryProductName || "—"}</p>
                </div>
                <p className={`text-sm ${theme.sub}`}>
                  We will generate your first homepage using your details, publish it live, and you can customize every section from the editor.
                </p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><Rocket className="h-5 w-5" /> Publish & Go Live</h2>
                <div className="rounded-2xl border border-[#1A0D00]/15 bg-white/60 p-5">
                  <p className="text-sm mb-2">Click the button below to:</p>
                  <ul className="space-y-1 text-sm list-disc pl-5">
                    <li>Generate and publish your starter storefront</li>
                    <li>Attach your uploaded branding + product content</li>
                    <li>Start your 14-day trial and continue in billing</li>
                  </ul>
                </div>
                {done && (
                  <div className="rounded-xl border border-green-600/20 bg-green-100/70 px-3 py-2 text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Your store is live. Redirecting to billing...
                  </div>
                )}
              </motion.div>
            )}

            {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={back}
                disabled={step === 0 || processing}
                className="inline-flex items-center gap-2 rounded-xl border border-[#1A0D00]/20 px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              {step < 3 ? (
                <button type="button" onClick={next} className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold ${theme.accent}`}>
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void publishAndGoLive()}
                  disabled={processing || done}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold ${theme.accent} disabled:opacity-60`}
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                  Publish & Go Live
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
