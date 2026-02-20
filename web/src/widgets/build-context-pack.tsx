import "@/index.css";
import { useState, useEffect } from "react"; // Bug #6 fix: import useEffect
import { mountWidget, useLayout, useDisplayMode, useWidgetState } from "skybridge/web";
import { useToolInfo, useCallTool } from "../helpers";
import { Maximize2, Minimize2, Package, AlertCircle, CheckCircle } from "lucide-react";
import { ContextPackDisplay } from "../components/ContextPackDisplay";
import { LoadingScreen } from "../components/LoadingScreen";
import type { ContextPack } from "../components/contextPackTypes";

function BuildContextPack() {
  const { output, isPending } = useToolInfo<"build-context-pack">();
  const { callToolAsync } = useCallTool("build-context-pack");
  const { theme } = useLayout();
  const isDark = theme === "dark";
  const [displayMode, requestDisplayMode] = useDisplayMode();

  const [widgetState, setWidgetState] = useWidgetState<{
    currentPack?: ContextPack;
    allPacks?: ContextPack[];
  }>();

  const [goal, setGoal] = useState("");
  const [isBuilding, setIsBuilding] = useState(false);

  // Bug #7 fix: track error state so we can show it in the UI
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Success toast state
  const [showSuccess, setShowSuccess] = useState(false);

  // Bug #6 fix: sync widget state in useEffect, NOT during render
  // (previously this setState-during-render caused React warnings + potential loops)
  useEffect(() => {
    if (output?.contextPack && !isBuilding) {
      const pack = output.contextPack as ContextPack;
      const allPacks = output.allPacks as ContextPack[] | undefined;

      if (widgetState?.currentPack?.id !== pack.id) {
        setWidgetState(() => ({
          currentPack: pack,
          allPacks: allPacks || [pack],
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [output, isBuilding]);

  const handleBuildPack = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goal.trim()) return;

    setIsBuilding(true);
    setErrorMessage(null); // clear previous error
    setShowSuccess(false);

    try {
      const result = await callToolAsync({ goal: goal.trim() });

      if (result?.structuredContent?.contextPack) {
        setWidgetState(() => ({
          currentPack: result.structuredContent.contextPack as ContextPack,
          allPacks: result.structuredContent.allPacks as ContextPack[] | undefined,
        }));
        setGoal(""); // Clear input after successful build

        // Bug #7 fix: show success confirmation toast
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3500);
      } else {
        // Bug #7 fix: surface a meaningful error when the server returns nothing useful
        setErrorMessage("The server returned an empty response. Please try again.");
      }
    } catch (error) {
      // Bug #7 fix: display the actual error to the user instead of swallowing it
      console.error("Error building context pack:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while building your context pack. Please try again."
      );
    } finally {
      setIsBuilding(false);
    }
  };

  const toggleDisplayMode = () => {
    requestDisplayMode(displayMode === "inline" ? "fullscreen" : "inline");
  };

  if (isPending && !widgetState?.currentPack) {
    return <LoadingScreen isDark={isDark} />;
  }

  const currentPack = widgetState?.currentPack;
  const allPacks = widgetState?.allPacks || [];

  return (
    <div
      className={`context-pack-container ${isDark ? "dark" : "light"}`}
      data-llm={JSON.stringify({
        goal: goal,
        hasCurrentPack: !!currentPack,
        currentPackTitle: currentPack?.title,
        totalPacks: allPacks.length,
      })}
    >
      {/* Header */}
      <div className="header">
        <div className="header-title">
          <Package size={20} />
          <h2>Context Pack Builder</h2>
        </div>
        <button
          onClick={toggleDisplayMode}
          className="display-toggle"
          aria-label={displayMode === "inline" ? "Enter fullscreen" : "Exit fullscreen"}
        >
          {displayMode === "inline" ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </button>
      </div>

      {/* Success Toast — Bug #7 fix */}
      {showSuccess && (
        <div className="toast toast-success" role="status" aria-live="polite">
          <CheckCircle size={16} />
          <span>Context pack created successfully!</span>
        </div>
      )}

      {/* Error Banner — Bug #7 fix */}
      {errorMessage && !isBuilding && (
        <div className="toast toast-error" role="alert">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
          <button
            className="toast-dismiss"
            onClick={() => setErrorMessage(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleBuildPack} className="build-form">
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="What are you working on? (e.g., 'Ship feature X', 'Debug incident 123')"
          className="goal-input"
          disabled={isBuilding}
          autoFocus
        />
        <button
          type="submit"
          disabled={isBuilding || !goal.trim()}
          className="build-button"
        >
          {isBuilding ? "Building..." : "Build Context Pack"}
        </button>
      </form>

      {/* Loading State */}
      {isBuilding && (
        <div className="building-state">
          <div className="spinner"></div>
          <p>Gathering context from files and code...</p>
        </div>
      )}

      {/* Current Context Pack */}
      {currentPack && !isBuilding && (
        <ContextPackDisplay pack={currentPack} isDark={isDark} />
      )}

      {/* Past Context Packs */}
      {!isBuilding && allPacks.length > 1 && (
        <div className="past-packs">
          <h3>Recent Context Packs</h3>
          <div className="past-packs-list">
            {allPacks.slice(0, 5).map((pack) => (
              <button
                key={pack.id}
                className={`past-pack-item ${pack.id === currentPack?.id ? "active" : ""}`}
                onClick={() =>
                  setWidgetState((prev) => ({
                    ...prev,
                    currentPack: pack,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setWidgetState((prev) => ({ ...prev, currentPack: pack }));
                  }
                }}
              >
                <div className="past-pack-title">{pack.title}</div>
                <div className="past-pack-meta">
                  {pack.resources.length} resources • {pack.nextActions.length} actions
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!currentPack && !isBuilding && !errorMessage && (
        <div className="empty-state">
          <Package size={48} />
          <h3>Build Your First Context Pack</h3>
          <p>
            Enter a task or goal above to automatically gather relevant code, docs, and
            context.
          </p>
          <div className="example-goals">
            <p>Try examples like:</p>
            <ul>
              <li>"Ship feature X"</li>
              <li>"Debug incident 123"</li>
              <li>"Prepare Q2 review"</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

mountWidget(<BuildContextPack />);
