"use client";
import {useState} from "react";
import {orders} from "@/lib/orders";
import Link from "next/link";

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
        <div>
         <h1 className="text-2xl font-bold mb-6">Commandes</h1>
            <input
            type="text"
            placeholder="Rechercher une commande..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-4 py-2 mb-4 w-full max-w-sm"
            />
           <table className="w-full border-collapse">
            <thead>
                <tr className="bg-gray-100 text-left text-gray-700">
                    <th className="p-3">ID</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3">Actions</th>
                </tr>
            </thead>
            <tbody>
               {filteredOrders.map((order) => (
               <tr key={order.id} className="border-b">
                <td className="p-3">{order.id}</td>
                <td className="p-3">{order.name}</td>
                <td className="p-3">{order.date}</td>
                <td className="p-3">{order.total}</td>
                <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                    </span>
                </td>
                <td className="p-3">
                    <Link href={`/admin/commandes/${order.id}`} className="text-blue-600 mr-3">Voir détails</Link>
                </td>
               </tr> 
               ))} 
            </tbody>
           </table>
        </div>
    )
}