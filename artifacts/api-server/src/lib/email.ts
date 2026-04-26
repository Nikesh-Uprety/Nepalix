import nodemailer from "nodemailer";

function readBool(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required SMTP environment variable: ${name}`);
  }
  return value;
}

export function isEmailConfigured(): boolean {
  return !!process.env.SMTP_HOST?.trim() && !!process.env.SMTP_USER?.trim();
}

function createTransport() {
  const host = requiredEnv("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT ?? "587");
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("SMTP_PORT must be a valid positive number");
  }
  const secure = readBool(process.env.SMTP_SECURE, port === 465);
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS");
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function fromAddress(): string {
  const senderEmail =
    process.env.SMTP_FROM?.trim() ||
    process.env.SENDER_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "no-reply@nepalix.vercel.app";
  const senderName = process.env.SENDER_NAME?.trim();
  return senderName ? `${senderName} <${senderEmail}>` : senderEmail;
}

export async function sendVerificationCodeEmail(input: {
  to: string;
  firstName: string;
  code: string;
}) {
  if (!isEmailConfigured()) {
    console.log(`[EMAIL SKIPPED] Verification code for ${input.to}: ${input.code}`);
    return;
  }
  const transport = createTransport();
  const from = fromAddress();
  const subject = "Your Nepalix verification code";
  const text = [
    `Hi ${input.firstName},`,
    "",
    `Your Nepalix verification code is: ${input.code}`,
    "",
    "This code expires in 10 minutes.",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.5; color: #111827;">
      <p>Hi ${input.firstName},</p>
      <p>Your Nepalix verification code is:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 12px 0;">${input.code}</p>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;

  await transport.sendMail({
    from,
    to: input.to,
    subject,
    text,
    html,
  });
}

export async function sendWelcomeEmail(input: {
  to: string;
  firstName: string;
}) {
  if (!isEmailConfigured()) {
    console.log(`[EMAIL SKIPPED] Welcome email for ${input.to}`);
    return;
  }
  const transport = createTransport();
  const from = fromAddress();
  const subject = "Welcome to Nepalix!";
  const text = [
    `Hi ${input.firstName},`,
    "",
    "Welcome to Nepalix!",
    "",
    "Your account has been created successfully.",
    "",
    "Next steps:",
    "1. Complete your store onboarding",
    "2. Add your products",
    "3. Customize your storefront",
    "",
    "Get started at: https://nepalix.vercel.app/onboarding",
    "",
    "Best regards,",
    "The Nepalix Team",
  ].join("\n");

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.5; color: #111827;">
      <p>Hi ${input.firstName},</p>
      <p>Welcome to <strong>Nepalix</strong>!</p>
      <p>Your account has been created successfully.</p>
      <h3>Next steps:</h3>
      <ol>
        <li>Complete your store onboarding</li>
        <li>Add your products</li>
        <li>Customize your storefront</li>
      </ol>
      <p><a href="https://nepalix.vercel.app/onboarding" style="display: inline-block; background: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get Started</a></p>
      <p style="margin-top: 24px;">Best regards,<br/>The Nepalix Team</p>
    </div>
  `;

  await transport.sendMail({
    from,
    to: input.to,
    subject,
    text,
    html,
  });
}

