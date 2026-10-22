"use client";
import { useState, useEffect } from "react";
import { getUsers, UserWithRoles } from "@/lib/api/users";

export default function ClientsPage() {
  const [clients, setClients] = useState<UserWithRoles[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getUsers("client");
        setClients(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des clients");
      } finally {
        setIsLoading(false);
      }
    }
    fetchClients();
  }, []);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
      </div>

      <input
        type="text"
        placeholder="Rechercher un client (nom ou email)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded px-4 py-2 mb-4 w-full max-w-sm"
      />

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">Chargement des clients...</p>
      ) : filteredClients.length === 0 ? (
        <p className="text-gray-500">Aucun client trouvé.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="p-3">ID</th>
              <th className="p-3">Nom</th>
              <th className="p-3">Email</th>
              <th className="p-3">Téléphone</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id} className="border-b">
                <td className="p-3">{client.id}</td>
                <td className="p-3">{client.name}</td>
                <td className="p-3">{client.email}</td>
                <td className="p-3">{client.phone ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}