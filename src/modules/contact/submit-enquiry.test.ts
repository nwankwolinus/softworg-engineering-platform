import { describe, expect, it } from "vitest";
import type { EnquiryReceiver } from "@/modules/contact/application/enquiry-receiver";
import { createSubmitEnquiry } from "@/modules/contact/application/submit-enquiry";
import type { ContactEnquiry } from "@/modules/contact/domain/contact-enquiry";

function setup(receiver?: EnquiryReceiver) {
  const received: ContactEnquiry[] = [];
  const defaultReceiver: EnquiryReceiver = { receive: async (enquiry) => void received.push(enquiry) };
  const submitEnquiry = createSubmitEnquiry({
    receiver: receiver ?? defaultReceiver,
    generateId: () => "enquiry-1",
    now: () => new Date("2025-01-01T00:00:00.000Z"),
  });
  return { received, submitEnquiry };
}

const validInput = {
  name: "  Ada Lovelace ",
  email: "ada@example.com",
  company: "",
  message: "We need help with an automation project.",
};

describe("submitEnquiry", () => {
  it("forwards a valid, trimmed enquiry to the receiver", async () => {
    const { received, submitEnquiry } = setup();

    const result = await submitEnquiry(validInput);

    expect(result).toEqual({ status: "success", enquiryId: "enquiry-1" });
    expect(received).toEqual([
      {
        id: "enquiry-1",
        receivedAt: "2025-01-01T00:00:00.000Z",
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "We need help with an automation project.",
      },
    ]);
  });

  it("rejects invalid input without calling the receiver", async () => {
    const { received, submitEnquiry } = setup();

    const result = await submitEnquiry({ name: "", email: "not-an-email", message: "short" });

    expect(result).toEqual({
      status: "invalid",
      errors: { name: "required", email: "invalid_email", message: "too_short" },
    });
    expect(received).toHaveLength(0);
  });

  it("does not report success when the receiver fails", async () => {
    const failing: EnquiryReceiver = { receive: async () => Promise.reject(new Error("delivery failed")) };
    const { submitEnquiry } = setup(failing);

    await expect(submitEnquiry(validInput)).rejects.toThrow("delivery failed");
  });
});
