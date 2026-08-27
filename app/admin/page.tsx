import { products } from "@/lib/products";
import { orders } from "@/lib/orders";
import { clients } from "@/lib/clients";
import { Package, Clock, DollarSign, Users, XCircle } from "lucide-react";

export default function AdminDashboard() {
    const totalProducts = products.length;
    const pendingOrders = orders.filter((o) => o.status === "En attente").length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalClients = clients.length;
    const cancelledOrders = orders.filter((o) => o.status === "Annulée").length;

      return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <Package size={18} />
            </div>
            <span className="text-sm text-gray-500">Produits</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
              <Clock size={18} />
            </div>
            <span className="text-sm text-gray-500">Commandes en attente</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 text-green-600 p-2 rounded-lg">
              <DollarSign size={18} />
            </div>
            <span className="text-sm text-gray-500">Chiffre d'affaires</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {totalRevenue.toLocaleString()} FCFA
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
              <Users size={18} />
            </div>
            <span className="text-sm text-gray-500">Clients</span> 
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
        </div>
         <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
  <div className="flex items-center gap-3 mb-2">
    <div className="bg-red-100 text-red-600 p-2 rounded-lg">
      <XCircle size={18} />
    </div>
    <span className="text-sm text-gray-500">Commandes annulées</span>
  </div>
  <p className="text-2xl font-bold text-gray-900">{cancelledOrders}</p>
</div>
      </div>
    </div>
  );
}
