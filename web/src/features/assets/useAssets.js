import { useEffect } from "react";
import api from "../../core/api";
import { useApp } from "../../core/useApp";

// ✅ IMPORTANT: named export
export const useAssets = () => {
  const { assets, setAssets } = useApp();

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await api.get("/assets");

      // backend returns paginated data
      setAssets(res.data.items || []);
    } catch (err) {
      console.error("Assets fetch error:", err);
    }
  };

  const addAsset = async (asset) => {
    try {
      await api.post("/assets", asset);
      fetchAssets();
    } catch (err) {
      console.error("Add asset error:", err);
    }
  };

  const updateAsset = async (asset) => {
    try {
      await api.put(`/assets/${asset.id}`, asset);
      fetchAssets();
    } catch (err) {
      console.error("Update asset error:", err);
    }
  };

  const deleteAsset = async (id) => {
    try {
      await api.delete(`/assets/${id}`);
      fetchAssets();
    } catch (err) {
      console.error("Delete asset error:", err);
    }
  };

  return {
    assets,
    fetchAssets,
    addAsset,
    updateAsset,
    deleteAsset,
  };
};