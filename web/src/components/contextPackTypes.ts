// Web-side shared types for ContextPack.
// These re-export from the canonical server types to keep a single source of truth
// while avoiding deep relative imports across web/server boundaries in components.
export type { Resource, ContextPack } from "../../../server/src/types.js";
