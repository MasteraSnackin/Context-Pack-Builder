// ============================================================
// Shared Types — Single source of truth for ContextPack schema
// Import from here in ALL server and web files.
// ============================================================

export interface Resource {
    type: "code" | "docs" | "other";
    title: string;
    url: string;
    snippet: string;
}

export interface ContextPack {
    id: string;
    title: string;
    summary: string;
    resources: Resource[];
    openQuestions: string[];
    nextActions: string[];
    createdAt?: string;
}
