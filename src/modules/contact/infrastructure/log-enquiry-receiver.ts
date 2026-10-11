import type { EnquiryReceiver } from "@/modules/contact/application/enquiry-receiver";
import type { ContactEnquiry } from "@/modules/contact/domain/contact-enquiry";

/**
 * DEVELOPMENT STAND-IN. This receiver does NOT persist, email or forward enquiries.
 * It only logs the enquiry id and timestamp (no personal data), so an enquiry handled by it
 * is effectively discarded. Do not enable FEATURE_CONTACT_FORM in production until this is
 * replaced by a real receiver (email/CRM/database) in `modules/contact/composition.ts`.
 */
export class LogEnquiryReceiver implements EnquiryReceiver {
  readonly deliversEnquiries = false;

  async receive(enquiry: ContactEnquiry): Promise<void> {
    console.info("[contact] enquiry received (NOT stored or forwarded)", {
      id: enquiry.id,
      receivedAt: enquiry.receivedAt,
    });
  }
}
