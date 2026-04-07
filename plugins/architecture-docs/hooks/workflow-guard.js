// Architecture Docs — Workflow Guard Hook (Advisory)
// PreToolUse hook that softly nudges when editing code files while a documentation pipeline is active.
// This is ADVISORY ONLY — it does not block any operations.

const ALLOWED_PATTERNS = [
  /CLAUDE\.md$/i,
  /plugin\.json$/,
  /README\.md$/i,
  /\.gitignore$/,
  /docs\//,
  /\.planning\//,
  /\.claude\//,
];

export default async function workflowGuard({ tool, input }) {
  // Only check Write and Edit operations
  if (tool !== "Write" && tool !== "Edit") {
    return;
  }

  const filePath = input?.file_path || input?.path || "";

  // Allow files in the allowed patterns
  if (ALLOWED_PATTERNS.some((pattern) => pattern.test(filePath))) {
    return;
  }

  // Check if a pipeline is active
  let pipelineActive = false;
  try {
    const fs = await import("fs/promises");
    const state = await fs.readFile(
      "docs/context/PIPELINE-STATE.md",
      "utf-8"
    );
    pipelineActive = state.includes("Status: In Progress");
  } catch {
    // No pipeline state or not in progress — skip
    return;
  }

  if (!pipelineActive) {
    return;
  }

  // Advisory nudge — do NOT block the operation
  return {
    additionalContext:
      "📋 Note: An architecture documentation pipeline is in progress. " +
      "You're editing code outside the docs/ directory. Consider completing the pipeline first, " +
      "or use `/architecture-docs:implement` to translate your design into code with proper verification.",
  };
}
