import { siteConfig } from "@/shared/config/site";

/**
 * Homepage copy. Static presentation content, kept apart from the markup so it can be reviewed and
 * approved as text. Everything here describes capabilities and intent only: no clients, results,
 * statistics or history. Replace with approved wording before launch.
 */

export const hero = {
  eyebrow: "Software • AI • Digital Solutions",
  title: "Engineering Software and AI Solutions for Real-World Problems",
  description:
    `${siteConfig.name} designs and builds software products, AI-powered solutions, and digital automation systems that help organisations solve practical problems, improve processes, and turn ideas into working technology.`,
  primaryCta: "Explore Our Services",
  secondaryCta: "Discuss a Project",
} as const;

export const approach = {
  eyebrow: "Engineering approach",
  title: "How we approach technology problems",
  description:
    "A consistent way of thinking about a problem. Each engagement adapts it to its own scope and constraints.",
  steps: [
    {
      title: "Understand",
      description:
        "Clarify the problem, users, business requirements, constraints, and expected outcomes.",
    },
    {
      title: "Architect",
      description:
        "Define the solution structure, technology choices, data flows, integrations, and engineering boundaries.",
    },
    {
      title: "Build",
      description:
        "Implement the solution incrementally, with attention to maintainability, testing, security considerations, and usability.",
    },
    {
      title: "Improve",
      description:
        "Evaluate the implementation, address feedback, and refine the solution as requirements evolve.",
    },
  ],
} as const;

export const solutionAreas = {
  eyebrow: "Solution areas",
  title: "Where our engineering applies",
  description:
    "The kinds of business problems our capabilities are suited to. These are areas of focus, not a list of completed engagements.",
  items: [
    {
      title: "Business application development",
      description:
        "Internal tools and line-of-business applications shaped around how an organisation actually works.",
    },
    {
      title: "AI-assisted workflows",
      description:
        "AI placed inside existing steps such as drafting, classification and triage, with people kept in the loop where judgement matters.",
    },
    {
      title: "Knowledge retrieval and document intelligence",
      description:
        "Search and question answering over an organisation's own documents, grounded in the source material.",
    },
    {
      title: "Process and data automation",
      description:
        "Replacing repetitive manual handling of data, forms and documents with dependable automated flows.",
    },
    {
      title: "Digital product development",
      description:
        "Taking a new product from a defined problem to a working release that can be tested and improved.",
    },
    {
      title: "System integrations and APIs",
      description:
        "Connecting existing systems so data moves between them reliably, through well-defined interfaces.",
    },
  ],
} as const;

export const principles = {
  eyebrow: "Principles",
  title: "Why engineering discipline matters",
  description:
    "These are the priorities that shape our decisions. They describe how we intend to work, not measured results.",
  items: [
    {
      title: "Maintainable, clear architecture",
      description: "Systems with explicit boundaries are easier to understand, change and hand over.",
    },
    {
      title: "Practical use of AI",
      description: "AI is applied where it solves a defined problem, and left out where simpler tools do the job.",
    },
    {
      title: "Fit with real workflows",
      description: "Solutions are designed to work with the systems and processes an organisation already has.",
    },
    {
      title: "Incremental delivery and testing",
      description: "Working increments are built and tested step by step, so direction can be corrected early.",
    },
    {
      title: "Security-aware engineering",
      description: "Security is considered during design and implementation rather than added at the end.",
    },
    {
      title: "Requirements-led solutions",
      description: "Technical choices follow from clearly defined requirements and expected outcomes.",
    },
  ],
} as const;
