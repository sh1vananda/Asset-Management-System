import { useEffect, useMemo, useState } from "react";

const defaultFormState = {
  name: "",
  category: "",
  brand: "",
  model: "",
  serial_number: "",
  status: "Available",
  purchase_date: "",
  location: "",
};

export default function AssetForm({ initialData = null, onSave, onCancel }) {
  const initialFormState = useMemo(() => {
    if (!initialData) {
      return defaultFormState;
    }

    return {
      ...defaultFormState,
      ...initialData,
      serial_number: initialData.serial_number || "",
    };
  }, [initialData]);

  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    Promise.resolve().then(() => {
      setForm(initialFormState);
    });
  }, [initialFormState]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Asset name is required.";
    if (!form.category.trim()) nextErrors.category = "Category is required.";
    if (!form.brand.trim()) nextErrors.brand = "Brand is required.";
    if (!form.model.trim()) nextErrors.model = "Model is required.";

    if (!form.serial_number.trim()) {
      nextErrors.serial_number = "Serial number is required.";
    } else if (!/^[A-Za-z0-9\-_.]+$/.test(form.serial_number.trim())) {
      nextErrors.serial_number = "Use only letters, numbers, dash, underscore, or dot.";
    }

    if (!form.purchase_date) {
      nextErrors.purchase_date = "Purchase date is required.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted fields.");
      return;
    }

    setError("");

    onSave(form);
  };

  return (
    <div className="card p-3 mb-3">
      <h5>{initialData ? "Edit Asset" : "Add Asset"}</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row">

          <div className="col-md-6 mb-2">
            <input className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`} placeholder="Name"
              value={form.name} onChange={handleChange("name")} />
            {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
          </div>

          <div className="col-md-6 mb-2">
            <input className={`form-control ${fieldErrors.category ? "is-invalid" : ""}`} placeholder="Category"
              value={form.category} onChange={handleChange("category")} />
            {fieldErrors.category && <div className="invalid-feedback">{fieldErrors.category}</div>}
          </div>

          <div className="col-md-6 mb-2">
            <input className={`form-control ${fieldErrors.brand ? "is-invalid" : ""}`} placeholder="Brand"
              value={form.brand} onChange={handleChange("brand")} />
            {fieldErrors.brand && <div className="invalid-feedback">{fieldErrors.brand}</div>}
          </div>

          <div className="col-md-6 mb-2">
            <input className={`form-control ${fieldErrors.model ? "is-invalid" : ""}`} placeholder="Model"
              value={form.model} onChange={handleChange("model")} />
            {fieldErrors.model && <div className="invalid-feedback">{fieldErrors.model}</div>}
          </div>

          <div className="col-md-6 mb-2">
            <input className={`form-control ${fieldErrors.serial_number ? "is-invalid" : ""}`} placeholder="Serial Number"
              value={form.serial_number} onChange={handleChange("serial_number")} />
            {fieldErrors.serial_number && <div className="invalid-feedback">{fieldErrors.serial_number}</div>}
          </div>

          <div className="col-md-6 mb-2">
            <input type="date" className={`form-control ${fieldErrors.purchase_date ? "is-invalid" : ""}`}
              value={form.purchase_date}
              onChange={handleChange("purchase_date")} />
            {fieldErrors.purchase_date && <div className="invalid-feedback">{fieldErrors.purchase_date}</div>}
          </div>

          <div className="col-md-6 mb-2">
            <select className="form-select"
              value={form.status}
              onChange={handleChange("status")}>
              <option>Available</option>
              <option>Assigned</option>
              <option>Under Maintenance</option>
              <option>Retired</option>
            </select>
          </div>

        </div>

        <div className="d-flex gap-2 mt-2">
          <button className="btn btn-success">Save</button>
          {initialData && (
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}