import { useState } from "react";
import { useApp } from "../../core/useApp";
import DataTable from "../../shared/components/DataTable";
import ErrorBoundary from "../../shared/components/ErrorBoundary";
import { ROLES } from "../../core/constants";

export default function AssignmentsPage() {
  const {
    user,
    assignments,
    assets,
    users,
    assignAsset,
    returnAsset,
    hasPermission,
    PERMISSIONS
  } = useApp();

  const [showAssignForm, setShowAssignForm] = useState(false);

  const currentUser = user;

  // const isAdmin = currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.IT_MANAGER;
  const isAdmin = hasPermission(PERMISSIONS.ASSIGN_ASSET);

  const handleAssign = (assetId, userId, notes) => {

    const alreadyAssigned = assignments.find(
      a => a.assetId === assetId && !a.returnDate
    );

    if (alreadyAssigned) {
      alert("This asset is already assigned.");
      return;
    }

    assignAsset(assetId, userId, notes);
    setShowAssignForm(false);
  };

  const handleReturn = (assignmentId) => {
    if (window.confirm("Return this asset?")) {
      returnAsset(assignmentId);
    }
  };

  const visibleAssignments = isAdmin
    ? assignments
    : assignments.filter(a => a.userId === currentUser.id);

  // Prepare table data
  const assignmentData = visibleAssignments.map(assignment => {

    const asset = assets.find(a => a.id === assignment.assetId);
    const user = users.find(u => u.id === assignment.userId);
    const assignedBy = users.find(u => u.id === assignment.assignedBy);

    return {
      ...assignment,
      assetName: asset?.name || "Unknown",
      assetCategory: asset?.category || "",
      userName: user?.name || "",
      userEmail: user?.email || "",
      assignedByName: assignedBy?.name || "System"
    };

  });

  const columns = [

    {
      key: "assetName",
      header: "Asset",
      render: (value, assignment) => (
        <div>
          <div className="fw-semibold">{value}</div>
          <small className="text-muted">{assignment.assetCategory}</small>
        </div>
      )
    },

    {
      key: "userName",
      header: "Employee",
      render: (value, assignment) => (
        <div>
          <div>{value}</div>
          <small className="text-muted">{assignment.userEmail}</small>
        </div>
      )
    },

    {
      key: "assignedDate",
      header: "Assigned",
      render: value =>
        <span className="badge bg-primary">
          {new Date(value).toLocaleDateString()}
        </span>
    },

    {
      key: "returnDate",
      header: "Status",
      render: value =>
        value
          ? <span className="badge bg-success">Returned</span>
          : <span className="badge bg-warning text-dark">Active</span>
    },

    {
      key: "assignedByName",
      header: "Assigned By"
    },

    {
      key: "notes",
      header: "Notes",
      render: value => value || "—"
    },

    {
      key: "actions",
      header: "Actions",
      render: (value, assignment) => (

        <div className="d-flex gap-2">

          {!assignment.returnDate && isAdmin && (
            <button
              className="btn btn-sm btn-warning"
              onClick={() => handleReturn(assignment.id)}
            >
              Return
            </button>
          )}

        </div>

      )
    }
  ];

  // Dashboard stats
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter(a => !a.returnDate).length;
  const returnedAssignments = assignments.filter(a => a.returnDate).length;

  return (

    <ErrorBoundary>

      <div className="container-fluid">

        <div className="mb-4">

          <h3 className="fw-bold">Asset Assignments</h3>
          <p className="text-muted">
            Manage and track employee asset allocations
          </p>

        </div>

        {/* Stats Cards */}

        <div className="row mb-4">

          <div className="col-md-4">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center">
                <h5>Total Assignments</h5>
                <h2 className="fw-bold text-primary">{totalAssignments}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center">
                <h5>Active</h5>
                <h2 className="fw-bold text-warning">{activeAssignments}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center">
                <h5>Returned</h5>
                <h2 className="fw-bold text-success">{returnedAssignments}</h2>
              </div>
            </div>
          </div>

        </div>

        {/* Assign Button */}

        {isAdmin && (

          <div className="mb-3 text-end">
            <button
              className="btn btn-primary px-4 shadow-sm"
              onClick={() => setShowAssignForm(true)}
            >
              + Assign Asset
            </button>
          </div>

        )}

        {/* Table */}

        <div className="card shadow-sm border-0">

          <div className="card-body">

            <DataTable
              data={assignmentData}
              columns={columns}
              searchable
              sortable
              paginated
              pageSize={10}
              emptyMessage="No assignments found"
            />

          </div>

        </div>

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

function AssignmentForm({ onSave, onCancel, assets, users }) {

  const [formData, setFormData] = useState({
    assetId: "",
    userId: "",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.assetId || !formData.userId) {
      alert("Please select asset and employee");
      return;
    }

    onSave(formData.assetId, formData.userId, formData.notes);
  };

  const availableAssets = assets.filter(a => a.status === "Available");

  return (

    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>

      <div className="modal-dialog modal-lg modal-dialog-centered">

        <div className="modal-content shadow-lg border-0">

          <div className="modal-header bg-primary text-white">

            <h5 className="modal-title">Assign Asset</h5>

            <button className="btn-close btn-close-white" onClick={onCancel}></button>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="modal-body">

              <div className="row">

                <div className="col-md-6 mb-3">

                  <label className="form-label fw-semibold">Select Asset</label>

                  <select
                    className="form-select"
                    value={formData.assetId}
                    onChange={(e) =>
                      setFormData({ ...formData, assetId: e.target.value })
                    }
                  >

                    <option value="">Choose asset</option>

                    {availableAssets.map(asset => (

                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({asset.category})
                      </option>

                    ))}

                  </select>

                </div>

                <div className="col-md-6 mb-3">

                  <label className="form-label fw-semibold">Employee</label>

                  <select
                    className="form-select"
                    value={formData.userId}
                    onChange={(e) =>
                      setFormData({ ...formData, userId: e.target.value })
                    }
                  >

                    <option value="">Choose employee</option>

                    {users.map(user => (

                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>

                    ))}

                  </select>

                </div>

              </div>

              <div className="mb-3">

                <label className="form-label fw-semibold">Notes</label>

                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Optional notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />

              </div>

            </div>

            <div className="modal-footer">

              <button
                type="button"
                className="btn btn-light"
                onClick={onCancel}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
              >
                Assign Asset
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>

  );

}
