import type { IsoDateString } from "@/shared/types/common";

export const ENQUIRY_FIELDS = ["name", "email", "company", "message"] as const;
export type EnquiryField = (typeof ENQUIRY_FIELDS)[number];

/** What a visitor submits. */
export interface EnquiryDraft {
  name: string;
  email: string;
  company?: string;
  message: string;
}

/** A validated enquiry that has been accepted by the system. */
export interface ContactEnquiry extends EnquiryDraft {
  id: string;
  receivedAt: IsoDateString;
}
