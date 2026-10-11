import type { ContactEnquiry } from "@/modules/contact/domain/contact-enquiry";
import {
  validateEnquiryDraft,
  type EnquiryFieldErrors,
} from "@/modules/contact/domain/enquiry-validation";
import type { EnquiryReceiver } from "@/modules/contact/application/enquiry-receiver";

export type SubmitEnquiryResult =
  | { status: "success"; enquiryId: string }
  | { status: "invalid"; errors: EnquiryFieldErrors };

interface SubmitEnquiryDependencies {
  receiver: EnquiryReceiver;
  generateId?: () => string;
  now?: () => Date;
}

/**
 * "success" is returned only after `receiver.receive` has resolved. Receiver failures are
 * deliberately not caught here (they propagate); the delivery layer decides how to report them.
 */
export function createSubmitEnquiry({
  receiver,
  generateId = () => crypto.randomUUID(),
  now = () => new Date(),
}: SubmitEnquiryDependencies) {
  return async function submitEnquiry(
    input: Readonly<Record<string, unknown>>,
  ): Promise<SubmitEnquiryResult> {
    const validation = validateEnquiryDraft(input);
    if (!validation.ok) return { status: "invalid", errors: validation.errors };

    const enquiry: ContactEnquiry = {
      ...validation.value,
      id: generateId(),
      receivedAt: now().toISOString(),
    };

    await receiver.receive(enquiry);
    return { status: "success", enquiryId: enquiry.id };
  };
}

export type SubmitEnquiry = ReturnType<typeof createSubmitEnquiry>;
