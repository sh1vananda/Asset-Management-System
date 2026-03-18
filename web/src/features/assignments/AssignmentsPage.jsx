import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../core/useApp";
import { useAssignments } from "./useAssignments";
import { useAssets } from "../assets/useAssets";
import { useIssues } from "../issues/useIssues";
import DataTable from "../../shared/components/DataTable";
import ErrorBoundary from "../../shared/components/ErrorBoundary";
import Loader from "../../shared/components/Loader";
import { normalizeRole, ROLES, STORAGE_KEYS } from "../../core/constants";

const getPersistedActiveMap = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS_ACTIVE_MAP);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const persistActiveMap = (map) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS_ACTIVE_MAP, JSON.stringify(map));
  } catch {
    // Ignore storage failures.
  }
};

const getPersistedHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const persistHistory = (rows) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS_HISTORY, JSON.stringify(rows));
  } catch {
    // Ignore storage failures.
  }
};

const getPersistedHiddenHistoryKeys = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS_HISTORY_HIDDEN);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const persistHiddenHistoryKeys = (keys) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS_HISTORY_HIDDEN, JSON.stringify(keys));
  } catch {
    // Ignore storage failures.
  }
};

const historyKeyForRow = (row) => `${Number(row?.id) || 0}:${Number(row?.asset_id) || 0}`;

