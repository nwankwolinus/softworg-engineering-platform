import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EnquiryReceiver } from "@/modules/contact/application/enquiry-receiver";
import { createSubmitEnquiry } from "@/modules/contact/application/submit-enquiry";
import { createContactTimeToken } from "@/modules/contact/infrastructure/spam-protection";

const submitEnquiryMock = vi.fn();
vi.mock("@/modules/contact/composition", () => ({
  submitEnquiry: submitEnquiryMock,
  getContactDelivery: () => ({ mode: "test", signingSecret: "test-signing-secret-with-more-than-32-bytes" }),
  isContactSubmissionTokenValid: (token: string) => token.includes(".") && !token.endsWith("x"),
  logContactSubmissionFailure: (error: unknown) => {
    if (error instanceof Error) console.error("[contact] submission failed", { category: "unexpected" });
  },
}));

const { submitEnquiryAction } = await import("@/app/contact/actions");

function formWith(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  data.set("website", "");
  data.set("submissionToken", createContactTimeToken("test-signing-secret-with-more-than-32-bytes", Date.now() - 4_000));
  return data;
}

function enableTestDelivery() {
  vi.stubEnv("FEATURE_CONTACT_FORM", "true");
  vi.stubEnv("CONTACT_DELIVERY_MODE", "test");
  vi.stubEnv("CONTACT_SIGNING_SECRET", "test-signing-secret-with-more-than-32-bytes");
}

const fields = { name: "Ada", email: "ada@example.com", company: "", message: "A long enough message." };

describe("submitEnquiryAction", () => {
  beforeEach(() => {
    submitEnquiryMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("refuses to process anything while FEATURE_CONTACT_FORM is not enabled", async () => {
    vi.stubEnv("FEATURE_CONTACT_FORM", "false");

    const state = await submitEnquiryAction({ status: "idle" }, formWith(fields));

    expect(state).toEqual({ status: "unavailable" });
    expect(submitEnquiryMock).not.toHaveBeenCalled();
  });

  it("refuses when the flag is unset", async () => {
    vi.stubEnv("FEATURE_CONTACT_FORM", undefined);

    const state = await submitEnquiryAction({ status: "idle" }, formWith(fields));

    expect(state).toEqual({ status: "unavailable" });
    expect(submitEnquiryMock).not.toHaveBeenCalled();
  });

  it("returns success only after the use case (and therefore the receiver) resolves", async () => {
    enableTestDelivery();
    submitEnquiryMock.mockResolvedValue({ status: "success", enquiryId: "e1" });

    expect(await submitEnquiryAction({ status: "idle" }, formWith(fields))).toEqual({ status: "success" });
    expect(submitEnquiryMock).toHaveBeenCalledOnce();
  });

  it("returns an error, never success, when the receiver fails", async () => {
    enableTestDelivery();
    submitEnquiryMock.mockRejectedValue(new Error("delivery failed"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await submitEnquiryAction({ status: "idle" }, formWith(fields))).toEqual({ status: "error" });
    consoleError.mockRestore();
  });

  it("returns field errors and the submitted values for invalid input", async () => {
    enableTestDelivery();
    submitEnquiryMock.mockResolvedValue({ status: "invalid", errors: { email: "invalid_email" } });

    const state = await submitEnquiryAction({ status: "idle" }, formWith({ ...fields, email: "nope" }));

    expect(state).toMatchObject({ status: "invalid", errors: { email: "invalid_email" }, values: { email: "nope" } });
  });

  it("rejects honeypot, missing, and tampered time-trap values without submitting", async () => {
    enableTestDelivery();
    const honeypot = formWith(fields);
    honeypot.set("website", "filled by bot");
    expect(await submitEnquiryAction({ status: "idle" }, honeypot)).toEqual({ status: "spam" });

    const missingToken = new FormData();
    missingToken.set("website", "");
    expect(await submitEnquiryAction({ status: "idle" }, missingToken)).toEqual({ status: "spam" });

    const tampered = formWith(fields);
    tampered.set("submissionToken", `${tampered.get("submissionToken")}x`);
    expect(await submitEnquiryAction({ status: "idle" }, tampered)).toEqual({ status: "spam" });
    expect(submitEnquiryMock).not.toHaveBeenCalled();
  });
});

describe("submitEnquiryAction with the real use case and a spy receiver", () => {
  beforeEach(() => {
    submitEnquiryMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function wire(receiver: EnquiryReceiver) {
    submitEnquiryMock.mockImplementation(createSubmitEnquiry({ receiver }));
  }

  it("never reaches the receiver when the feature flag is off", async () => {
    vi.stubEnv("FEATURE_CONTACT_FORM", "false");
    const receive = vi.fn(async () => {});
    wire({ receive });

    const state = await submitEnquiryAction({ status: "idle" }, formWith(fields));

    expect(state).toEqual({ status: "unavailable" });
    expect(receive).not.toHaveBeenCalled();
  });

  it("does not return success until the receiver has completed", async () => {
    enableTestDelivery();
    let finishReceive!: () => void;
    const receive = vi.fn(() => new Promise<void>((resolve) => (finishReceive = resolve)));
    wire({ receive });

    let settled = false;
    const pending = submitEnquiryAction({ status: "idle" }, formWith(fields)).then((state) => {
      settled = true;
      return state;
    });

    await vi.waitFor(() => expect(receive).toHaveBeenCalledOnce());
    await Promise.resolve();
    expect(settled).toBe(false); // receiver still running: no success yet

    finishReceive();
    expect(await pending).toEqual({ status: "success" });
  });

  it("returns error, not success, when the receiver rejects", async () => {
    enableTestDelivery();
    wire({ receive: async () => Promise.reject(new Error("delivery failed")) });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await submitEnquiryAction({ status: "idle" }, formWith(fields))).toEqual({ status: "error" });
    consoleError.mockRestore();
  });

  it("does not call the receiver for invalid input", async () => {
    enableTestDelivery();
    const receive = vi.fn(async () => {});
    wire({ receive });

    const state = await submitEnquiryAction({ status: "idle" }, formWith({ ...fields, email: "nope" }));

    expect(state.status).toBe("invalid");
    expect(receive).not.toHaveBeenCalled();
  });
});
