"use client";
import {useState} from "react";
import {orders} from "@/lib/orders";
import Link from "next/link"
import { Eye, Search } from "lucide-react";

export default function CommandesPage() {
    const [search, setSearch] = useState("");
    const filteredOrders = orders.filter((orders) =>
    orders.name.toLowerCase().includes(search.toLowerCase())
);

    function getStatusColor(status: string) {
        if (status === "En attente") return "bg-yellow-100 text-yellow-700";
        if (status === "Livrée") return "bg-green-100 text-green-700";
        if(status === "Annulée") return "bg-red-100 text-red-700";
        return "bg-gray-100 text-gray-700";
    }
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
         <h1 className="text-2xl font-semibold text-gray-900 mb-6">Commandes</h1>

          <div className="relative mb-4 max-w-sm">
            <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
            />

            <input
            type="text"
            placeholder="Rechercher une commande..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg pl-9 pr-4 py-2  w-full text-sm"
            />
            </div>

           <table className="w-full border-collapse text-sm">
            <thead>
                <tr className="border-b bg-gray-200 text-left text-gray-500">
                    <th className="p-3 font-medium">Client</th>
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Total</th>
                    <th className="p-3 font-medium">Statut</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
               {filteredOrders.map((order) => (
               <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{order.name}</td>
                <td className="p-3 text-gray-500">{order.date}</td>
                <td className="p-3">{order.total}</td>
                <td className="p-3">
                    <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                        )}`}
                        >
                        {order.status}
                    </span>

                </td>
                <td className="p-3 text-right">
                    <Link 
                    href={`/admin/commandes/${order.id}`}
                     className="inline-flex text-gray-500 hover:text-blue-600 p-1.5"
                     >
                     <Eye size={16} />
                        </Link>
                </td>
               </tr> 
               ))} 
            </tbody>
           </table>
        </div>
        
    )
}