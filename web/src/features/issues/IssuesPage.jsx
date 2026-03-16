import { useState } from "react";
import { useApp } from "../../core/useApp";
import DataTable from "../../shared/components/DataTable";
import ErrorBoundary from "../../shared/components/ErrorBoundary";

export default function IssuesPage() {
  const {
    issues,
    assets,
    users,
    reportIssue,
    updateIssueStatus,
    hasPermission,
    PERMISSIONS,
    user
  } = useApp();

  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Check permissions
  if (!hasPermission(PERMISSIONS.REPORT_ISSUE) && !hasPermission(PERMISSIONS.UPDATE_ISSUE_STATUS)) {
    return (
      <div className="alert alert-warning">
        You don't have permission to view this page.
      </div>
    );
  }

  const handleReportIssue = (assetId, title, description, priority) => {
    reportIssue(assetId, title, description, priority);
    setShowReportForm(false);
  };

  const handleUpdateStatus = (issueId, newStatus) => {
    updateIssueStatus(issueId, newStatus);
  };

  // Prepare data for the table
  const issueData = issues.map(issue => {
    const asset = assets.find(a => a.id === issue.assetId);
    const reportedBy = users.find(u => u.id === issue.reportedBy);

    return {
      ...issue,
      assetName: asset?.name || "Unknown Asset",
      assetCategory: asset?.category || "Unknown",
      reportedByName: reportedBy?.name || "Unknown User",
    };
  });

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (value) => `#${value}`,
    },
    {
      key: "title",
      header: "Issue Title",
      render: (value, issue) => (
        <div>
          <div className="fw-bold">{value}</div>
          <small className="text-muted">{issue.assetName} - {issue.assetCategory}</small>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => {
        const statusColors = {
          Open: "danger",
          "In Progress": "warning",
          Resolved: "success",
          Closed: "secondary",
        };
        return (
          <span className={`badge bg-${statusColors[value] || "secondary"}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: "priority",
      header: "Priority",
      render: (value) => {
        const priorityColors = {
          Low: "secondary",
          Medium: "warning",
          High: "danger",
          Critical: "dark",
        };
        return (
          <span className={`badge bg-${priorityColors[value] || "secondary"}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: "reportedByName",
      header: "Reported By",
    },
    {
      key: "reportedDate",
      header: "Reported Date",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "resolvedDate",
      header: "Resolved Date",
      render: (value) => value ? new Date(value).toLocaleDateString() : "—",
    },
    {
      key: "actions",
      header: "Actions",
      render: (value, issue) => (
        <div className="d-flex gap-1">
          {hasPermission(PERMISSIONS.UPDATE_ISSUE_STATUS) && issue.status !== "Closed" && (
            <select
              className="form-select form-select-sm"
              style={{ width: "auto" }}
              value={issue.status}
              onChange={(e) => handleUpdateStatus(issue.id, e.target.value)}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          )}
        </div>
      ),
    },
  ];

  return (
    <ErrorBoundary>
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3>Issue Management</h3>
            <p className="text-muted mb-0">
              Track and resolve asset maintenance issues
            </p>
          </div>

          {hasPermission(PERMISSIONS.REPORT_ISSUE) && (
            <button
              className="btn btn-primary"
              onClick={() => setShowReportForm(true)}
            >
              Report Issue
            </button>
          )}
        </div>

        {/* Kanban Board View */}
        <div className="mb-4">
          <h5>Kanban Board</h5>
          <KanbanBoard
            issues={issueData}
            onUpdateStatus={handleUpdateStatus}
            canUpdate={hasPermission(PERMISSIONS.UPDATE_ISSUE_STATUS)}
          />
        </div>

        {/* Table View */}
        <h5 className="mb-3">All Issues</h5>
        <DataTable
          data={issueData}
          columns={columns}
          searchable={true}
          sortable={true}
          paginated={true}
          pageSize={10}
          emptyMessage="No issues reported"
        />

        {/* Report Issue Form Modal */}
        {showReportForm && (
          <IssueForm
            onSave={handleReportIssue}
            onCancel={() => setShowReportForm(false)}
            assets={assets}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

// Kanban Board Component
function KanbanBoard({ issues, onUpdateStatus, canUpdate }) {
  const statuses = ["Open", "In Progress", "Resolved", "Closed"];

  const getIssuesByStatus = (status) => {
    return issues.filter(issue => issue.status === status);
  };

  const handleDragStart = (e, issueId) => {
    e.dataTransfer.setData("text/plain", issueId);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData("text/plain");
    if (canUpdate && issueId) {
      onUpdateStatus(parseInt(issueId), newStatus);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="row">
      {statuses.map(status => (
        <div key={status} className="col-md-3 mb-3">
          <div
            className="card h-100"
            onDrop={(e) => handleDrop(e, status)}
            onDragOver={handleDragOver}
          >
            <div className="card-header">
              <h6 className="mb-0">{status}</h6>
              <small className="text-muted">
                {getIssuesByStatus(status).length} issues
              </small>
            </div>
            <div className="card-body">
              {getIssuesByStatus(status).map(issue => (
                <div
                  key={issue.id}
                  className="card mb-2"
                  draggable={canUpdate}
                  onDragStart={(e) => handleDragStart(e, issue.id)}
                  style={{ cursor: canUpdate ? "grab" : "default" }}
                >
                  <div className="card-body p-2">
                    <h6 className="card-title mb-1">{issue.title}</h6>
                    <p className="card-text small mb-1">{issue.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">#{issue.id}</small>
                      <span className={`badge bg-${issue.priority === "High" || issue.priority === "Critical" ? "danger" : "warning"} small`}>
                        {issue.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Issue Form Component
function IssueForm({ onSave, onCancel, assets }) {
  const [formData, setFormData] = useState({
    assetId: "",
    title: "",
    description: "",
    priority: "Medium",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.assetId || !formData.title.trim()) {
      alert("Please select an asset and provide a title");
      return;
    }
    onSave(formData.assetId, formData.title, formData.description, formData.priority);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Report Issue</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Asset</label>
                <select
                  className="form-select"
                  value={formData.assetId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
                  required
                >
                  <option value="">Select an asset...</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} - {asset.category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Issue Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the issue"
                  rows={4}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Report Issue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}