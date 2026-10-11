"use server";

import {
  getContactDelivery,
  isContactSubmissionTokenValid,
  logContactSubmissionFailure,
  submitEnquiry,
} from "@/modules/contact/composition";
import { ENQUIRY_FIELDS, type EnquiryField } from "@/modules/contact/domain/contact-enquiry";
import type { ContactFormState } from "@/modules/contact/presentation/contact-form-state";
import { readServerEnv } from "@/shared/config/env";

export async function submitEnquiryAction(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Server actions are publicly callable endpoints: the flag is enforced here, per request,
  // not only by hiding the form in the page.
  const env = readServerEnv();
  const delivery = getContactDelivery();
  if (!env.features.contactForm || delivery.mode === "disabled") return { status: "unavailable" };
  if (formData.get("website") !== "") return { status: "spam" };
  const token = formData.get("submissionToken");
  if (!isContactSubmissionTokenValid(typeof token === "string" ? token : "", delivery.signingSecret ?? "")) {
    return { status: "spam" };
  }

  const input: Record<string, unknown> = {};
  const values: Partial<Record<EnquiryField, string>> = {};
  for (const field of ENQUIRY_FIELDS) {
    const value = formData.get(field);
    input[field] = value;
    if (typeof value === "string") values[field] = value;
  }

  try {
    const result = await submitEnquiry(input);
    if (result.status === "invalid") return { status: "invalid", errors: result.errors, values };
    return { status: "success" }; // only reached after the receiver has resolved
  } catch (error) {
    logContactSubmissionFailure(error);
    return { status: "error" };
  }
}
