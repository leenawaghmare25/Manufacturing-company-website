import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import TopHeader from "../../components/TopHeader";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import { Plus, Search, Filter, ArrowLeft, CheckCircle, ShoppingCart, XCircle, Trash2 } from "lucide-react";

export default function Orders() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/inv-orders");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch inventory orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, inventory_status) => {
    try {
      await API.put(`/inv-orders/${id}`, { inventory_status });
      setData((prev) => prev.map((order) => order.id === id ? { ...order, inventory_status } : order));
      fetchData();
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await API.delete(`/inv-orders/${id}`);
      fetchData();
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = data
    .filter(o => 
      o.order_id?.toLowerCase().includes(search.toLowerCase()) ||
      o.product?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.toLowerCase().includes(search.toLowerCase())
    )
    .filter(o => statusFilter === "All" ? true : o.inventory_status === statusFilter);

  const headers = [
    { key: "order_id", label: "Order ID" },
    { key: "product", label: "Material" },
    { key: "customer", label: "Supplier" },
    { key: "quantity", label: "Quantity" },
    { key: "delivery_date", label: "Delivery Date" },
    { key: "eta_date", label: "ETA" },
    { key: "received_date", label: "Received" },
    { key: "inventory_status", label: "Status" },
    { key: "actions", label: "Actions", align: "right" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="container-custom py-8">
        
        {/* TOP BAR */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate("/inventory/suppliers")}
            className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <TopHeader 
            title="Inventory Orders" 
            subtitle="Manage procurement orders for raw materials and factory supplies"
          />
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Purchase Orders</h2>
              <button
                onClick={() => navigate("/inventory/orders/new")}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={18} strokeWidth={3} />
                <span>Place New Order</span>
              </button>
            </div>

            {/* SEARCH & FILTER */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ID, Material, or Supplier..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="bg-slate-50 border-none rounded-2xl text-sm py-3 px-4 font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Ordered">Ordered</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <DataTable 
            headers={headers}
            data={filtered}
            loading={loading}
            renderRow={(o) => (
              <tr key={o.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-none">
                <td className="px-6 py-5">
                  <span className="text-sm font-black text-slate-900 uppercase tracking-wider">{o.order_id}</span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-bold text-slate-700">{o.product}</span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-medium text-slate-500">{o.customer}</span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-black text-slate-900">{o.quantity}</span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-medium text-slate-500">
                    {o.delivery_date ? new Date(o.delivery_date).toLocaleDateString() : "N/A"}
                  </span>
                </td>
                <td className="px-6 py-5">
                  {o.eta_date ? <span className="text-sm font-medium text-slate-500">{new Date(o.eta_date).toLocaleDateString()}</span> : <span className="text-sm text-slate-400">N/A</span>}
                </td>
                <td className="px-6 py-5">
                  {o.received_date ? <span className="text-sm font-medium text-slate-500">{new Date(o.received_date).toLocaleDateString()}</span> : <span className="text-sm text-slate-400">—</span>}
                </td>
                <td className="px-6 py-5">
                  <StatusBadge status={o.inventory_status} />
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    {o.inventory_status !== "Delivered" && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, "Delivered")}
                        aria-label="Mark Delivered"
                        className="p-2 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {o.inventory_status === "Pending" && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, "Ordered")}
                        aria-label="Mark Ordered"
                        className="p-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateStatus(o.id, "Cancelled")}
                      aria-label="Cancel Order"
                      className="p-2 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all"
                    >
                      <XCircle size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(o.id)}
                      aria-label="Delete Order"
                      className="p-2 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          />

          {!loading && filtered.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-bold text-slate-400">No Orders Found</h3>
              <p className="text-sm text-slate-500">Try adjusting your search terms or create a new order.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
