import { routes } from "@/shared/constants/routes";

/** The closing call to action shared by the homepage and the internal pages. Awaiting company approval. */
export const contactCta = {
  title: "Have a Technology Challenge to Solve?",
  description:
    "Tell us about your idea, process, or engineering challenge. We can explore the requirements and identify an appropriate technical direction.",
  primary: { label: "Discuss a Project", href: routes.contact },
  secondary: { label: "Explore Our Services", href: routes.services },
} as const;
