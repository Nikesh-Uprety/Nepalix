const KHALTI_BASE_URL =
  process.env.KHALTI_BASE_URL ?? "https://a.khalti.com/api/v2";
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY ?? "";

export type KhaltiInitiateInput = {
  amount: number;
  purchaseOrderId: string;
  purchaseOrderName: string;
  returnUrl: string;
  websiteUrl: string;
  customerInfo: { name: string; email: string; phone?: string };
};

export type KhaltiInitiateResult = {
  pidx: string;
  paymentUrl: string;
};

export async function khaltiInitiate(
  input: KhaltiInitiateInput,
): Promise<KhaltiInitiateResult> {
  if (!KHALTI_SECRET_KEY) {
    throw new Error("KHALTI_SECRET_KEY not configured");
  }
  const res = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
    method: "POST",
    headers: {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      return_url: input.returnUrl,
      website_url: input.websiteUrl,
      amount: input.amount,
      purchase_order_id: input.purchaseOrderId,
      purchase_order_name: input.purchaseOrderName,
      customer_info: input.customerInfo,
    }),
  });
  const data = (await res.json()) as {
    pidx?: string;
    payment_url?: string;
    detail?: string;
  };
  if (!res.ok || !data.pidx || !data.payment_url) {
    throw new Error(data.detail ?? `Khalti initiate failed (${res.status})`);
  }
  return { pidx: data.pidx, paymentUrl: data.payment_url };
}

export type KhaltiLookupResult = {
  pidx: string;
  status: "Completed" | "Pending" | "Refunded" | "Expired" | "User canceled";
  transactionId: string | null;
  totalAmount: number;
};

export async function khaltiLookup(pidx: string): Promise<KhaltiLookupResult> {
  if (!KHALTI_SECRET_KEY) {
    throw new Error("KHALTI_SECRET_KEY not configured");
  }
  const res = await fetch(`${KHALTI_BASE_URL}/epayment/lookup/`, {
    method: "POST",
    headers: {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(`Khalti lookup failed (${res.status})`);
  }
  return {
    pidx: data.pidx as string,
    status: data.status as KhaltiLookupResult["status"],
    transactionId: (data.transaction_id as string) ?? null,
    totalAmount: (data.total_amount as number) ?? 0,
  };
}
