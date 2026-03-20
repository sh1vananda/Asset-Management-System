import { useCallback, useEffect, useState } from "react";
import api from "../../core/api";
import { useApp } from "../../core/useApp";
import { normalizeRole, ROLES } from "../../core/constants";
import { extractApiErrorMessage } from "../../core/errors";

export const useAssignments = () => {
  const { user } = useApp();
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAssignments = useCallback(async (targetUserId) => {
    if (!targetUserId) {
      setAssignments([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/assignments/user/${targetUserId}`);
      const rows = Array.isArray(res.data) ? res.data : [];

      setAssignments(rows.map((row) => ({
        id: row.id,
        asset_id: row.asset_id,
        user_id: row.user_id,
        status: row.status,
      })));
    } catch (err) {
      console.error("Assignments fetch error:", err.response?.data || err.message);
      setAssignments([]);
      setError(extractApiErrorMessage(err, "Failed to load assignments"));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    setEmployeesLoading(true);

    try {
      let rows = [];

      try {
        const res = await api.get("/employees");
        rows = Array.isArray(res.data) ? res.data : [];
      } catch {
        const res = await api.get("/auth/employees");
        rows = Array.isArray(res.data) ? res.data : [];
      }

      const employeeRows = rows
        .filter((row) => normalizeRole(row?.role) === ROLES.EMPLOYEE)
        .map((row) => ({
          id: Number(row.id),
          username: row.username || `Employee ${row.id}`,
          email: row.email || "",
        }))
        .filter((row) => Number.isFinite(row.id) && row.id > 0)
        .sort((a, b) => a.id - b.id);

      setEmployees(employeeRows);
    } catch (err) {
      console.error("Employees fetch error:", err.response?.data || err.message);
      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const role = normalizeRole(user?.role);
    const isAdminOrIT = role === ROLES.ADMIN || role === ROLES.IT_MANAGER;

    if (!isAdminOrIT) {
      console.log(`Fetching assignments for employee ${user.id}`);
      fetchAssignments(user.id);
      return;
    }

    fetchEmployees();
  }, [fetchAssignments, fetchEmployees, user?.id, user?.role]);

  const assignAsset = async (data) => {
    try {
      const res = await api.post("/assignments", {
        asset_id: Number(data.asset_id),
        user_id: Number(data.user_id),
      });

      console.log("Assignment successful:", res.data);

      // Force a small delay to ensure backend transaction is committed
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // Refresh assignments for the target user
      await fetchAssignments(Number(data.user_id));
      return { success: true };
    } catch (err) {
      console.error("Assign error:", err.response?.data || err.message);
      return {
        success: false,
        message: extractApiErrorMessage(err, "Failed to assign asset"),
      };
    }
  };

  const returnAsset = async (id) => {
    try {
      await api.post(`/assignments/return/${id}`);

      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "returned" } : a))
      );
      return { success: true };
    } catch (err) {
      console.error("Return error:", err.response?.data || err.message);
      return {
        success: false,
        message: extractApiErrorMessage(err, "Failed to return asset"),
      };
    }
  };

  const scanActiveAssignmentsForAssets = useCallback(async (assetIds, maxUserId = 100) => {
    const targetIds = new Set((assetIds || []).map((id) => Number(id)).filter(Boolean));
    const result = {};

    if (targetIds.size === 0) {
      return result;
    }

    // Backend has no global assignments endpoint, so we inspect per-user assignment lists in batches.
    const allUserIds = Array.from({ length: maxUserId }, (_, idx) => idx + 1);

    for (let i = 0; i < allUserIds.length; i += 10) {
      const batch = allUserIds.slice(i, i + 10);
      const responses = await Promise.all(
        batch.map(async (userId) => {
          try {
            const res = await api.get(`/assignments/user/${userId}`);
            return Array.isArray(res.data) ? res.data : [];
          } catch {
            return [];
          }
        })
      );

      responses.flat().forEach((row) => {
        const assetId = Number(row.asset_id);
        if (!targetIds.has(assetId)) return;
        if (row.status !== "assigned") return;
        if (result[assetId]) return;

        result[assetId] = {
          assignment_id: row.id,
          user_id: Number(row.user_id),
          status: row.status,
        };
      });

      if (Object.keys(result).length >= targetIds.size) {
        break;
      }
    }

    return result;
  }, []);

  const findActiveAssignmentByAsset = useCallback(async (assetId, maxUserId = 100) => {
    const numericAssetId = Number(assetId);
    if (!numericAssetId) return null;

    const map = await scanActiveAssignmentsForAssets([numericAssetId], maxUserId);
    return map[numericAssetId] || null;
  }, [scanActiveAssignmentsForAssets]);

  return {
    assignments,
    employees,
    assignAsset,
    returnAsset,
    fetchAssignments,
    fetchEmployees,
    findActiveAssignmentByAsset,
    scanActiveAssignmentsForAssets,
    loading,
    employeesLoading,
    error,
  };
};