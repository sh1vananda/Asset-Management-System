import { useState } from "react";
import { useApp } from "../../core/useApp";
import DataTable from "../../shared/components/DataTable";
import ErrorBoundary from "../../shared/components/ErrorBoundary";

export default function IssuesPage() {
  const {
    issues = [],
    assets = [],
    users = [],
    reportIssue,
    updateIssueStatus,
    hasPermission,
    PERMISSIONS,
  } = useApp();

  const [showReportForm, setShowReportForm] = useState(false);

  if (!hasPermission(PERMISSIONS.REPORT_ISSUE)) {
    return <div className="alert alert-warning">No permission</div>;
  }

  const issueData = issues.map((issue) => {
    const asset = assets.find((a) => a.id === issue.assetId);
    const reportedBy = users.find((u) => u.id === issue.reportedBy);

    return {
      ...issue,
      assetName: asset?.name || "Unknown Asset",
      assetCategory: asset?.category || "",
      reportedByName: reportedBy?.name || "Unknown",
    };
  });

  const handleUpdateStatus = (id, status) => {
    updateIssueStatus(id, status);
  };

  const columns = [
    { key: "id", header: "ID", render: (v) => `#${v}` },
    {
      key: "title",
      header: "Issue Title",
      render: (v, i) => (
        <div>
          <b>{v}</b>
          <div className="text-muted small">
            {i.assetName} - {i.assetCategory}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (v) => <span className="badge bg-danger">{v}</span>,
    },
    {
      key: "priority",
      header: "Priority",
      render: (v) => <span className="badge bg-warning">{v}</span>,
    },
    { key: "reportedByName", header: "Reported By" },
    {
      key: "actions",
      header: "Actions",
      render: (_, issue) => (
        <select
          className="form-select form-select-sm"
          value={issue.status}
          onChange={(e) =>
            handleUpdateStatus(issue.id, e.target.value)
          }
        >
          <option>Open</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>
      ),
    },
  ];

  return (
    <ErrorBoundary>
      <div>
        <div className="d-flex justify-content-between mb-3">
          <h3>Issue Management</h3>
          <button
            className="btn btn-primary"
            onClick={() => setShowReportForm(true)}
          >
            Report Issue
          </button>
        </div>

        {/*  KANBAN */}
        <KanbanBoard
          issues={issueData}
          onUpdateStatus={handleUpdateStatus}
        />

        {/*  TABLE */}
        <DataTable data={issueData} columns={columns} searchable paginated />

        {/*  MODAL */}
        {showReportForm && (
          <IssueForm
            assets={assets}
            onSave={(assetId, title, desc, priority) => {
              reportIssue(assetId, title, desc, priority);
              setShowReportForm(false);
            }}
            onCancel={() => setShowReportForm(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

/*  KANBAN */
function KanbanBoard({ issues, onUpdateStatus }) {
  const statuses = ["Open", "In Progress", "Resolved", "Closed"];

  return (
    <div className="row mb-4">
      {statuses.map((status) => (
        <div key={status} className="col-md-3">
          <div className="card p-2">
            <h6>
              {status} ({issues.filter(i => i.status === status).length})
            </h6>

            {issues
              .filter((i) => i.status === status)
              .map((issue) => (
                <div key={issue.id} className="card p-2 mb-2">
                  <b>{issue.title}</b>
                  <small>{issue.description}</small>

                  <select
                    className="form-select form-select-sm mt-2"
                    value={issue.status}
                    onChange={(e) =>
                      onUpdateStatus(issue.id, e.target.value)
                    }
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                  </select>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/*  MODAL */
function IssueForm({ onSave, onCancel, assets }) {
  const [form, setForm] = useState({
    assetId: "",
    title: "",
    description: "",
    priority: "Medium",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form.assetId, form.title, form.description, form.priority);
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

              <select
                className="form-select mb-2"
                onChange={(e) =>
                  setForm({ ...form, assetId: e.target.value })
                }
              >
                <option>Select Asset</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              <input
                className="form-control mb-2"
                placeholder="Issue Title"
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <textarea
                className="form-control mb-2"
                placeholder="Description"
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <select
                className="form-select"
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>

            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button className="btn btn-primary">
                Report Issue
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}