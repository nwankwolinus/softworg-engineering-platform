import type { ContactEnquiry } from "@/modules/contact/domain/contact-enquiry";

/**
 * Port: where accepted enquiries go (email, CRM, database, queue...). Implemented in infrastructure.
 * Contract: `receive` must resolve ONLY once the enquiry has been durably handed over, and must
 * reject otherwise. The use case reports success only after it resolves.
 */
export interface EnquiryReceiver {
  /**
   * True only when `receive` really hands the enquiry to someone who will read it (mailbox, CRM, queue).
   * Absent or false means "not confirmed": the UI must then not tell visitors they will be contacted.
   */
  readonly deliversEnquiries?: boolean;
  receive(enquiry: ContactEnquiry): Promise<void>;
}
