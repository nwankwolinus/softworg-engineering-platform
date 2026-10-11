export type ContactDeliveryMode = "disabled" | "test" | "live";

export interface ServerEnv {
  siteUrl: string | undefined;
  nodeEnvironment: string | undefined;
  platformDeploymentEnvironment: string | undefined;
  features: { contactForm: boolean };
  contact: {
    requestedMode: ContactDeliveryMode;
    configurationValid: boolean;
    deploymentEnvironment: string | undefined;
    resendApiKey: string | undefined;
    fromEmail: string | undefined;
    senderDomainVerified: boolean;
    recipients: string[];
    signingSecret: string | undefined;
  };
}

const DEVELOPMENT_SITE_URL = "http://localhost:3000";
const EMAIL_PATTERN = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i;

export function isValidEmailAddress(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

export function readServerEnv(
  source: Readonly<Record<string, string | undefined>> = process.env,
): ServerEnv {
  const configured = source.SITE_URL?.trim();
  const isProduction = source.NODE_ENV === "production";
  let siteUrl: string | undefined;
  if (configured) {
    let parsed: URL;
    try {
      parsed = new URL(configured);
    } catch {
      throw new Error("SITE_URL is not a valid URL. Use an origin such as https://example.org");
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("SITE_URL must start with http:// or https://");
    }
    siteUrl = parsed.origin;
  } else if (!isProduction) {
    siteUrl = DEVELOPMENT_SITE_URL;
  }

  const rawMode = source.CONTACT_DELIVERY_MODE?.trim() ?? "disabled";
  const modeValid = rawMode === "disabled" || rawMode === "test" || rawMode === "live";
  const rawRecipients = source.CONTACT_NOTIFICATION_RECIPIENTS?.trim() ?? "";
  const recipients = rawRecipients ? rawRecipients.split(",").map((address) => address.trim()) : [];
  const recipientsValid = recipients.every(isValidEmailAddress);
  const apiKey = source.RESEND_API_KEY?.trim();
  const fromEmail = source.CONTACT_FROM_EMAIL?.trim();
  const signingSecret = source.CONTACT_SIGNING_SECRET?.trim();

  return {
    siteUrl,
    nodeEnvironment: source.NODE_ENV,
    platformDeploymentEnvironment: source.VERCEL_ENV?.trim().toLowerCase() || undefined,
    features: { contactForm: source.FEATURE_CONTACT_FORM === "true" },
    contact: {
      requestedMode: modeValid ? rawMode : "disabled",
      configurationValid: modeValid && recipientsValid,
      deploymentEnvironment: source.CONTACT_DEPLOYMENT_ENV?.trim().toLowerCase() || undefined,
      resendApiKey: apiKey && /^re_[A-Za-z0-9_-]{8,}$/.test(apiKey) ? apiKey : undefined,
      fromEmail: fromEmail && isValidEmailAddress(fromEmail) ? fromEmail : undefined,
      senderDomainVerified: source.CONTACT_SENDER_DOMAIN_VERIFIED === "true",
      recipients: recipientsValid ? recipients : [],
      signingSecret: signingSecret && Buffer.byteLength(signingSecret, "utf8") >= 32 ? signingSecret : undefined,
    },
  };
}
