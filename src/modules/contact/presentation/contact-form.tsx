"use client";

import { useActionState } from "react";
import type { EnquiryField } from "@/modules/contact/domain/contact-enquiry";
import type { EnquiryErrorCode } from "@/modules/contact/domain/enquiry-validation";
import {
  initialContactFormState,
  type ContactFormState,
} from "@/modules/contact/presentation/contact-form-state";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { TextField } from "@/shared/ui/text-field";

const errorMessages: Record<EnquiryErrorCode, string> = {
  required: "This field is required.",
  too_long: "This is too long.",
  too_short: "Please give us a little more detail.",
  invalid_email: "Enter a valid email address.",
};

interface ContactFormProps {
  /** Injected by the app layer, so this component knows nothing about how submissions are handled. */
  action: (state: ContactFormState, formData: FormData) => Promise<ContactFormState>;
  /** Whether a submission really reaches Softworg. When false, the success message must not say it did. */
  deliversEnquiries: boolean;
  securityToken: string;
  contactEmail: string;
  contactPhone: string;
}

export function ContactForm({ action, deliversEnquiries, securityToken, contactEmail, contactPhone }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialContactFormState);

  if (state.status === "success") {
    return deliversEnquiries ? (
      <Notice tone="success" role="status" title="Enquiry received">
        Your enquiry was accepted for delivery. Thank you for contacting us.
      </Notice>
    ) : (
      <Notice tone="warning" role="status" title="Test submission completed">
        Your message passed validation, but this form is not connected to a mailbox yet, so nothing was sent to
        Softworg. Please contact us by email instead.
      </Notice>
    );
  }

  if (state.status === "unavailable") {
    return (
      <Notice tone="warning" role="alert" title="Enquiries unavailable">
        Enquiries cannot be submitted through this form at the moment.
      </Notice>
    );
  }

  const errors = state.status === "invalid" ? state.errors : {};
  const values = state.status === "invalid" ? state.values : {};
  const errorFor = (field: EnquiryField) => {
    const code = errors[field];
    return code ? errorMessages[code] : undefined;
  };

  return (
    <form action={formAction} aria-busy={isPending} className="flex flex-col gap-5">
      <TextField name="name" label="Name" required autoComplete="name" defaultValue={values.name} error={errorFor("name")} />
      <TextField name="email" label="Email" type="email" required autoComplete="email" defaultValue={values.email} error={errorFor("email")} />
      <TextField name="company" label="Company" autoComplete="organization" defaultValue={values.company} error={errorFor("company")} />
      <TextField
        name="message"
        label="How can we help?"
        multiline
        required
        defaultValue={values.message}
        helperText="Describe your idea, process or challenge, and anything you already know about constraints."
        error={errorFor("message")}
      />
      {state.status === "error" && (
        <Notice tone="error" role="alert" title="Not sent">
          We could not submit your enquiry. Please email <a className="underline" href={`mailto:${contactEmail}`}>{contactEmail}</a> or call{" "}
          <a className="underline" href={`tel:${contactPhone}`}>{contactPhone}</a>.
        </Notice>
      )}
      {state.status === "spam" && (
        <Notice tone="warning" role="alert" title="Submission rejected">
          We could not accept this submission. Please contact us by email or phone instead.
        </Notice>
      )}
      <input type="hidden" name="submissionToken" value={securityToken} />
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Button type="submit" disabled={isPending} size="lg" className="w-full self-start sm:w-auto">
        {isPending ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}
