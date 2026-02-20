import { ResourceList } from "./ResourceList";
import type { ContextPack } from "./contextPackTypes";

interface ContextPackDisplayProps {
  pack: ContextPack;
  isDark: boolean;
}

export function ContextPackDisplay({ pack, isDark }: ContextPackDisplayProps) {
  // Group resources by type
  const codeResources = pack.resources.filter((r) => r.type === "code");
  const docsResources = pack.resources.filter((r) => r.type === "docs");
  const otherResources = pack.resources.filter((r) => r.type === "other");

  return (
    <div className="context-pack-display">
      {/* Summary Section */}
      <section className="pack-section summary-section">
        <h3 className="section-title">
          <span className="section-icon">📝</span>
          Summary
        </h3>
        <p className="summary-text">{pack.summary}</p>
      </section>

      {/* Resources Section */}
      {pack.resources.length > 0 && (
        <section className="pack-section resources-section">
          <h3 className="section-title">
            <span className="section-icon">📚</span>
            Key Resources
            <span className="resource-count">{pack.resources.length}</span>
          </h3>

          {codeResources.length > 0 && (
            <div className="resource-group">
              <h4 className="resource-type-label">
                <span className="type-badge code">Code</span>
                <span className="count">{codeResources.length}</span>
              </h4>
              <ResourceList resources={codeResources} isDark={isDark} />
            </div>
          )}

          {docsResources.length > 0 && (
            <div className="resource-group">
              <h4 className="resource-type-label">
                <span className="type-badge docs">Docs</span>
                <span className="count">{docsResources.length}</span>
              </h4>
              <ResourceList resources={docsResources} isDark={isDark} />
            </div>
          )}

          {otherResources.length > 0 && (
            <div className="resource-group">
              <h4 className="resource-type-label">
                <span className="type-badge other">Other</span>
                <span className="count">{otherResources.length}</span>
              </h4>
              <ResourceList resources={otherResources} isDark={isDark} />
            </div>
          )}
        </section>
      )}

      {/* Open Questions Section */}
      {pack.openQuestions.length > 0 && (
        <section className="pack-section questions-section">
          <h3 className="section-title">
            <span className="section-icon">❓</span>
            Open Questions
            <span className="resource-count">{pack.openQuestions.length}</span>
          </h3>
          <ul className="questions-list">
            {pack.openQuestions.map((question, idx) => (
              <li key={idx} className="question-item">
                {question}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Next Actions Section */}
      {pack.nextActions.length > 0 && (
        <section className="pack-section actions-section">
          <h3 className="section-title">
            <span className="section-icon">✅</span>
            Next Actions
            <span className="resource-count">{pack.nextActions.length}</span>
          </h3>
          <ol className="actions-list">
            {pack.nextActions.map((action, idx) => (
              <li key={idx} className="action-item">
                <span className="action-number">{idx + 1}</span>
                <span className="action-text">{action}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Empty State */}
      {pack.resources.length === 0 &&
        pack.openQuestions.length === 0 &&
        pack.nextActions.length === 0 && (
          <div className="empty-pack-state">
            <p>No resources or actions found for this context pack.</p>
          </div>
        )}
    </div>
  );
}
