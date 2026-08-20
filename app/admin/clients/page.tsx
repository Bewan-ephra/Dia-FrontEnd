"use client";
import { useState} from "react";
import {clients} from "@/lib/clients";
import Link from "next/link";

export default function ClientsPage() {
    const [search, setSearch] = useState("");
    const filteredClient = clients.filter((clients) =>
    clients.name.toLowerCase().includes(search.toLowerCase())
);
    return (
        <div>
           <h1 className="text-2xl font-bold mb-6">Clients</h1> 
            <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-4 py-2 mb-4 w-full max-w-sm"
            />
           <table className="w-full border-collapse">
            <thead>
                <tr className="bg-gray-100 text-left text-gray-700">
                  <th className="p-3">ID</th>
                  <th className="p-3">Nom</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Date d'inscription</th>  
                  <th className="p-3">Nombre de commandes</th>
                  <th className="p-3">Actions</th>
                </tr>
            </thead>
            <tbody>
               {filteredClient.map((client) => (
                <tr key={client.id} className="border-b">
                    <td className="p-3">{client.id}</td>
                    <td className="p-3">{client.name}</td>
                    <td className="p-3">{client.email}</td>
                    <td className="p-3">{client.registeredDate}</td>
                    <td className="p-3">{client.ordersCount}</td>
                    <td className="p-3">
                        <Link href={`/admin/clients/${client.id}`}className="text-blue-600 mr-3">Voir détails</Link>
                    </td>
                </tr>
               ))}
            </tbody>
           </table>
        </div>
    )
}