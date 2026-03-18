import { useMemo, useState } from "react";
import { useApp } from "../../core/useApp";
import DataTable from "../../shared/components/DataTable";

export default function AssetTable({ assets, onEdit, onDelete }) {
  const { hasPermission, PERMISSIONS } = useApp();

  const [filters, setFilters] = useState({
    status: "",
    category: "",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const canEdit = hasPermission(PERMISSIONS.EDIT_ASSET);
  const canDelete = hasPermission(PERMISSIONS.DELETE_ASSET);

  const filteredAssets = useMemo(() => {
    let filtered = [...assets];

    if (filters.status) {
      filtered = filtered.filter(a => a.status === filters.status);
    }

    if (filters.category) {
      filtered = filtered.filter(a => a.category === filters.category);
    }

    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      filtered = filtered.filter(a =>
        [a.name, a.category, a.brand, a.model, a.status, a.location]
          .filter(Boolean)
          .some(field => field.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [assets, filters, debouncedSearch]);

  const filterOptions = useMemo(() => {
    return {
      categories: [...new Set(assets.map(a => a.category))],
      statuses: [...new Set(assets.map(a => a.status))],
    };
  }, [assets]);

  const columns = [
    {
      key: "name",
      header: "Asset Name",
      render: (v, a) => (
        <div>
          <b>{v}</b>
          <div className="text-muted small">{a.brand} {a.model}</div>
        </div>
      ),
    },
    { key: "category", header: "Category" },
    {
      key: "status",
      header: "Status",
      render: (v) => <span className="badge bg-success">{v}</span>,
    },
    {
      key: "assigned_to",
      header: "Assigned To",
      render: (v) => v ? `User ${v}` : "Unassigned",
    },
    {
      key: "purchase_date",
      header: "Purchase Date",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, asset) => {
        if (!canEdit && !canDelete) return "-";

        return (
          <>
            {canEdit && (
              <button onClick={() => onEdit(asset)} className="btn btn-sm btn-primary me-1">Edit</button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(asset.id)} className="btn btn-sm btn-danger">Delete</button>
            )}
          </>
        );
      },
    },
  ];

  return (
    <div className="card p-3">
      <div className="d-flex gap-2 mb-3">
        <select
          className="form-select form-select-sm"
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          {filterOptions.statuses.map(s => <option key={s}>{s}</option>)}
        </select>

        <select
          className="form-select form-select-sm"
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="">All Categories</option>
          {filterOptions.categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <DataTable
        data={filteredAssets}
        columns={columns}
        searchable
        paginated
        onSearchChange={setDebouncedSearch}
      />
    </div>
  );
}