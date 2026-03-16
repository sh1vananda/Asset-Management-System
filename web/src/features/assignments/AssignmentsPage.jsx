import { useState } from "react";
import { useApp } from "../../core/useApp";
import DataTable from "../../shared/components/DataTable";
import ErrorBoundary from "../../shared/components/ErrorBoundary";

export default function AssignmentsPage() {
  const {
    assignments,
    assets,
    users,
    assignAsset,
    returnAsset,
    hasPermission,
    PERMISSIONS
  } = useApp();

  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Check permissions
  if (!hasPermission(PERMISSIONS.ASSIGN_ASSET) && !hasPermission(PERMISSIONS.RETURN_ASSET)) {
    return (
      <div className="alert alert-warning">
        You don't have permission to view this page.
      </div>
    );
  }

  const handleAssign = (assetId, userId, notes) => {
    assignAsset(assetId, userId, notes);
    setShowAssignForm(false);
  };

  const handleReturn = (assignmentId) => {
    if (window.confirm("Are you sure you want to return this asset?")) {
      returnAsset(assignmentId);
    }
  };

  // Prepare data for the table
  const assignmentData = assignments.map(assignment => {
    const asset = assets.find(a => a.id === assignment.assetId);
    const user = users.find(u => u.id === assignment.userId);
    const assignedBy = users.find(u => u.id === assignment.assignedBy);

    return {
      ...assignment,
      assetName: asset?.name || "Unknown Asset",
      assetCategory: asset?.category || "Unknown",
      userName: user?.name || "Unknown User",
      userEmail: user?.email || "Unknown",
      assignedByName: assignedBy?.name || "System",
    };
  });

  const columns = [
    {
      key: "assetName",
      header: "Asset",
      render: (value, assignment) => (
        <div>
          <div className="fw-bold">{value}</div>
          <small className="text-muted">{assignment.assetCategory}</small>
        </div>
      ),
    },
    {
      key: "userName",
      header: "Assigned To",
      render: (value, assignment) => (
        <div>
          <div>{value}</div>
          <small className="text-muted">{assignment.userEmail}</small>
        </div>
      ),
    },
    {
      key: "assignedDate",
      header: "Assigned Date",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "returnDate",
      header: "Return Date",
      render: (value) => value ? new Date(value).toLocaleDateString() : "Active",
    },
    {
      key: "assignedByName",
      header: "Assigned By",
    },
    {
      key: "notes",
      header: "Notes",
      render: (value) => value || "—",
    },
    {
      key: "actions",
      header: "Actions",
      render: (value, assignment) => (
        <div className="d-flex gap-1">
          {!assignment.returnDate && hasPermission(PERMISSIONS.RETURN_ASSET) && (
            <button
              className="btn btn-sm btn-outline-warning"
              onClick={() => handleReturn(assignment.id)}
              title="Return Asset"
            >
              <i className="bi bi-arrow-return-left"></i> Return
            </button>
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
            <h3>Asset Assignments</h3>
            <p className="text-muted mb-0">
              Track and manage asset assignments to users
            </p>
          </div>

          {hasPermission(PERMISSIONS.ASSIGN_ASSET) && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAssignForm(true)}
            >
              Assign Asset
            </button>
          )}
        </div>

        <DataTable
          data={assignmentData}
          columns={columns}
          searchable={true}
          sortable={true}
          paginated={true}
          pageSize={10}
          emptyMessage="No assignments found"
        />

        {/* Assignment Form Modal would go here */}
        {showAssignForm && (
          <AssignmentForm
            onSave={handleAssign}
            onCancel={() => setShowAssignForm(false)}
            assets={assets}
            users={users}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

// Simple assignment form component
function AssignmentForm({ onSave, onCancel, assets, users }) {
  const [formData, setFormData] = useState({
    assetId: "",
    userId: "",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.assetId || !formData.userId) {
      alert("Please select both an asset and a user");
      return;
    }
    onSave(formData.assetId, formData.userId, formData.notes);
  };

  const availableAssets = assets.filter(asset => asset.status === "Available");
  const availableUsers = users.filter(user => user.role !== "Admin" || true); // Allow assigning to anyone for demo

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Assign Asset</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Select Asset</label>
                <select
                  className="form-select"
                  value={formData.assetId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
                  required
                >
                  <option value="">Choose an asset...</option>
                  {availableAssets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} - {asset.category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Assign To</label>
                <select
                  className="form-select"
                  value={formData.userId}
                  onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                  required
                >
                  <option value="">Choose a user...</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes about the assignment"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Assign Asset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}