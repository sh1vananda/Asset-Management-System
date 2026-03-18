import { useCallback, useEffect, useState } from "react";
import api from "../../core/api";
import { useApp } from "../../core/useApp";
import { normalizeRole, ROLES } from "../../core/constants";

export const useAssignments = () => {
  const { user } = useApp();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
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
      setError(err.response?.data?.error || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const role = normalizeRole(user?.role);
    const isAdminOrIT = role === ROLES.ADMIN || role === ROLES.IT_MANAGER;
    // Employees auto-load their own assignments
    // Admins will manually select a user via the input field
    if (!isAdminOrIT) {
      console.log(`Fetching assignments for employee ${user.id}`);
      fetchAssignments(user.id);
    }
  }, [fetchAssignments, user?.id, user?.role]);

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
        message: err.response?.data?.error || "Failed to assign asset",
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
        message: err.response?.data?.error || "Failed to return asset",
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
    assignAsset,
    returnAsset,
    fetchAssignments,
    findActiveAssignmentByAsset,
    scanActiveAssignmentsForAssets,
    loading,
    error,
  };
};