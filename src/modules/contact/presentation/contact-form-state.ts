import type { EnquiryField } from "@/modules/contact/domain/contact-enquiry";
import type { EnquiryFieldErrors } from "@/modules/contact/domain/enquiry-validation";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "unavailable" }
  | { status: "spam" }
  | { status: "error" }
  | { status: "invalid"; errors: EnquiryFieldErrors; values: Partial<Record<EnquiryField, string>> };

export const initialContactFormState: ContactFormState = { status: "idle" };
