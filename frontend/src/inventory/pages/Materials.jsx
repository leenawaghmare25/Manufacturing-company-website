import { useEffect, useState } from "react";
import API from "../api/api";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function Materials() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "", type: "", quantity: "", supplier: ""
  });

  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    const res = await API.get("/materials");
    setData(res.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      await API.put(`/materials/${editId}`, form);
    } else {
      await API.post("/materials", form);
    }

    setForm({ name: "", type: "", quantity: "", supplier: "" });
    setEditId(null);
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    await API.delete(`/materials/${id}`);
    fetchData();
  };

  const handleEdit = (m) => {
    setForm(m);
    setEditId(m.id);
    setShowModal(true);
  };

  // 🔍 FILTER LOGIC
  const filtered = data
    .filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter(m => {
      if (statusFilter === "Low") return m.quantity < 20;
      if (statusFilter === "In") return m.quantity >= 20;
      return true;
    });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-gray-500">Track and manage all materials</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
        >
          + Add Material
        </button>
      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 flex justify-between">

        <input
          type="text"
          placeholder="Search materials..."
          className="border p-2 rounded w-1/3"
          onChange={(e)=>setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          onChange={(e)=>setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="In">In Stock</option>
          <option value="Low">Low Stock</option>
        </select>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Material</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-t hover:bg-gray-50">

                <td className="p-3">{m.name}</td>
                <td>{m.type}</td>
                <td>{m.quantity}</td>
                <td>{m.supplier}</td>

                <td>
                  <span className={`px-2 py-1 rounded text-sm ${
                    m.quantity < 20
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}>
                    {m.quantity < 20 ? "Low Stock" : "In Stock"}
                  </span>
                </td>

                <td className="flex gap-2 p-2">

                  <button
                    onClick={()=>handleEdit(m)}
                    className="bg-gray-200 p-2 rounded"
                  >
                    <FaEdit size={12} />
                  </button>

                  <button
                    onClick={()=>handleDelete(m.id)}
                    className="bg-red-500 text-white p-2 rounded"
                  >
                    <FaTrash size={12} />
                  </button>

                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* 🔥 MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">

          <div className="bg-white p-6 rounded-xl w-96">

            <h2 className="text-xl font-bold mb-4">
              {editId ? "Edit Material" : "Add Material"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

              <input
                className="border p-2 rounded"
                placeholder="Name"
                value={form.name}
                onChange={(e)=>setForm({...form,name:e.target.value})}
              />

              <input
                className="border p-2 rounded"
                placeholder="Type"
                value={form.type}
                onChange={(e)=>setForm({...form,type:e.target.value})}
              />

              <input
                type="number"
                className="border p-2 rounded"
                placeholder="Quantity"
                value={form.quantity}
                onChange={(e)=>setForm({...form,quantity:e.target.value})}
              />

              <input
                className="border p-2 rounded"
                placeholder="Supplier"
                value={form.supplier}
                onChange={(e)=>setForm({...form,supplier:e.target.value})}
              />

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={()=>setShowModal(false)}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

