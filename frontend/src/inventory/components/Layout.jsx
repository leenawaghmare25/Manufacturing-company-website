import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen">

      {/* 🔥 SIDEBAR */}
      <div className="w-64 bg-gray-900 text-white p-4">

        <h2 className="text-xl font-bold mb-6">Inventory System</h2>

        <nav className="flex flex-col gap-3">

          <Link to="/inventory" className="hover:bg-gray-700 p-2 rounded">
            Dashboard
          </Link>

          <Link to="/inventory/materials" className="hover:bg-gray-700 p-2 rounded">
            Materials
          </Link>

          <Link to="/inventory/requests" className="hover:bg-gray-700 p-2 rounded">
            Requests
          </Link>

          <Link to="/inventory/suppliers" className="hover:bg-gray-700 p-2 rounded">
            Suppliers
          </Link>

        </nav>

      </div>

      {/* 🔥 MAIN CONTENT */}
      <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
        {children}
      </div>

    </div>
  );
}
