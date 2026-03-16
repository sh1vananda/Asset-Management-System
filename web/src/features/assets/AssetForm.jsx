import { useEffect, useState } from "react";

const defaultFormState = {
  name: "",
  category: "",
  brand: "",
  model: "",
  status: "Available",
  purchaseDate: "",
  location: "",
};

export default function AssetForm({ initialData = null, onSave, onCancel }) {
  const [form, setForm] = useState(defaultFormState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        category: initialData.category || "",
        brand: initialData.brand || "",
        model: initialData.model || "",
        status: initialData.status || "Available",
        purchaseDate: initialData.purchaseDate || "",
        location: initialData.location || "",
        id: initialData.id,
      });
    } else {
      setForm(defaultFormState);
      setError("");
    }
  }, [initialData]);

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.category.trim()) {
      setError("Please provide at least a name and a category.");
      return;
    }

    setError("");
    onSave({ ...form });
  };

  return (
    <div className="card p-3 mb-3">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="mb-1">{initialData ? "Edit Asset" : "Add New Asset"}</h5>
          <small className="text-muted">
            {initialData
              ? "Update the fields below and save your changes."
              : "Add a new item to your inventory. "}
          </small>
        </div>
        {initialData && (
          <button className="btn btn-outline-secondary btn-sm" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Asset Name</label>
            <input
              className="form-control"
              value={form.name}
              onChange={handleChange("name")}
              placeholder="e.g. Laptop"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Category</label>
            <input
              className="form-control"
              value={form.category}
              onChange={handleChange("category")}
              placeholder="e.g. Electronics"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Brand</label>
            <input
              className="form-control"
              value={form.brand}
              onChange={handleChange("brand")}
              placeholder="e.g. Dell"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Model</label>
            <input
              className="form-control"
              value={form.model}
              onChange={handleChange("model")}
              placeholder="e.g. XPS 13"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Purchase Date</label>
            <input
              type="date"
              className="form-control"
              value={form.purchaseDate}
              onChange={handleChange("purchaseDate")}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Location</label>
            <input
              className="form-control"
              value={form.location}
              onChange={handleChange("location")}
              placeholder="e.g. Office A, Floor 2"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={handleChange("status")}
            >
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        <button className="btn btn-success" type="submit">
          {initialData ? "Save Changes" : "Save Asset"}
        </button>
      </form>
    </div>
  );
}
