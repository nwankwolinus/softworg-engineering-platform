import { siteConfig } from "@/shared/config/site";
import { routes } from "@/shared/constants/routes";

/** Services page copy that is not service data. The six services come from the Services repository. */

export const servicesHero = {
  eyebrow: "Services",
  title: "Software and AI engineering services",
  description:
    "Six engineering services for organisations that need dependable software, intelligent systems and automation.",
} as const;

export const overview = {
  eyebrow: "Overview",
  title: "Choose a starting point",
} as const;

export const coreServices = {
  eyebrow: "Services",
  title: "What we engineer",
} as const;

export const engagement = {
  eyebrow: "Engagement approach",
  title: "How an engagement can unfold",
  description: "Each project adapts these stages to its scope. They describe a way of working, not a fixed contract.",
  steps: [
    { title: "Discover", description: "Explore the problem, the people affected, and the context the solution must fit into." },
    { title: "Define", description: "Turn findings into clear requirements, scope, constraints and success criteria." },
    { title: "Architect", description: "Design the structure, data flows, integrations and technology choices that meet the requirements." },
    { title: "Build", description: "Implement in small, working increments, with attention to quality and security." },
    { title: "Test", description: "Verify behaviour against requirements, and check the system holds up as it changes." },
    { title: "Improve", description: "Review results and feedback, and refine the solution as needs evolve." },
  ],
} as const;

export const servicesCta = {
  title: "Not sure which service fits?",
  description:
    "Describe the problem you are trying to solve. We can explore the requirements and identify an appropriate technical direction.",
  primary: { label: "Discuss a Project", href: routes.contact },
  secondary: { label: `About ${siteConfig.name}`, href: routes.about },
} as const;
