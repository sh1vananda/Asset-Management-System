import { useEffect, useState } from "react";

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
  const [form, setForm] = useState(defaultFormState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        serial_number: initialData.serial_number || "",
      });
    } else {
      setForm(defaultFormState);
    }
  }, [initialData]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.category || !form.serial_number) {
      setError("Name, Category & Serial Number required");
      return;
    }

    onSave(form);
  };

  return (
    <div className="card p-3 mb-3">
      <h5>{initialData ? "Edit Asset" : "Add Asset"}</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row">

          <div className="col-md-6 mb-2">
            <input className="form-control" placeholder="Name"
              value={form.name} onChange={handleChange("name")} />
          </div>

          <div className="col-md-6 mb-2">
            <input className="form-control" placeholder="Category"
              value={form.category} onChange={handleChange("category")} />
          </div>

          <div className="col-md-6 mb-2">
            <input className="form-control" placeholder="Brand"
              value={form.brand} onChange={handleChange("brand")} />
          </div>

          <div className="col-md-6 mb-2">
            <input className="form-control" placeholder="Model"
              value={form.model} onChange={handleChange("model")} />
          </div>

          <div className="col-md-6 mb-2">
            <input className="form-control" placeholder="Serial Number"
              value={form.serial_number} onChange={handleChange("serial_number")} />
          </div>

          <div className="col-md-6 mb-2">
            <input type="date" className="form-control"
              value={form.purchase_date}
              onChange={handleChange("purchase_date")} />
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

        <button className="btn btn-success mt-2">Save</button>
      </form>
    </div>
  );
}