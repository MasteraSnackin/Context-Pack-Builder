import "@/index.css";
import { useState } from "react";
import { mountWidget, useLayout, useDisplayMode } from "skybridge/web";
import { useToolInfo, useCallTool } from "../helpers";
import { Check, Trash2, Plus, Maximize2, Minimize2, Calendar } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "High",
  medium: "Med",
  low: "Low",
};

function ManageTasks() {
  const { output, isPending } = useToolInfo<"manage-tasks">();
  const { callToolAsync, isPending: isMutating } = useCallTool("manage-tasks");
  const { theme } = useLayout();
  const isDark = theme === "dark";
  const [displayMode, requestDisplayMode] = useDisplayMode();

  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [localTasks, setLocalTasks] = useState<NonNullable<typeof output>["tasks"] | null>(null);

  if (isPending) {
    return (
      <div className={`todo-container ${isDark ? "dark" : "light"}`}>
        <div className="loading">Loading tasks...</div>
      </div>
    );
  }

  const tasks = localTasks ?? output?.tasks ?? [];
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const syncWithServer = async (args: Parameters<typeof callToolAsync>[0]) => {
    const result = await callToolAsync(args);
    if (result?.structuredContent?.tasks) {
      setLocalTasks(result.structuredContent.tasks);
    }
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const title = newTitle.trim();
    const priority = newPriority;
    const dueDate = newDueDate || null;

    // Optimistic: add a temporary task at the top
    setLocalTasks([
      {
        id: `temp-${Date.now()}`,
        title,
        completed: false,
        priority,
        dueDate,
        createdAt: new Date().toISOString(),
      },
      ...tasks,
    ]);
    setNewTitle("");
    setNewDueDate("");

    // Sync: server returns the real list with proper IDs
    syncWithServer({ actions: [{ type: "add", title, priority, dueDate: dueDate ?? undefined }] });
  };

  const handleToggle = (taskId: string) => {
    // Optimistic: flip completed locally
    setLocalTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
    syncWithServer({ actions: [{ type: "toggle", taskId }] });
  };

  const handleDelete = (taskId: string) => {
    // Optimistic: remove locally
    setLocalTasks(tasks.filter((t) => t.id !== taskId));
    syncWithServer({ actions: [{ type: "delete", taskId }] });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={`todo-container ${isDark ? "dark" : "light"}`}
      data-llm={`${pendingCount} pending, ${completedCount} completed tasks`}
    >
      <div className="todo-header">
        <h2>My Tasks</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="todo-stats">
            <span className="stat pending-stat">{pendingCount} pending</span>
            <span className="stat completed-stat">{completedCount} done</span>
          </div>
          <button
            className="display-mode-btn"
            onClick={() =>
              requestDisplayMode(displayMode === "inline" ? "fullscreen" : "inline")
            }
            aria-label="Toggle display mode"
            title={displayMode === "inline" ? "Fullscreen" : "Minimize"}
          >
            {displayMode === "inline" ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Add task form */}
      <div className="add-form">
        <input
          type="text"
          className="add-input"
          placeholder="Add a new task..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          disabled={isMutating}
        />
        <div className="add-options">
          <select
            className="priority-select"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as "low" | "medium" | "high")}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input
            type="date"
            className="date-input"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
          />
          <button className="add-btn" onClick={handleAdd} disabled={isMutating || !newTitle.trim()}>
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {(["all", "pending", "completed"] as const).map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty">
            {filter === "all" ? "No tasks yet. Add one above!" : `No ${filter} tasks.`}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`task-item ${task.completed ? "completed" : ""}`}
              data-llm={`Task: "${task.title}" - ${task.completed ? "done" : "pending"}, ${task.priority} priority`}
            >
              <button
                className="checkbox"
                onClick={() => handleToggle(task.id)}
                disabled={isMutating}
                aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
              >
                {task.completed && <Check size={12} />}
              </button>
              <div className="task-content">
                <span className="task-title">{task.title}</span>
                <div className="task-meta">
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                  >
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                  {task.dueDate && (
                    <span className="due-date"><Calendar size={10} /> {formatDate(task.dueDate)}</span>
                  )}
                </div>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDelete(task.id)}
                disabled={isMutating}
                aria-label="Delete task"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ManageTasks;

mountWidget(<ManageTasks />);
