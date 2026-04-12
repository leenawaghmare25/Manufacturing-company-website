import { useEffect, useState } from "react";
import API from "../api/api";

export default function RequestForm({ fetchData }) {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [form, setForm] = useState({
    job_id: "",
    material: "",
    quantity: "",
    requested_by: ""
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const res = await API.get("/materials");
    setMaterials(res.data);
  };

  // 🔥 HANDLE MATERIAL SELECT
  const handleMaterialChange = (e) => {
    const selected = materials.find(m => m.name === e.target.value);
    setSelectedMaterial(selected);

    setForm({
      ...form,
      material: e.target.value
    });
  };

  // 🔥 SUBMIT WITH VALIDATION
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMaterial) {
      return alert("Select material");
    }

    if (form.quantity > selectedMaterial.quantity) {
      return alert("❌ Not enough stock available");
    }

    await API.post("/requests", form);

    alert("✅ Request Created");

    setForm({
      job_id: "",
      material: "",
      quantity: "",
      requested_by: ""
    });

    setSelectedMaterial(null);
    fetchData();
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-6">

      <h2 className="font-bold mb-3">Create Request</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-3">

        <input
          placeholder="Job ID"
          value={form.job_id}
          onChange={(e)=>setForm({...form, job_id:e.target.value})}
          className="border p-2 rounded"
          required
        />

        {/* 🔥 DROPDOWN */}
        <div>
          <select
            value={form.material}
            onChange={handleMaterialChange}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">Select Material</option>
            {materials.map(m => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>

          {/* 🔥 SHOW AVAILABLE STOCK */}
          {selectedMaterial && (
            <p className="text-sm text-gray-500 mt-1">
              Available: {selectedMaterial.quantity}
            </p>
          )}
        </div>

        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e)=>setForm({...form, quantity:e.target.value})}
          className="border p-2 rounded"
          required
        />

        <input
          placeholder="Requested By"
          value={form.requested_by}
          onChange={(e)=>setForm({...form, requested_by:e.target.value})}
          className="border p-2 rounded"
          required
        />

        <button className="col-span-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Submit Request
        </button>

      </form>

    </div>
  );
}