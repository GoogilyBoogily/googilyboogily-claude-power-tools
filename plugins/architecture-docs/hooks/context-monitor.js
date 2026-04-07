// Architecture Docs — Context Monitor Hook
// PostToolUse hook that monitors context pressure during long documentation sessions.
// Injects warnings when context usage is high, with resume instructions if a pipeline is active.

const DEBOUNCE_INTERVAL = 10; // Tool uses between checks
const WARNING_THRESHOLD = 0.35; // 35% remaining
const CRITICAL_THRESHOLD = 0.25; // 25% remaining

let toolUseCount = 0;
let lastSeverity = null;

export default async function contextMonitor({ session, tool }) {
  toolUseCount++;

  // Debounce: only check every N tool uses
  if (toolUseCount % DEBOUNCE_INTERVAL !== 0) {
    return;
  }

  // Read context metrics from statusline bridge (if available)
  const metricsPath = `/tmp/claude-ctx-${session?.id || "unknown"}.json`;
  let metrics;
  try {
    const fs = await import("fs/promises");
    const data = await fs.readFile(metricsPath, "utf-8");
    metrics = JSON.parse(data);
  } catch {
    // Metrics file not available — skip silently
    return;
  }

  const remaining = metrics.contextRemaining || 1.0;
  let severity = null;
  let message = "";

  if (remaining <= CRITICAL_THRESHOLD) {
    severity = "critical";
    message =
      "⚠️ **Context is critical** (≤25% remaining). Save your current state and consider clearing context.";
  } else if (remaining <= WARNING_THRESHOLD) {
    severity = "warning";
    message =
      "⚠️ **Context is getting heavy** (≤35% remaining). Consider wrapping up the current phase.";
  }

  if (!severity) {
    lastSeverity = null;
    return;
  }

  // Skip if same severity as last warning (unless escalation)
  if (severity === lastSeverity) {
    return;
  }

  lastSeverity = severity;

  // Check if a pipeline is active
  let pipelineActive = false;
  try {
    const fs = await import("fs/promises");
    await fs.access("docs/context/PIPELINE-STATE.md");
    pipelineActive = true;
  } catch {
    // No pipeline state file
  }

  if (pipelineActive) {
    message +=
      "\n\nPipeline state is saved at `docs/context/PIPELINE-STATE.md`. You can `/clear` and resume with:\n```\n/architecture-docs:arch-pipeline --resume\n```";
  }

  // Check if implementation is active
  let implementActive = false;
  try {
    const fs = await import("fs/promises");
    await fs.access(".continue-here.md");
    implementActive = true;
  } catch {
    // No implementation handoff file
  }

  if (implementActive) {
    message +=
      "\n\nImplementation state is saved in `.continue-here.md`. You can `/clear` and resume with:\n```\n/architecture-docs:implement --resume\n```";
  }

  return {
    additionalContext: message,
  };
}
