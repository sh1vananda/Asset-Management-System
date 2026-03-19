import { useCallback, useEffect, useState } from "react";
import api from "../../core/api";
import { useApp } from "../../core/useApp";
import { normalizeRole, ROLES } from "../../core/constants";
import { extractApiErrorMessage } from "../../core/errors";

// ✅ IMPORTANT: named export
export const useAssets = () => {
  const { assets, setAssets, user } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAssets = useCallback(async () => {
    if (!user) {
      setAssets([]);
      return;
    }

    const role = normalizeRole(user.role);

    setLoading(true);
    setError("");

    try {
      if (role === ROLES.ADMIN || role === ROLES.IT_MANAGER) {
        const res = await api.get("/assets", {
          params: { per_page: 200 },
        });
        setAssets(res.data.items || []);
      } else {
        const assignmentRes = await api.get(`/assignments/user/${user.id}`);
        const assignedRows = (Array.isArray(assignmentRes.data) ? assignmentRes.data : []).filter(
          (row) => row.status === "assigned"
        );

        const uniqueAssetIds = [...new Set(assignedRows.map((row) => row.asset_id))];
        const assetResponses = await Promise.all(
          uniqueAssetIds.map((assetId) => api.get(`/assets/${assetId}`))
        );

        setAssets(assetResponses.map((response) => response.data));
      }
    } catch (err) {
      console.error("Assets fetch error:", err);
      setAssets([]);
      setError(extractApiErrorMessage(err, "Unable to fetch assets"));
    } finally {
      setLoading(false);
    }
  }, [user, setAssets]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const addAsset = async (asset) => {
    try {
      await api.post("/assets", asset);
      await fetchAssets();
      return { success: true };
    } catch (err) {
      console.error("Add asset error:", err);
      return {
        success: false,
        message: extractApiErrorMessage(err, "Failed to add asset"),
      };
    }
  };

  const updateAsset = async (asset) => {
    try {
      await api.put(`/assets/${asset.id}`, asset);
      await fetchAssets();
      return { success: true };
    } catch (err) {
      console.error("Update asset error:", err);
      return {
        success: false,
        message: extractApiErrorMessage(err, "Failed to update asset"),
      };
    }
  };

  const deleteAsset = async (id) => {
    try {
      await api.delete(`/assets/${id}`);
      await fetchAssets();
      return { success: true };
    } catch (err) {
      console.error("Delete asset error:", err);
      return {
        success: false,
        message: extractApiErrorMessage(err, "Failed to delete asset"),
      };
    }
  };

  return {
    assets,
    fetchAssets,
    addAsset,
    updateAsset,
    deleteAsset,
    loading,
    error,
  };
};