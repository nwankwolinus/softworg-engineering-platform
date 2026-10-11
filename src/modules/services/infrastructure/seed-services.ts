import { CAPABILITY_SLUGS, type Capability, type CapabilitySlug } from "@/modules/services/domain/capability";
import { SERVICE_SLUGS, type Service, type ServiceSlug } from "@/modules/services/domain/service";

// Titles are the approved wording. Summaries and highlights describe what Softworg can engineer; they contain
// no clients, results or delivered work, and are awaiting company approval. Typed as Records so a new slug
// cannot ship without content.

const capabilityContent: Record<CapabilitySlug, Omit<Capability, "slug">> = {
  "software-engineering": {
    title: "Software Engineering",
    summary:
      "Design and development of maintainable software applications, web platforms, APIs, and digital systems aligned with defined requirements.",
  },
  "ai-engineering": {
    title: "AI Engineering",
    summary:
      "Development of AI-enabled applications, intelligent assistants, retrieval-augmented generation systems, and workflow-integrated AI solutions where appropriate.",
  },
  "digital-automation": {
    title: "Digital Automation",
    summary:
      "Automation of repetitive business processes, data handling, document workflows, and integrations between digital systems.",
  },
  "product-engineering": {
    title: "Product Engineering",
    summary:
      "Structured product development covering problem definition, requirements, architecture, implementation, testing, and iterative improvement.",
  },
};

const serviceContent: Record<ServiceSlug, Omit<Service, "slug">> = {
  "custom-software-engineering": {
    title: "Custom Software Engineering",
    summary:
      "Software built around an organisation's own requirements, from the first working release through to ongoing improvement.",
    highlights: [
      "Bespoke business software",
      "Product engineering, from MVP to iteration",
      "Feature development",
      "Maintainable, tested code",
    ],
  },
  "ai-engineering-intelligent-systems": {
    title: "AI Engineering & Intelligent Systems",
    summary:
      "AI-enabled applications and intelligent systems, applied where AI is the right tool and fitted into existing workflows.",
    highlights: [
      "AI-powered applications",
      "Retrieval and knowledge systems",
      "Intelligent assistants and agents",
      "AI integration into existing workflows",
    ],
  },
  "business-process-automation": {
    title: "Business Process Automation",
    summary:
      "Automation of repetitive processes, data handling and document workflows to reduce manual effort.",
    highlights: [
      "Workflow automation",
      "Data and process automation",
      "Document and data processing",
      "Operational efficiency",
    ],
  },
  "web-application-engineering": {
    title: "Web Application Engineering",
    summary:
      "Web applications and platforms, from internal tools to customer-facing systems, engineered for clarity and maintainability.",
    highlights: [
      "Web platforms and portals",
      "Responsive user interfaces",
      "Server-side logic and APIs",
      "Accessibility and performance awareness",
    ],
  },
  "api-systems-integration": {
    title: "API & Systems Integration",
    summary:
      "Connecting software systems through well-defined interfaces so data and processes work together reliably.",
    highlights: [
      "API design and development",
      "Third-party and internal integrations",
      "Data synchronisation between systems",
      "Integration with existing workflows",
    ],
  },
  "software-architecture-consulting": {
    title: "Software Architecture & Technology Consulting",
    summary:
      "Guidance on solution structure, technology choices and engineering approach, before or during a build.",
    highlights: [
      "Solution and system architecture",
      "Technology selection",
      "Technical planning and feasibility",
      "Engineering approach and standards",
    ],
  },
};

export const seedCapabilities: Capability[] = CAPABILITY_SLUGS.map((slug) => ({ slug, ...capabilityContent[slug] }));
export const seedServices: Service[] = SERVICE_SLUGS.map((slug) => ({ slug, ...serviceContent[slug] }));
