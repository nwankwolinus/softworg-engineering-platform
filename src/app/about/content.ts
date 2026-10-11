import { siteConfig } from "@/shared/config/site";

/** About page copy: capabilities and working principles only. No history, team, clients or results. Awaiting company approval. */

export const aboutHero = {
  eyebrow: "About",
  title: "Software and AI engineering, grounded in practical problems",
  description:
    `${siteConfig.name} designs and builds software products, AI-powered solutions, and digital automation systems. Our work starts from the problem to be solved, not from the technology.`,
} as const;

export const whatWeDo = {
  eyebrow: "What we do",
  title: `What ${siteConfig.name} does`,
  description: "Four connected capabilities cover the path from an idea to working technology.",
} as const;

export const philosophy = {
  eyebrow: "Engineering philosophy",
  title: "Understand first, then build",
  description: "A practical orientation that shapes how technology work is approached from start to finish.",
  steps: [
    { title: "Understand the problem", description: "Start with who is affected and what needs to change, before choosing any tools." },
    { title: "Define requirements", description: "Agree what the solution must do and which constraints it must respect." },
    { title: "Architect appropriately", description: "Choose a structure that fits the problem and is no more complex than it needs to be." },
    { title: "Build incrementally", description: "Deliver working pieces step by step, so progress is visible and direction can be corrected." },
    { title: "Test and improve", description: "Check behaviour against requirements and refine as understanding grows." },
    { title: "Maintain the result", description: "Treat a delivered system as something that must stay understandable and changeable." },
  ],
} as const;

export const approachToTechnology = {
  eyebrow: "How we approach technology",
  title: "Principles in practice",
  description: "These describe how we intend to work. They are priorities, not measured results.",
  items: [
    { term: "Maintainability", detail: "Clear structure and sensible boundaries keep systems easy to understand and change." },
    { term: "Practical AI", detail: "AI is used where it addresses a defined need, with attention to its limits." },
    { term: "Automation", detail: "Repetitive work is automated where it saves effort without hiding important decisions." },
    { term: "Modular architecture", detail: "Separating concerns lets parts evolve, be tested and be replaced independently." },
    { term: "Security awareness", detail: "Security is considered during design and implementation, not added at the end." },
    { term: "Testing", detail: "Automated checks protect behaviour as a system changes." },
    { term: "Incremental delivery", detail: "Small releases reduce risk and keep feedback close to the work." },
  ],
} as const;

export const mindset = {
  eyebrow: "Technology mindset",
  title: "Technology in service of the problem",
  statement: "Technology should solve a real problem rather than exist for its own sake.",
  paragraphs: [
    "That means asking what outcome an organisation needs, and whether software, automation or AI is the right way to reach it.",
    "Sometimes the right answer is a simple tool and sometimes it is a larger system. We aim to recommend what fits the problem.",
  ],
} as const;
