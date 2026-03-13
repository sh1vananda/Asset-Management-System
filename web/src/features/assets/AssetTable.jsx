import { useMemo, useState } from "react";

export default function AssetTable({ assets, onEdit, onDelete }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return assets;
    return assets.filter((asset) =>
      [asset.name, asset.category, asset.brand, asset.model, asset.status]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term))
    );
  }, [assets, search]);

  return (
    <div className="card p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Assets</h5>
        <div className="input-group" style={{ maxWidth: 320 }}>
          <input
            className="form-control"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => setSearch("")}
              type="button"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">
                  No assets match the search criteria.
                </td>
              </tr>
            ) : (
              filtered.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.name}</td>
                  <td>{asset.category}</td>
                  <td>{asset.brand || "—"}</td>
                  <td>{asset.model || "—"}</td>
                  <td>{asset.status}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => onEdit(asset)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(asset.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
