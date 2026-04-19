import { useEffect, useState } from 'react';
import API from '../../api/api';
import TopHeader from '../../components/TopHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement } from 'chart.js';
import { RefreshCw, AlertTriangle, ClipboardList, Package, Layers } from 'lucide-react';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

export default function Analytics() {
  const [summary, setSummary] = useState({
    totalMaterials: 0,
    lowStockCount: 0,
    lowStockMaterials: [],
    totalRequests: 0,
    pendingRequests: 0,
    autoReorderCount: 0,
    pendingOrders: 0,
    orderedOrders: 0,
    deliveredOrders: 0,
    orderStatusCounts: {},
    stockLevels: [],
  });
  const [loading, setLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reports/inventory-summary');
      setSummary(res.data.summary || summary);
    } catch (err) {
      console.error('Failed to load analytics summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReorderScan = async () => {
    try {
      setScanLoading(true);
      const res = await API.post('/materials/reorder-scan');
      alert(`${res.data.count || 0} auto reorder request(s) created.`);
      fetchSummary();
    } catch (err) {
      console.error('Failed to run reorder scan:', err);
      alert('Unable to run reorder automation.');
    } finally {
      setScanLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const { stockLevels, orderStatusCounts, lowStockMaterials } = summary;
  const stockChart = {
    labels: stockLevels.map((item) => item.name),
    datasets: [
      {
        label: 'Stock Quantity',
        data: stockLevels.map((item) => item.quantity),
        backgroundColor: 'rgba(79, 70, 229, 0.75)',
        borderRadius: 10,
      },
    ],
  };

  const orderChart = {
    labels: Object.keys(orderStatusCounts),
    datasets: [
      {
        data: Object.values(orderStatusCounts),
        backgroundColor: ['#6366f1', '#10b981', '#f97316', '#ef4444', '#64748b'],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="container-custom py-8 px-6">
        <TopHeader
          title="Inventory Analytics"
          subtitle="View stock trends, low stock alerts, and automated reorder performance"
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Reports & Alerts</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              Scan low-stock materials, review procurement health, and monitor auto-reorder activity.
            </p>
          </div>
          <button
            onClick={handleReorderScan}
            disabled={scanLoading}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={18} />
            {scanLoading ? 'Running Scan...' : 'Run Auto-Reorder Scan'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Materials" value={summary.totalMaterials} description="Items tracked" icon={Package} iconColor="#6366f1" />
          <StatCard title="Low Stock Items" value={summary.lowStockCount} description="Need replenishment" icon={AlertTriangle} iconColor="#ef4444" />
          <StatCard title="Auto Reorders" value={summary.autoReorderCount} description="Generated automatically" icon={ClipboardList} iconColor="#10b981" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-2 mb-6 text-slate-900 font-black tracking-tight">
              <Layers size={18} className="text-indigo-600" />
              <h3 className="text-lg">Stock Level Trend</h3>
            </div>
            <div className="h-[320px]">
              <Bar
                data={stockChart}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                  }
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-2 mb-6 text-slate-900 font-black tracking-tight">
              <Layers size={18} className="text-indigo-600" />
              <h3 className="text-lg">Order Status Distribution</h3>
            </div>
            <div className="h-[320px] flex items-center justify-center">
              <Doughnut
                data={orderChart}
                options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center gap-2 text-slate-900 font-black tracking-tight">
              <AlertTriangle size={18} className="text-rose-500" />
              <h3 className="text-lg">Low Stock Materials</h3>
            </div>
            <div className="overflow-x-auto">
              <DataTable
                headers={[
                  { key: 'name', label: 'Material' },
                  { key: 'quantity', label: 'Qty' },
                  { key: 'min_stock', label: 'Min Stock' },
                  { key: 'reorder_amount', label: 'Reorder Qty', align: 'right' },
                ]}
                data={lowStockMaterials}
                renderRow={(item) => (
                  <tr key={item.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm font-black text-rose-600">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{item.min_stock ?? 20}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{item.reorder_amount}</td>
                  </tr>
                )}
              />
            </div>
            {lowStockMaterials.length === 0 && (
              <div className="p-10 text-center text-sm text-slate-500">All tracked materials are above minimum stock levels.</div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-2 mb-6 text-slate-900 font-black tracking-tight">
              <ClipboardList size={18} className="text-indigo-600" />
              <h3 className="text-lg">Procurement Summary</h3>
            </div>
            <div className="grid gap-4">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Total Requests</div>
                <div className="mt-2 text-3xl font-black text-slate-900">{summary.totalRequests}</div>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Pending Requests</div>
                <div className="mt-2 text-3xl font-black text-slate-900">{summary.pendingRequests}</div>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Pending Orders</div>
                <div className="mt-2 text-3xl font-black text-slate-900">{summary.pendingOrders}</div>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Delivered Orders</div>
                <div className="mt-2 text-3xl font-black text-slate-900">{summary.deliveredOrders}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
