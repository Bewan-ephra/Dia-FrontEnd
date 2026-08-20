import { clients } from "@/lib/clients";


export default async function EditClientPage({
    params,
} : {
    params : Promise<{id: string}>
}) {
    const { id }= await params;
    const client = clients.find((cl) => cl.id === Number(id));

    if(!client) {
        return <div>Client introuvable</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">voir détails : {client.name}</h1>
                <p>Clients : {client.name}</p>
                <p>email : {client.email}</p>
                <p>Date d'enregistement : {client.registeredDate}</p>
                <p>Nombre de commande : {client.ordersCount}</p>
        </div>
    );
}