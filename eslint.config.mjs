import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const MODULES = ["company", "services", "projects", "products", "insights", "contact"];

/**
 * The only deliberate cross-module imports: importer -> modules whose *domain* it may import.
 * Everything else between modules is forbidden. Document each entry in ARCHITECTURE.md.
 */
const DOMAIN_IMPORTS = { projects: ["services"] };

const REACT = ["react", "react-dom", "react/*", "react-dom/*"];
const FRAMEWORK = [...REACT, "next", "next/*"];

/**
 * Allowed direction: presentation -> application -> domain <- infrastructure.
 * `composition.ts` is the only place in a module that may wire infrastructure.
 * (Flat config replaces, not merges, a rule for the same file, so each file set
 * gets exactly one combined `no-restricted-imports` entry.)
 */
const LAYERS = {
  domain: {
    framework: FRAMEWORK,
    forbidden: ["**/application/**", "**/infrastructure/**", "**/presentation/**", "**/composition", "@/app/**", "@/shared/ui/**"],
    message: "Domain must be framework-free and must not depend on any other layer.",
  },
  application: {
    framework: FRAMEWORK,
    forbidden: ["**/infrastructure/**", "**/presentation/**", "**/composition", "@/app/**", "@/shared/ui/**"],
    message: "Application code may depend on the domain only; infrastructure is injected.",
  },
  infrastructure: {
    framework: REACT,
    forbidden: ["**/presentation/**", "**/composition", "@/app/**", "@/shared/ui/**"],
    message: "Infrastructure implements domain/application contracts; it must not know about the UI.",
  },
  presentation: {
    framework: [],
    forbidden: ["**/infrastructure/**", "**/composition", "@/app/**"],
    message: "Presentation receives data via props; it must not reach into infrastructure or composition.",
  },
};

const CROSS_MODULE_MESSAGE =
  "Modules must not import each other, except domain imports listed in DOMAIN_IMPORTS. Combine modules in the app layer.";

const PARENT_RELATIVE = {
  regex: "^\\.\\./",
  message: "Use absolute '@/...' imports for anything outside the current folder so boundary rules cannot be bypassed.",
};

const crossModule = (current) =>
  MODULES.filter((other) => other !== current).flatMap((other) =>
    (DOMAIN_IMPORTS[current] ?? []).includes(other)
      ? [
          `@/modules/${other}/application/**`,
          `@/modules/${other}/infrastructure/**`,
          `@/modules/${other}/presentation/**`,
          `@/modules/${other}/composition`,
        ]
      : [`@/modules/${other}/**`],
  );

const restrict = (patterns) => ({ "no-restricted-imports": ["error", { patterns }] });

const boundaryConfigs = MODULES.flatMap((module) => [
  ...Object.entries(LAYERS).map(([layer, { framework, forbidden, message }]) => ({
    files: [`src/modules/${module}/${layer}/**/*.{ts,tsx}`],
    rules: restrict([
      ...(framework.length > 0 ? [{ group: framework, message }] : []),
      { group: forbidden, message },
      { group: crossModule(module), message: CROSS_MODULE_MESSAGE },
      PARENT_RELATIVE,
    ]),
  })),
  {
    files: [`src/modules/${module}/composition.ts`],
    rules: restrict([{ group: crossModule(module), message: CROSS_MODULE_MESSAGE }, PARENT_RELATIVE]),
  },
]);

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "coverage/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...boundaryConfigs,
  {
    // The delivery layer talks to modules through composition roots, never to infrastructure.
    files: ["src/app/**/*.{ts,tsx}"],
    rules: restrict([
      { group: ["@/modules/*/infrastructure/**"], message: "Pages and actions must use a module's composition root, not its infrastructure." },
    ]),
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: restrict([
      { group: ["@/modules/**", "@/app/**"], message: "Shared code must not depend on feature modules or the app layer." },
    ]),
  },
  // Cross-layer integration tests are legitimate; keep this last.
  { files: ["**/*.test.{ts,tsx}"], rules: { "no-restricted-imports": "off" } },
];

export default eslintConfig;
