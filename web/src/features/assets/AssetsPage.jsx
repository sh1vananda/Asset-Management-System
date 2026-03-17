import { useMemo, useState } from "react";
import AssetForm from "./AssetForm";
import AssetTable from "./AssetTable";
import { useApp } from "../../core/useApp";
import { useAssets } from "./useAssets";

export default function AssetsPage() {
  const { hasPermission, PERMISSIONS } = useApp();
  const { assets, addAsset, updateAsset, deleteAsset } = useAssets();

  const [activeAsset, setActiveAsset] = useState(null);

  if (
    !hasPermission(PERMISSIONS.VIEW_ALL_ASSETS) &&
    !hasPermission(PERMISSIONS.VIEW_OWN_ASSETS)
  ) {
    return <div>No permission</div>;
  }

  const stats = useMemo(() => ({
    count: assets.length,
    assigned: assets.filter(a => a.status === "Assigned").length,
    available: assets.filter(a => a.status === "Available").length,
  }), [assets]);

  const handleSave = (asset) => {
    asset.id ? updateAsset(asset) : addAsset(asset);
    setActiveAsset(null);
  };

  return (
    <div>
      <h3>Assets</h3>

      <AssetForm
        initialData={activeAsset}
        onSave={handleSave}
        onCancel={() => setActiveAsset(null)}
      />

      <div className="row mb-3">
        <div className="col">Total: {stats.count}</div>
        <div className="col">Assigned: {stats.assigned}</div>
        <div className="col">Available: {stats.available}</div>
      </div>

      <AssetTable
        assets={assets}
        onEdit={setActiveAsset}
        onDelete={deleteAsset}
      />
    </div>
  );
}