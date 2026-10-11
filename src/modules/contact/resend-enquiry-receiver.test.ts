import { describe, expect, it, vi } from "vitest";
import { ResendEnquiryError, ResendEnquiryReceiver } from "@/modules/contact/infrastructure/resend-enquiry-receiver";

const enquiry = {
  id: "enquiry-123",
  receivedAt: "2026-10-09T10:00:00.000Z",
  name: "Ada\r\nBcc: attacker@example.net\u0000",
  email: "ada@example.com",
  company: "Analytical Engines",
  message: "Please help us automate our process.",
};

function receiver(fetchImpl: typeof fetch) {
  return new ResendEnquiryReceiver({
    apiKey: "re_secret_test_key",
    from: "enquiries@example.com",
    to: ["first@example.com", "second@example.com"],
    fetchImpl,
  });
}

describe("ResendEnquiryReceiver", () => {
  it("sends plain text, reply-to, sanitized subject, recipients and idempotency key", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ id: "email-id" }), { status: 200 }));
    await receiver(fetchMock).receive(enquiry);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.resend.com/emails");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer re_secret_test_key",
      "Idempotency-Key": "contact-enquiry/enquiry-123",
    });
    const payload = JSON.parse(String(init?.body));
    expect(payload.to).toEqual(["first@example.com", "second@example.com"]);
    expect(payload.reply_to).toBe("ada@example.com");
    expect(payload.subject).not.toMatch(/[\r\n\u0000-\u001f\u007f-\u009f]/);
    expect(payload.text).toContain("Please help us automate our process.");
    expect(payload.html).toBeUndefined();
  });

  it("throws sanitized errors for provider failures and malformed success bodies", async () => {
    const rejected = receiver(vi.fn<typeof fetch>().mockResolvedValue(new Response("private provider response", { status: 429 })));
    await expect(rejected.receive(enquiry)).rejects.toMatchObject({ category: "provider_rejected", statusCode: 429 });
    await expect(rejected.receive(enquiry)).rejects.not.toThrow("private provider response");

    const malformed = receiver(vi.fn<typeof fetch>().mockResolvedValue(new Response("{}", { status: 200 })));
    await expect(malformed.receive(enquiry)).rejects.toBeInstanceOf(ResendEnquiryError);
    await expect(malformed.receive(enquiry)).rejects.toMatchObject({ category: "provider_response_invalid" });
  });

  it("classifies timeouts and network errors without exposing request details", async () => {
    const timeoutFetch: typeof fetch = (_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new Error("contains private request data")), { once: true });
    });
    const shortTimeout = new ResendEnquiryReceiver({ apiKey: "re_secret_test_key", from: "from@example.com", to: ["to@example.com"], fetchImpl: timeoutFetch, timeoutMs: 1 });
    await expect(shortTimeout.receive(enquiry)).rejects.toMatchObject({ category: "timeout" });

    const networkFailure = receiver(vi.fn<typeof fetch>().mockRejectedValue(new Error("private network detail")));
    await expect(networkFailure.receive(enquiry)).rejects.toMatchObject({ category: "network" });
    await expect(networkFailure.receive(enquiry)).rejects.not.toThrow("private network detail");
  });
});
