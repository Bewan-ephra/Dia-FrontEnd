"use client";
import { useState} from "react";
import {clients} from "@/lib/clients";
import Link from "next/link";
import { Eye, Search } from "lucide-react";

export default function ClientsPage() {
    const [search, setSearch] = useState("");
    const filteredClient = clients.filter((clients) =>
    clients.name.toLowerCase().includes(search.toLowerCase())
);
    return (
       <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900 mb-6">Clients</h1>
            
           <div className="relative mb-4 max-w-sm">
            <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
                type="text"
                placeholder="Rechercher un client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg pl-9 pr-4 py-2 w-full text-sm"
            />
            </div>

          <table className="w-full border-collapse text-sm">
         <thead>
            <tr className="border-b bg-gray-200 text-left text-gray-500">
            <th className="p-3 font-medium">Nom</th>
            <th className="p-3 font-medium">Email</th>
            <th className="p-3 font-medium">Date d'inscription</th>
            <th className="p-3 font-medium">Nombres commandes</th>
            <th className="p-3 font-medium text-right">Actions</th>
         </tr>
        </thead>
        <tbody>
    {filteredClient.map((client) => (
      <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
        <td className="p-3 font-medium text-gray-900">{client.name}</td>
        <td className="p-3 text-gray-500">{client.email}</td>
        <td className="p-3 text-gray-500">{client.registeredDate}</td>
        <td className="p-3">{client.ordersCount}</td>
        <td className="p-3 text-right">
          <Link
            href={`/admin/clients/${client.id}`}
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