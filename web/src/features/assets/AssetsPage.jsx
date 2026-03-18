import { useMemo, useState } from "react";
import AssetForm from "./AssetForm";
import AssetTable from "./AssetTable";
import { useApp } from "../../core/useApp";
import { useAssets } from "./useAssets";

export default function AssetsPage() {
  const { hasPermission, PERMISSIONS } = useApp();
  const { assets, addAsset, updateAsset, deleteAsset, error } = useAssets();

  const [activeAsset, setActiveAsset] = useState(null);
  const [message, setMessage] = useState("");

  const canManageAssets =
    hasPermission(PERMISSIONS.ADD_ASSET) ||
    hasPermission(PERMISSIONS.EDIT_ASSET) ||
    hasPermission(PERMISSIONS.DELETE_ASSET);

  const stats = useMemo(() => ({
    count: assets.length,
    assigned: assets.filter(a => a.status === "Assigned").length,
    available: assets.filter(a => a.status === "Available").length,
  }), [assets]);

  if (
    !hasPermission(PERMISSIONS.VIEW_ALL_ASSETS) &&
    !hasPermission(PERMISSIONS.VIEW_OWN_ASSETS)
  ) {
    return <div>No permission</div>;
  }

  const handleSave = async (asset) => {
    const result = asset.id ? await updateAsset(asset) : await addAsset(asset);
    setMessage(result?.success ? "Asset saved successfully." : result?.message || "Action failed");

    if (!result?.success) {
      return;
    }

    setActiveAsset(null);
  };

  const handleDelete = async (id) => {
    const result = await deleteAsset(id);
    setMessage(result?.success ? "Asset deleted successfully." : result?.message || "Action failed");
  };

  return (
    <div>
      <h3>Assets</h3>

      {(message || error) && (
        <div className="alert alert-info py-2">{message || error}</div>
      )}

      {canManageAssets && (
        <AssetForm
          initialData={activeAsset}
          onSave={handleSave}
          onCancel={() => setActiveAsset(null)}
        />
      )}

      <div className="row mb-3">
        <div className="col">Total: {stats.count}</div>
        <div className="col">Assigned: {stats.assigned}</div>
        <div className="col">Available: {stats.available}</div>
      </div>

      <AssetTable
        assets={assets}
        onEdit={setActiveAsset}
        onDelete={handleDelete}
      />
    </div>
  );
}