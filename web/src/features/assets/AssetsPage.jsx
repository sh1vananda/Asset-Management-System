import { useMemo, useState } from "react";
import AssetForm from "./AssetForm";
import AssetTable from "./AssetTable";
import { useApp } from "../../core/store";

export default function AssetsPage() {
  const { assets, addAsset, updateAsset, deleteAsset } = useApp();
  const [activeAsset, setActiveAsset] = useState(null);
  const [alert, setAlert] = useState(null);

  const stats = useMemo(() => {
    const count = assets.length;
    const byStatus = assets.reduce(
      (acc, asset) => {
        const status = asset.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {
        Available: 0,
        Assigned: 0,
        Maintenance: 0,
        Retired: 0,
      }
    );

    return { count, ...byStatus };
  }, [assets]);

  const handleSave = (asset) => {
    if (asset.id) {
      updateAsset(asset);
      setAlert({ type: "success", message: "Asset updated successfully." });
    } else {
      addAsset(asset);
      setAlert({ type: "success", message: "Asset added successfully." });
    }
    setActiveAsset(null);
    window.setTimeout(() => setAlert(null), 2500);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) {
      return;
    }
    deleteAsset(id);
    setAlert({ type: "warning", message: "Asset removed." });
    window.setTimeout(() => setAlert(null), 2500);
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <div>
          <h3>Asset Inventory</h3>
          <p className="text-muted mb-0">Manage your organization&apos;s assets and track status in real time.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setActiveAsset(null)}
          type="button"
        >
          Add Asset
        </button>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} py-2`} role="alert">
          {alert.message}
        </div>
      )}

      <AssetForm
        initialData={activeAsset}
        onSave={handleSave}
        onCancel={() => setActiveAsset(null)}
      />

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white p-3 h-100">
            <h2 className="mb-0">{stats.count}</h2>
            <div>Total Assets</div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white p-3 h-100">
            <h2 className="mb-0">{stats.Assigned}</h2>
            <div>Assigned</div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-dark p-3 h-100">
            <h2 className="mb-0">{stats.Available}</h2>
            <div>Available</div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-danger text-white p-3 h-100">
            <h2 className="mb-0">{stats.Maintenance}</h2>
            <div>Maintenance</div>
          </div>
        </div>
      </div>

      <AssetTable assets={assets} onEdit={(asset) => setActiveAsset(asset)} onDelete={handleDelete} />
    </div>
  );
}
