import { useMemo, useState } from "react";
import { useApp } from "../../core/useApp";
import { useAssets } from "../assets/useAssets";
import { useIssues } from "./useIssues";
import DataTable from "../../shared/components/DataTable";
import ErrorBoundary from "../../shared/components/ErrorBoundary";
import { normalizeRole, ROLES } from "../../core/constants";

const STATUS_FLOW = ["open", "in_progress", "resolved", "closed"];

const STATUS_COLORS = {
  open: "bg-danger",
  in_progress: "bg-warning text-dark",
  resolved: "bg-success",
  closed: "bg-secondary",
};

export default function IssuesPage() {
  const { assets = [] } = useAssets();
  const { issues = [], reportIssue, updateIssueStatus, editIssueLocal, deleteIssueLocal, error } = useIssues();
  const { hasPermission, PERMISSIONS, user } = useApp();

  const role = normalizeRole(user?.role);
  const isAdmin = role === ROLES.ADMIN;
  const canUpdateStatus = hasPermission(PERMISSIONS.UPDATE_ISSUE_STATUS);
  const canReport = !isAdmin && hasPermission(PERMISSIONS.REPORT_ISSUE);

  const [showReportForm, setShowReportForm] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [message, setMessage] = useState("");
  const [updatingIssueId, setUpdatingIssueId] = useState(null);

  const issueData = useMemo(
    () =>
      issues.map((issue) => {
        const asset = assets.find((a) => a.id === issue.asset_id);
        const status = normalizeStatus(issue.status);

        return {
          ...issue,
          assetName: asset?.name || `Asset ${issue.asset_id}`,
          assetCategory: asset?.category || "",
          title: issue.title || issue.description,
          status,
        };
      }),
    [issues, assets]
  );

  const reportTargetAsset = useMemo(() => {
    if (assets.length > 0) {
      const first = assets[0];
      return {
        id: Number(first.id),
        name: first.name || `Asset ${first.id}`,
      };
    }

    if (issueData.length > 0) {
      const firstIssue = issueData[0];
      return {
        id: Number(firstIssue.asset_id),
        name: firstIssue.assetName || `Asset ${firstIssue.asset_id}`,
      };
    }

    return null;
  }, [assets, issueData]);

  // Admin and IT Manager can see all issues; employee sees only their own (backend returns all anyway)
  if (!hasPermission(PERMISSIONS.VIEW_ALL_ASSETS) && !hasPermission(PERMISSIONS.REPORT_ISSUE)) {
    return <div className="alert alert-warning">No permission to view issues.</div>;
  }

  const handleReportIssue = async (title, description) => {
    const assetId = reportTargetAsset?.id;
    if (!assetId) {
      setMessage("No asset available to report issue against.");
      return;
    }

    const result = await reportIssue({ assetId, title, description });
    setMessage(result.success ? "Issue reported successfully." : result.message);

    if (result.success) {
      setShowReportForm(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (!status) return;

    if (updatingIssueId === id) return;

    setUpdatingIssueId(id);
    setMessage(`Updating issue #${id} to ${statusLabel(status)}...`);

    const result = await updateIssueStatus(id, status);
    setUpdatingIssueId(null);

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    setMessage(`Issue #${id} updated to ${statusLabel(status)}.`);
  };

  const handleEditIssue = async (id, title, description) => {
    const result = editIssueLocal(id, { title, description });
    if (!result.success) {
      setMessage(result.message || "Failed to edit issue");
      return;
    }

    setMessage("Issue updated successfully.");
    setEditingIssue(null);
  };

  const handleDeleteIssue = async (id) => {
    const result = deleteIssueLocal(id);
    if (!result.success) {
      setMessage(result.message || "Failed to delete issue");
      return;
    }

    setMessage("Issue deleted from your view.");
  };

  const columns = [
    { key: "id", header: "ID", render: (v) => `#${v}` },
    {
      key: "title",
      header: "Issue Title",
      render: (v, issue) => (
        <div>
          <b>{v}</b>
          <div className="text-muted small">
            {issue.assetName} - {issue.assetCategory}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (v) => (
        <span className={`badge ${STATUS_COLORS[v] || "bg-secondary"}`}>
          {statusLabel(v)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, issue) => {
        if (!canUpdateStatus && canReport) {
          return (
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => setEditingIssue(issue)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDeleteIssue(issue.id)}
              >
                Delete
              </button>
            </div>
          );
        }

        if (!canUpdateStatus) return <span className="text-muted small">No actions</span>;

        return (
          <select
            className="form-select form-select-sm"
            value={issue.status}
            disabled={updatingIssueId === issue.id}
            onChange={(e) => handleUpdateStatus(issue.id, e.target.value)}
          >
            {STATUS_FLOW.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        );
      },
    },
  ];

  return (
    <ErrorBoundary>
      <div>
        <div className="d-flex justify-content-between mb-3">
          <h3>Issue Management</h3>
          {canReport && (
            <button className="btn btn-primary" onClick={() => setShowReportForm(true)}>
              Report Issue
            </button>
          )}
        </div>

        {(message || error) && (
          <div className={`alert py-2 ${error ? "alert-danger" : "alert-info"}`}>
            {message || error}
          </div>
        )}

        <KanbanBoard
          issues={issueData}
          onUpdateStatus={handleUpdateStatus}
          canUpdateStatus={canUpdateStatus}
          updatingIssueId={updatingIssueId}
        />

        <DataTable data={issueData} columns={columns} searchable paginated />

        {showReportForm && (
          <IssueForm
            targetAsset={reportTargetAsset}
            onSave={(title, desc) => handleReportIssue(title, desc)}
            onCancel={() => setShowReportForm(false)}
          />
        )}

        {editingIssue && (
          <EditIssueForm
            issue={editingIssue}
            onSave={(title, description) => handleEditIssue(editingIssue.id, title, description)}
            onCancel={() => setEditingIssue(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

function normalizeStatus(status) {
  if (!status) return "open";

  const normalized = status.toString().trim().toLowerCase().replace(/\s+/g, "_");
  return STATUS_FLOW.includes(normalized) ? normalized : "open";
}

function statusLabel(status) {
  if (status === "in_progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function KanbanBoard({ issues, onUpdateStatus, canUpdateStatus, updatingIssueId }) {
  return (
    <div className="row mb-4">
      {STATUS_FLOW.map((status) => {
        const filtered = issues.filter((issue) => issue.status === status);

        return (
          <div key={status} className="col-md-3">
            <div className="card p-3 h-100">
              <h6 className={`mb-2 badge ${STATUS_COLORS[status] || "bg-secondary"} d-inline-block`}>
                {statusLabel(status)} ({filtered.length})
              </h6>

              {filtered.map((issue) => (
                <div key={issue.id} className="card p-2 mb-2 border">
                  <b className="small">{issue.title}</b>
                  <small className="text-muted">{issue.assetName}</small>

                  {canUpdateStatus && (
                    <select
                      className="form-select form-select-sm mt-2"
                      value={issue.status}
                      disabled={updatingIssueId === issue.id}
                      onChange={(e) => onUpdateStatus(issue.id, e.target.value)}
                    >
                      {STATUS_FLOW.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}

              {filtered.length === 0 && <div className="text-muted small text-center mt-2">No issues</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IssueForm({ onSave, onCancel, targetAsset }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!targetAsset?.id) {
      nextErrors.asset = "No asset available for reporting.";
    }

    const finalDescription = (form.description || form.title).trim();
    if (finalDescription.length < 5) {
      nextErrors.description = "Description must be at least 5 characters.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const finalTitle = form.title.trim() || finalDescription.slice(0, 60);
    onSave(finalTitle, finalDescription);
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Report Issue</h5>
            <button className="btn-close" onClick={onCancel}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {targetAsset ? (
                <div className="alert alert-secondary py-2 mb-2">
                  Reporting against: <b>{targetAsset.name}</b> (#{targetAsset.id})
                </div>
              ) : (
                <div className="alert alert-warning py-2 mb-2">
                  No asset found for reporting. Please contact admin.
                </div>
              )}
              {fieldErrors.asset && <div className="text-danger small mb-2">{fieldErrors.asset}</div>}

              <input
                className={`form-control mb-2 ${fieldErrors.title ? "is-invalid" : ""}`}
                placeholder="Issue Title (optional)"
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  setFieldErrors((prev) => ({ ...prev, title: "" }));
                }}
              />

              <textarea
                className={`form-control mb-2 ${fieldErrors.description ? "is-invalid" : ""}`}
                placeholder="Describe the issue (write your issue here)"
                onChange={(e) => {
                  setForm({ ...form, description: e.target.value });
                  setFieldErrors((prev) => ({ ...prev, description: "" }));
                }}
              />
              {fieldErrors.description && <div className="invalid-feedback d-block">{fieldErrors.description}</div>}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={!targetAsset?.id}>Report Issue</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function EditIssueForm({ issue, onSave, onCancel }) {
  const [title, setTitle] = useState(issue?.title || "");
  const [description, setDescription] = useState(issue?.description || "");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTitle = (title || "").trim();
    const finalDescription = (description || "").trim();

    if (!finalTitle && !finalDescription) {
      setError("Enter a title or description.");
      return;
    }

    onSave(finalTitle || issue?.title || `Issue #${issue?.id}`, finalDescription || issue?.description || "");
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Edit Issue</h5>
            <button className="btn-close" onClick={onCancel}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <input
                className="form-control mb-2"
                placeholder="Issue Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError("");
                }}
              />

              <textarea
                className="form-control mb-2"
                placeholder="Issue Description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError("");
                }}
              />

              {error && <div className="text-danger small">{error}</div>}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
