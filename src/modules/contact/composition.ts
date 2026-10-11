import type { EnquiryReceiver } from "@/modules/contact/application/enquiry-receiver";
import { createSubmitEnquiry } from "@/modules/contact/application/submit-enquiry";
import { LogEnquiryReceiver } from "@/modules/contact/infrastructure/log-enquiry-receiver";
import { ResendEnquiryError, ResendEnquiryReceiver } from "@/modules/contact/infrastructure/resend-enquiry-receiver";
import { createContactTimeToken, verifyContactTimeToken } from "@/modules/contact/infrastructure/spam-protection";
import { readServerEnv, type ServerEnv } from "@/shared/config/env";

export interface ContactDelivery {
  mode: "disabled" | "test" | "live";
  receiver: EnquiryReceiver;
  signingSecret: string | undefined;
}

const disabledReceiver: EnquiryReceiver = {
  deliversEnquiries: false,
  async receive() {
    throw new Error("Contact delivery is unavailable (configuration)");
  },
};

/** Selects a receiver only when the complete delivery context is valid. */
export function resolveContactDelivery(env: ServerEnv): ContactDelivery {
  const { contact } = env;
  if (!env.features.contactForm || !contact.configurationValid || !contact.signingSecret) {
    return { mode: "disabled", receiver: disabledReceiver, signingSecret: undefined };
  }

  if (contact.requestedMode === "test") {
    const productionContext = env.nodeEnvironment === "production"
      || contact.deploymentEnvironment === "production"
      || env.platformDeploymentEnvironment === "production";
    if (productionContext) return { mode: "disabled", receiver: disabledReceiver, signingSecret: undefined };
    return { mode: "test", receiver: new LogEnquiryReceiver(), signingSecret: contact.signingSecret };
  }

  const isApprovedProduction = env.nodeEnvironment === "production"
    && contact.deploymentEnvironment === "production"
    && (env.platformDeploymentEnvironment === undefined || env.platformDeploymentEnvironment === "production");
  const hasCompleteProviderConfig = Boolean(
    contact.resendApiKey && contact.fromEmail && contact.recipients.length > 0 && contact.senderDomainVerified,
  );

  if (contact.requestedMode !== "live" || !isApprovedProduction || !hasCompleteProviderConfig) {
    return { mode: "disabled", receiver: disabledReceiver, signingSecret: undefined };
  }

  return {
    mode: "live",
    receiver: new ResendEnquiryReceiver({
      apiKey: contact.resendApiKey!,
      from: contact.fromEmail!,
      to: contact.recipients,
    }),
    signingSecret: contact.signingSecret,
  };
}

export function getContactDelivery(): ContactDelivery {
  return resolveContactDelivery(readServerEnv());
}

export function createContactSubmissionToken(secret: string): string {
  return createContactTimeToken(secret);
}

export function isContactSubmissionTokenValid(token: string, secret: string): boolean {
  return verifyContactTimeToken(token, secret) === "valid";
}

/** Log only controlled fields; provider response bodies and arbitrary exception messages stay private. */
export function logContactSubmissionFailure(error: unknown): void {
  if (error instanceof ResendEnquiryError) {
    console.error("[contact] delivery failed", { category: error.category, statusCode: error.statusCode });
  } else {
    console.error("[contact] submission failed", { category: "unexpected" });
  }
}

export async function submitEnquiry(input: Readonly<Record<string, unknown>>) {
  const delivery = getContactDelivery();
  return createSubmitEnquiry({ receiver: delivery.receiver })(input);
}

/** Exposed for presentation and tests; resolve this per request, not at module import. */
export const contactChannel = {
  get deliversEnquiries() {
    return getContactDelivery().mode === "live";
  },
};
