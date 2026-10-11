import type { EnquiryReceiver } from "@/modules/contact/application/enquiry-receiver";
import type { ContactEnquiry } from "@/modules/contact/domain/contact-enquiry";

const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";
const REQUEST_TIMEOUT_MS = 8_000;

export type ResendEnquiryErrorCategory = "timeout" | "network" | "provider_rejected" | "provider_response_invalid";

export class ResendEnquiryError extends Error {
  readonly category: ResendEnquiryErrorCategory;
  readonly statusCode?: number;

  constructor(category: ResendEnquiryErrorCategory, statusCode?: number) {
    super(statusCode === undefined ? `Contact delivery failed (${category})` : `Contact delivery failed (${category}, ${statusCode})`);
    this.name = "ResendEnquiryError";
    this.category = category;
    this.statusCode = statusCode;
  }
}

export interface ResendEnquiryReceiverOptions {
  apiKey: string;
  from: string;
  to: readonly string[];
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

function safeSubject(name: string): string {
  const safeName = name.replace(/[\r\n\u0000-\u001f\u007f-\u009f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
  return `Website enquiry from ${safeName || "visitor"}`;
}

function plainText(enquiry: ContactEnquiry): string {
  return [
    "A new website enquiry was submitted.",
    "",
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Company: ${enquiry.company || "Not provided"}`,
    `Received: ${enquiry.receivedAt}`,
    `Enquiry ID: ${enquiry.id}`,
    "",
    "Message:",
    enquiry.message,
  ].join("\n");
}

export class ResendEnquiryReceiver implements EnquiryReceiver {
  readonly deliversEnquiries = true;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;

  constructor(private readonly options: ResendEnquiryReceiverOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  }

  async receive(enquiry: ContactEnquiry): Promise<void> {
    const signal = AbortSignal.timeout(this.timeoutMs);
    let response: Response;
    try {
      response = await this.fetchImpl(RESEND_EMAILS_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.options.apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `contact-enquiry/${enquiry.id}`,
        },
        body: JSON.stringify({
          from: this.options.from,
          to: [...this.options.to],
          reply_to: enquiry.email,
          subject: safeSubject(enquiry.name),
          text: plainText(enquiry),
        }),
        signal,
      });
    } catch {
      throw new ResendEnquiryError(signal.aborted ? "timeout" : "network");
    }
    if (!response.ok) throw new ResendEnquiryError("provider_rejected", response.status);

    try {
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || typeof (payload as { id?: unknown }).id !== "string") {
        throw new Error("invalid response");
      }
    } catch {
      throw new ResendEnquiryError("provider_response_invalid", response.status);
    }
  }
}
