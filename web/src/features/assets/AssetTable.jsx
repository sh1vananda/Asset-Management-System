import { useMemo, useState, useCallback } from "react";
import { useApp } from "../../core/useApp";
import DataTable from "../../shared/components/DataTable";

export default function AssetTable({ assets, onEdit, onDelete }) {
  const { users, hasPermission, PERMISSIONS } = useApp();
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    assignedTo: "",
  });

  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSearchChange = useCallback((value) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => setDebouncedSearch(value), 300);
    setSearchTimeout(timeout);
  }, [searchTimeout]);

  // Filter assets based on permissions and filters
  const filteredAssets = useMemo(() => {
    let filtered = assets;

    // Apply permission-based filtering
    if (!hasPermission(PERMISSIONS.VIEW_ALL_ASSETS)) {
      // Employees can only see their own assets
      const currentUser = users.find(u => u.id === users.find(u => u.email === localStorage.getItem('current_user_email'))?.id);
      filtered = filtered.filter(asset => asset.assignedTo === currentUser?.id);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(asset => asset.status === filters.status);
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(asset => asset.category === filters.category);
    }

    // Apply assigned user filter
    if (filters.assignedTo) {
      filtered = filtered.filter(asset => asset.assignedTo?.toString() === filters.assignedTo);
    }

    // Apply search filter
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      filtered = filtered.filter(asset =>
        [asset.name, asset.category, asset.brand, asset.model, asset.status, asset.location]
          .filter(Boolean)
          .some(field => field.toString().toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [assets, filters, debouncedSearch, hasPermission, PERMISSIONS, users]);

  // Get unique categories and statuses for filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(assets.map(a => a.category).filter(Boolean))];
    const statuses = [...new Set(assets.map(a => a.status).filter(Boolean))];

    return { categories, statuses };
  }, [assets]);

  // Define table columns
  const columns = useMemo(() => [
    {
      key: "name",
      header: "Asset Name",
      render: (value, asset) => (
        <div>
          <div className="fw-bold">{value}</div>
          <small className="text-muted">{asset.brand} {asset.model}</small>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
    },
    {
      key: "status",
      header: "Status",
      render: (value) => {
        const statusColors = {
          Available: "success",
          Assigned: "primary",
          Maintenance: "warning",
          Retired: "secondary",
        };
        return (
          <span className={`badge bg-${statusColors[value] || "secondary"}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      render: (value) => {
        if (!value) return <span className="text-muted">Unassigned</span>;
        const user = users.find(u => u.id === value);
        return user ? user.name : "Unknown User";
      },
    },
    {
      key: "location",
      header: "Location",
    },
    {
      key: "purchaseDate",
      header: "Purchase Date",
      render: (value) => value ? new Date(value).toLocaleDateString() : "—",
    },
    {
      key: "actions",
      header: "Actions",
      render: (value, asset) => (
        <div className="d-flex gap-1">
          {hasPermission(PERMISSIONS.EDIT_ASSET) && (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => onEdit(asset)}
              type="button"
              title="Edit Asset"
            >
              <i className="bi bi-pencil"></i> Edit
            </button>
          )}
          {hasPermission(PERMISSIONS.DELETE_ASSET) && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(asset.id)}
              type="button"
              title="Delete Asset"
            >
              <i className="bi bi-trash"></i> Delete
            </button>
          )}
          {hasPermission(PERMISSIONS.REPORT_ISSUE) && (
            <button
              className="btn btn-sm btn-outline-info"
              onClick={() => alert(`Support for ${asset.name} - Please contact IT support at support@company.com`)}
              type="button"
              title="Get Support"
            >
              <i className="bi bi-headset"></i> Support
            </button>
          )}
        </div>
      ),
    },
  ], [users, hasPermission, PERMISSIONS, onEdit, onDelete]);

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  return (
    <div className="card p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Asset Inventory</h5>
        <div className="d-flex gap-2">
          {/* Status Filter */}
          <select
            className="form-select form-select-sm"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            style={{ minWidth: 120 }}
          >
            <option value="">All Statuses</option>
            {filterOptions.statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            className="form-select form-select-sm"
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            style={{ minWidth: 120 }}
          >
            <option value="">All Categories</option>
            {filterOptions.categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Assigned User Filter */}
          {hasPermission(PERMISSIONS.VIEW_ALL_ASSETS) && (
            <select
              className="form-select form-select-sm"
              value={filters.assignedTo}
              onChange={(e) => handleFilterChange("assignedTo", e.target.value)}
              style={{ minWidth: 140 }}
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <DataTable
        data={filteredAssets}
        columns={columns}
        searchable={true}
        sortable={true}
        paginated={true}
        pageSize={10}
        emptyMessage="No assets match the current filters"
        onSearchChange={handleSearchChange}
      />
    </div>
  );
}
