import { useState } from "react";
import { useApp } from "../../core/useApp";
import { useAssignments } from "./useAssignments"; // ✅ NEW
import DataTable from "../../shared/components/DataTable";
import ErrorBoundary from "../../shared/components/ErrorBoundary";

export default function AssignmentsPage() {
  const { user, hasPermission, PERMISSIONS } = useApp();

  // ✅ USE HOOK INSTEAD OF CONTEXT
  const {
    assignments = [],
    assignAsset,
    returnAsset
  } = useAssignments();

  const [showAssignForm, setShowAssignForm] = useState(false);

  const isAdmin = hasPermission(PERMISSIONS.ASSIGN_ASSET);

  const currentUser = user;

  const visibleAssignments = isAdmin
    ? assignments
    : assignments.filter(a => a.userId === currentUser?.id);

  const assignmentData = visibleAssignments.map(a => ({
    ...a,
    assetName: `Asset ${a.assetId}`,
    assetCategory: "N/A",
    userName: `User ${a.userId}`,
    userEmail: "N/A",
    assignedByName: "System"
  }));

  const columns = [
    { key: "assetName", header: "Asset" },
    { key: "userName", header: "Employee" },
    {
      key: "assignedDate",
      header: "Assigned",
      render: v => new Date(v).toLocaleDateString()
    },
    {
      key: "returnDate",
      header: "Status",
      render: v =>
        v ? "Returned" : "Active"
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, a) =>
        !a.returnDate && isAdmin && (
          <button
            className="btn btn-sm btn-warning"
            onClick={() => returnAsset(a.id)}
          >
            Return
          </button>
        )
    }
  ];

  return (
    <ErrorBoundary>
      <div>
        <h3>Assignments</h3>

        <DataTable
          data={assignmentData}
          columns={columns}
          searchable
          paginated
        />
      </div>
    </ErrorBoundary>
  );
}