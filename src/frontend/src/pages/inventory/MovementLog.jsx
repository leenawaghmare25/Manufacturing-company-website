import { useEffect, useState } from 'react';
import API from '../../api/api';
import TopHeader from '../../components/TopHeader';
import DataTable from '../../components/common/DataTable';
import { RefreshCw, Archive, ClipboardList } from 'lucide-react';

export default function MovementLog() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const res = await API.get('/materials/movements');
      const payload = res.data.data || res.data || [];
      setMovements(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error('Failed to fetch stock movements:', err);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="container-custom py-8 px-6">
        <TopHeader
          title="Stock Movement Log"
          subtitle="Track every inventory change and goods receipt event"
        />

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Inventory Movement History</h2>
              <p className="text-sm text-slate-500 mt-1">
                Records all inventory adjustments, stock receipts, and manual quantity changes.
              </p>
            </div>
            <button
              onClick={fetchMovements}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              <RefreshCw size={18} />
              Refresh Log
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-2 text-slate-900 font-black tracking-tight">
            <Archive size={18} className="text-indigo-600" />
            <h2 className="text-lg">Latest Stock Movements</h2>
          </div>

          <DataTable
            headers={[
              { key: 'material_name', label: 'Material' },
              { key: 'change_type', label: 'Type' },
              { key: 'quantity_change', label: 'Change' },
              { key: 'resulting_quantity', label: 'Balance' },
              { key: 'note', label: 'Note' },
              { key: 'reference_type', label: 'Reference' },
              { key: 'created_at', label: 'Date' },
            ]}
            data={movements}
            loading={loading}
            renderRow={(item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-none">
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{item.material_name}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{item.change_type}</td>
                <td className="px-6 py-4 text-sm text-slate-900">{item.quantity_change > 0 ? `+${item.quantity_change}` : item.quantity_change}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.resulting_quantity}</td>
                <td className="px-6 py-4 text-sm text-slate-500 max-w-xl break-words">{item.note}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{item.reference_type || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            )}
          />

          {!loading && movements.length === 0 && (
            <div className="py-20 text-center text-sm text-slate-400">
              No stock movement history has been recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
