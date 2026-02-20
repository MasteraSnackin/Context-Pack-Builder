import { FileCode, FileText, File, ExternalLink } from "lucide-react";
import type { Resource } from "./contextPackTypes";

interface ResourceListProps {
  resources: Resource[];
  isDark: boolean;
}

export function ResourceList({ resources, isDark: _isDark }: ResourceListProps) {
  const getIcon = (type: Resource["type"]) => {
    switch (type) {
      case "code":
        return <FileCode size={16} />;
      case "docs":
        return <FileText size={16} />;
      default:
        return <File size={16} />;
    }
  };

  return (
    <div className="resource-list">
      {resources.map((resource, idx) => (
        <div key={idx} className="resource-item">
          <div className="resource-header">
            <span className="resource-icon">{getIcon(resource.type)}</span>
            <span className="resource-title">{resource.title}</span>
            {resource.url && (
              <a
                href={resource.url}
                className="resource-link"
                title="Open file"
                onClick={(e) => {
                  // For file:// URLs, prevent default and show path
                  if (resource.url.startsWith("file://") || !resource.url.startsWith("http")) {
                    e.preventDefault();
                    console.log("File path:", resource.url);
                  }
                }}
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          {resource.snippet && (
            <div className="resource-snippet">{resource.snippet}</div>
          )}
        </div>
      ))}
    </div>
  );
}