export default function AssignmentsPage() {
  const { user } = useApp();
  const {
    assignments = [],
    assignAsset,
    returnAsset,
    findActiveAssignmentByAsset,
    scanActiveAssignmentsForAssets,
    error,
    loading,
  } = useAssignments();
  const { assets = [], loading: assetsLoading } = useAssets();
  const { issues = [] } = useIssues();

  const role = normalizeRole(user?.role);
  const isAdminOrIT = role === ROLES.ADMIN || role === ROLES.IT_MANAGER;

  const [assetId, setAssetId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [activeAssignmentMap, setActiveAssignmentMap] = useState(() => getPersistedActiveMap());
  const [assignmentHistory, setAssignmentHistory] = useState(() => getPersistedHistory());
  const [hiddenHistoryKeys, setHiddenHistoryKeys] = useState(() => getPersistedHiddenHistoryKeys());
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let isCancelled = false;

    const refreshActiveAssignments = async () => {
      if (!isAdminOrIT || assets.length === 0) return;

      const scanned = await scanActiveAssignmentsForAssets(assets.map((asset) => asset.id));
      if (isCancelled) return;

      setActiveAssignmentMap(scanned);
      persistActiveMap(scanned);
    };

    refreshActiveAssignments();

    return () => {
      isCancelled = true;
    };
  }, [isAdminOrIT, assets, scanActiveAssignmentsForAssets]);

  const mergedAssignmentHistory = useMemo(() => {
    if (!isAdminOrIT) return assignmentHistory;

    const nextRows = Array.isArray(assignmentHistory) ? [...assignmentHistory] : [];
    const existingAssignmentIds = new Set(
      nextRows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id) && id > 0)
    );

    Object.entries(activeAssignmentMap).forEach(([assetId, info]) => {
      const assignmentId = Number(info.assignment_id);
      if (!assignmentId || existingAssignmentIds.has(assignmentId)) return;

      nextRows.push({
        id: assignmentId,
        asset_id: Number(assetId),
        user_id: Number(info.user_id),
        status: "assigned",
        updated_at: 0,
      });
    });

    return nextRows
      .filter((row) => !hiddenHistoryKeys.includes(historyKeyForRow(row)))
      .sort((a, b) => Number(b.updated_at || 0) - Number(a.updated_at || 0));
  }, [isAdminOrIT, assignmentHistory, activeAssignmentMap, hiddenHistoryKeys]);

  useEffect(() => {
    if (!isAdminOrIT) return;
    persistHistory(mergedAssignmentHistory);
  }, [isAdminOrIT, mergedAssignmentHistory]);

  useEffect(() => {
    if (!isAdminOrIT) return;
    persistHiddenHistoryKeys(hiddenHistoryKeys);
  }, [isAdminOrIT, hiddenHistoryKeys]);

  const assetNameById = useMemo(() => {
    const map = {};
    assets.forEach((asset) => {
      map[asset.id] = asset.name;
    });
    return map;
  }, [assets]);

  // For admins: show history (active + returned). For employees: show their own assignments from backend.
  const displayAssignments = useMemo(
    () => {
      let data = [];
      
      if (isAdminOrIT) {
        data = mergedAssignmentHistory;
      } else {
        // For employees: show only their own assignments from backend
        data = assignments;
      }

      return data.map((row) => ({
        ...row,
        assetName: assetNameById[row.asset_id] || `Asset ${row.asset_id}`,
      }));
    },
    [mergedAssignmentHistory, assignments, isAdminOrIT, assetNameById]
  );

  const assetsWithActiveIssues = useMemo(() => {
    const blockedStatuses = new Set(["open", "in_progress"]);
    const blockedAssetIds = new Set();
    issues.forEach((issue) => {
      const normalizedStatus = String(issue.status || "").toLowerCase().trim().replace(/\s+/g, "_");
      if (blockedStatuses.has(normalizedStatus)) {
        blockedAssetIds.add(Number(issue.asset_id));
      }
    });
    return blockedAssetIds;
  }, [issues]);

  // Build combined asset map: includes backend assignments from activeAssignmentMap
  const allAssignedAssetMap = useMemo(() => {
    return { ...activeAssignmentMap };
  }, [activeAssignmentMap]);

  const assignableAssets = useMemo(
    () =>
      assets.filter((asset) => {
        const normalized = String(asset.status || "").toLowerCase().trim();
        const isAvailable = normalized === "available";
        const hasActiveIssue = assetsWithActiveIssues.has(Number(asset.id));
        const isAlreadyAssigned = allAssignedAssetMap[Number(asset.id)];
        return isAvailable && !hasActiveIssue && !isAlreadyAssigned;
      }),
    [assets, assetsWithActiveIssues, allAssignedAssetMap]
  );

  const unavailableAssets = useMemo(
    () =>
      assets
        .filter((asset) => !assignableAssets.some((candidate) => Number(candidate.id) === Number(asset.id)))
        .map((asset) => {
          const normalized = String(asset.status || "").toLowerCase().trim();
          const assignment = allAssignedAssetMap[Number(asset.id)];
          const hasActiveIssue = assetsWithActiveIssues.has(Number(asset.id));

          let reason = asset.status || "Unavailable";
          if (assignment?.user_id) {
            reason = `Assigned to user #${assignment.user_id}`;
          } else if (hasActiveIssue) {
            reason = "Has active issue";
          } else if (normalized !== "available") {
            reason = asset.status || "Unavailable";
          }

          return { ...asset, reason };
        }),
    [assets, assignableAssets, allAssignedAssetMap, assetsWithActiveIssues]
  );

  const validateForm = () => {
    const nextErrors = {};

    if (!assetId) {
      nextErrors.assetId = "Please select an asset to assign.";
    }

    if (assetId && !assignableAssets.some((asset) => Number(asset.id) === Number(assetId))) {
      nextErrors.assetId = "Only available assets without active issues can be assigned.";
    }

    if (!assigneeId || Number.isNaN(Number(assigneeId)) || Number(assigneeId) <= 0) {
      nextErrors.assigneeId = "Enter a valid user ID.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    const targetAssigneeId = Number(assigneeId);
    const selectedAssetId = Number(assetId);

    console.log(`[Assignments] Assigning asset ${selectedAssetId} to user ${targetAssigneeId}`);

    const result = await assignAsset({
      asset_id: selectedAssetId,
      user_id: targetAssigneeId,
    });

    if (!result.success) {
      if (String(result.message || "").toLowerCase().includes("already assigned")) {
        const activeAssignment = await findActiveAssignmentByAsset(selectedAssetId);
        if (activeAssignment?.user_id) {
          const nextMap = {
            ...activeAssignmentMap,
            [selectedAssetId]: activeAssignment,
          };
          setActiveAssignmentMap(nextMap);
          persistActiveMap(nextMap);

          console.log(`[Assignments] Asset is assigned to user ${activeAssignment.user_id}`);
          setMessage(
            `ℹ️ This asset is already assigned to user #${activeAssignment.user_id}.`
          );
          return;
        }
      }

      setMessage(`❌ ${result.message}`);
      return;
    }

    // Success: Refresh active assignments from backend
    console.log(`[Assignments] Assignment successful, refreshing assignments`);
    const scanned = await scanActiveAssignmentsForAssets([selectedAssetId]);
    const nextMap = {
      ...activeAssignmentMap,
      ...scanned, // Merge scanned results
    };
    setActiveAssignmentMap(nextMap);
    persistActiveMap(nextMap);

    if (scanned[selectedAssetId]) {
      const assignmentInfo = scanned[selectedAssetId];
      setAssignmentHistory((prev) => {
        const assignmentId = Number(assignmentInfo.assignment_id);
        const exists = prev.some((row) => Number(row.id) === assignmentId);
        if (exists) {
          return prev.map((row) =>
            Number(row.id) === assignmentId
              ? { ...row, status: "assigned", user_id: Number(targetAssigneeId), updated_at: Date.now() }
              : row
          );
        }

        return [
          ...prev,
          {
            id: assignmentId,
            asset_id: Number(selectedAssetId),
            user_id: Number(targetAssigneeId),
            status: "assigned",
            updated_at: Date.now(),
          },
        ];
      });

      setHiddenHistoryKeys((prev) =>
        prev.filter((key) => key !== historyKeyForRow({ id: assignmentInfo.assignment_id, asset_id: selectedAssetId }))
      );
    }

    setMessage(`✓ Asset #${selectedAssetId} assigned successfully to user #${targetAssigneeId}.`);
    setAssetId("");
    setAssigneeId("");
  };

  const handleReturn = async (row) => {
    const assignmentId = Number(row.id);
    if (!assignmentId) {
      setMessage("❌ Assignment ID missing for this row.");
      return;
    }

    const result = await returnAsset(assignmentId);
    const alreadyReturned = String(result.message || "").toLowerCase().includes("already returned");

    if (result.success || alreadyReturned) {
      const assetIdToRemove = Number(row.asset_id);
      if (assetIdToRemove) {
        const nextMap = { ...activeAssignmentMap };
        delete nextMap[assetIdToRemove];
        setActiveAssignmentMap(nextMap);
        persistActiveMap(nextMap);
      }

      setAssignmentHistory((prev) =>
        prev.map((historyRow) =>
          Number(historyRow.id) === assignmentId
            ? { ...historyRow, status: "returned", updated_at: Date.now() }
            : historyRow
        )
      );

      setMessage("✓ Asset returned successfully.");
      return;
    }

    setMessage(`❌ ${result.message}`);
  };

  const handleDeleteHistory = (row) => {
    const key = historyKeyForRow(row);
    setHiddenHistoryKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setAssignmentHistory((prev) =>
      prev.filter(
        (historyRow) => !(Number(historyRow.id) === Number(row.id) && Number(historyRow.asset_id) === Number(row.asset_id))
      )
    );
    setMessage("✓ Assignment history row deleted.");
  };

  if (loading || assetsLoading) {
    return <Loader text="Loading assignments..." />;
  }

  const columns = [
    { key: "assetName", header: "Asset" },
    { key: "user_id", header: "Employee ID" },
    {
      key: "status",
      header: "Status",
      render: (value) =>
        value === "returned" ? (
          <span className="badge bg-secondary">Returned</span>
        ) : (
          <span className="badge bg-success">Active</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => {
        if (row.status === "returned") {
          return (
            <div className="d-flex gap-2 align-items-center">
              <span className="text-muted small">Returned</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDeleteHistory(row)}
              >
                Delete
              </button>
            </div>
          );
        }

        return (
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-warning" onClick={() => handleReturn(row)}>
              Return
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleDeleteHistory(row)}
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <ErrorBoundary>
      <div>
        <h3 className="mb-3">Assignments</h3>

        {isAdminOrIT && (
          <div className="card p-3 mb-3">
            <h6 className="mb-3">Assign Asset</h6>

            <form className="row g-3" onSubmit={handleAssign}>
              <div className="col-md-5">
                <label className="form-label">Asset</label>
                <select
                  className={`form-select ${fieldErrors.assetId ? "is-invalid" : ""}`}
                  value={assetId}
                  onChange={(e) => {
                    setAssetId(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, assetId: "" }));
                  }}
                >
                  <option value="">Select an available asset</option>
                  {assignableAssets.length > 0 && (
                    <optgroup label="Available">
                      {assignableAssets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name} (#{asset.id})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {unavailableAssets.length > 0 && (
                    <optgroup label="Unavailable" disabled>
                      {unavailableAssets.map((asset) => (
                        <option key={asset.id} value={asset.id} disabled>
                          {asset.name} (#{asset.id}) - {asset.reason}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {fieldErrors.assetId && <div className="invalid-feedback d-block">{fieldErrors.assetId}</div>}
                {assignableAssets.length === 0 && (
                  <div className="form-text text-muted">
                    No assignable assets available.
                  </div>
                )}
              </div>

              <div className="col-md-4">
                <label className="form-label">Assign To User ID</label>
                <input
                  type="number"
                  min="1"
                  className={`form-control ${fieldErrors.assigneeId ? "is-invalid" : ""}`}
                  placeholder="e.g. 7"
                  value={assigneeId}
                  onChange={(e) => {
                    setAssigneeId(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, assigneeId: "" }));
                  }}
                />
                {fieldErrors.assigneeId && <div className="invalid-feedback d-block">{fieldErrors.assigneeId}</div>}
              </div>

              <div className="col-md-3 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100">
                  Assign Asset
                </button>
              </div>
            </form>
          </div>
        )}

        {(message || error) && (
          <div className={`alert py-2 ${message?.includes("✓") ? "alert-success" : "alert-danger"}`} role="alert">
            {message || error}
          </div>
        )}

        {isAdminOrIT && (
          <div className="card p-3">
            <h6 className="mb-3">Assignment History</h6>
            {displayAssignments.length > 0 ? (
              <DataTable data={displayAssignments} columns={columns} searchable paginated />
            ) : (
              <div className="text-center text-muted py-3">
                <p>No assignments yet. Use the form above to assign assets.</p>
              </div>
            )}
          </div>
        )}

        {!isAdminOrIT && (
          <div className="card p-3">
            <h6 className="mb-3">Your Assignments</h6>
            {displayAssignments.length > 0 ? (
              <DataTable data={displayAssignments} columns={columns} searchable paginated />
            ) : (
              <div className="text-center text-muted py-3">
                <p>No assignments to display.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
