import type { EnquiryDraft, EnquiryField } from "@/modules/contact/domain/contact-enquiry";

/** Codes, not messages: wording belongs to the presentation layer. */
export type EnquiryErrorCode = "required" | "too_long" | "too_short" | "invalid_email";
export type EnquiryFieldErrors = Partial<Record<EnquiryField, EnquiryErrorCode>>;

export type EnquiryValidationResult =
  | { ok: true; value: EnquiryDraft }
  | { ok: false; errors: EnquiryFieldErrors };

const LIMITS = {
  name: { max: 100 },
  email: { max: 254 },
  company: { max: 150 },
  message: { min: 10, max: 5000 },
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateEnquiryDraft(input: Readonly<Record<string, unknown>>): EnquiryValidationResult {
  const name = readText(input.name);
  const email = readText(input.email);
  const company = readText(input.company);
  const message = readText(input.message);

  const errors: EnquiryFieldErrors = {};

  if (!name) errors.name = "required";
  else if (name.length > LIMITS.name.max) errors.name = "too_long";

  if (!email) errors.email = "required";
  else if (email.length > LIMITS.email.max || !EMAIL_PATTERN.test(email)) errors.email = "invalid_email";

  if (company.length > LIMITS.company.max) errors.company = "too_long";

  if (!message) errors.message = "required";
  else if (message.length < LIMITS.message.min) errors.message = "too_short";
  else if (message.length > LIMITS.message.max) errors.message = "too_long";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return { ok: true, value: { name, email, message, ...(company ? { company } : {}) } };
}
