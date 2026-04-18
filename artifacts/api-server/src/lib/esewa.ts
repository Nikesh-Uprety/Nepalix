import crypto from "crypto";

const ESEWA_BASE_URL =
  process.env.ESEWA_BASE_URL ?? "https://rc-epay.esewa.com.np";
const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID ?? "EPAYTEST";
const ESEWA_SECRET = process.env.ESEWA_SECRET ?? "8gBm/:&EnhH.1/q";

export type EsewaInitiateInput = {
  amount: number;
  transactionUuid: string;
  successUrl: string;
  failureUrl: string;
};

export type EsewaInitiateResult = {
  formUrl: string;
  fields: Record<string, string>;
};

export function esewaInitiate(input: EsewaInitiateInput): EsewaInitiateResult {
  const total_amount = input.amount.toFixed(2);
  const transaction_uuid = input.transactionUuid;
  const product_code = ESEWA_MERCHANT_ID;
  const signed_field_names = "total_amount,transaction_uuid,product_code";
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  const signature = crypto
    .createHmac("sha256", ESEWA_SECRET)
    .update(message)
    .digest("base64");

  return {
    formUrl: `${ESEWA_BASE_URL}/api/epay/main/v2/form`,
    fields: {
      amount: input.amount.toFixed(2),
      tax_amount: "0",
      total_amount,
      transaction_uuid,
      product_code,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: input.successUrl,
      failure_url: input.failureUrl,
      signed_field_names,
      signature,
    },
  };
}

export async function esewaLookup(transactionUuid: string, amount: number) {
  const url = `${ESEWA_BASE_URL}/api/epay/transaction/status/?product_code=${ESEWA_MERCHANT_ID}&total_amount=${amount.toFixed(2)}&transaction_uuid=${transactionUuid}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status?: string;
    ref_id?: string;
    transaction_uuid?: string;
  };
  return {
    status: data.status ?? "UNKNOWN",
    refId: data.ref_id ?? null,
    transactionUuid: data.transaction_uuid ?? transactionUuid,
  };
}

export function isEsewaConfigured(): boolean {
  return Boolean(process.env.ESEWA_MERCHANT_ID && process.env.ESEWA_SECRET);
}

export function isKhaltiConfigured(): boolean {
  return Boolean(process.env.KHALTI_SECRET_KEY);
}
