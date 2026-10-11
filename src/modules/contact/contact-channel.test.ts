import { describe, expect, it } from "vitest";
import { contactChannel } from "@/modules/contact/composition";
import { LogEnquiryReceiver } from "@/modules/contact/infrastructure/log-enquiry-receiver";

describe("contact delivery honesty", () => {
  it("the log receiver never claims to deliver enquiries", () => {
    expect(new LogEnquiryReceiver().deliversEnquiries).toBe(false);
  });

  it("the composition root reports no delivery while the log receiver is wired", () => {
    expect(contactChannel.deliversEnquiries).toBe(false);
  });
});
