import { useEffect } from "react";
import api from "../../core/api";
import { useApp } from "../../core/useApp";

export const useAssets = () => {
  const { assets, setAssets } = useApp();

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      // ✅ BACKEND READY
      // const res = await api.get("/assets");
      // setAssets(res.data);

      // 🔥 TEMP MOCK (REMOVE LATER)
      setAssets([
        {
          id: 1,
          name: "Laptop",
          category: "Electronics",
          brand: "Dell",
          model: "XPS",
          status: "Available",
          assignedTo: null,
          location: "Office",
          purchaseDate: "2024-01-01",
        },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const addAsset = async (asset) => {
    try {
      // await api.post("/assets", asset);

      setAssets((prev) => [...prev, { ...asset, id: Date.now() }]);
    } catch (err) {
      console.error(err);
    }
  };

  const updateAsset = async (asset) => {
    try {
      // await api.put(`/assets/${asset.id}`, asset);

      setAssets((prev) =>
        prev.map((a) => (a.id === asset.id ? asset : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAsset = async (id) => {
    try {
      // await api.delete(`/assets/${id}`);

      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return { assets, fetchAssets, addAsset, updateAsset, deleteAsset };
};