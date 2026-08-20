import { orders } from "@/lib/orders";

export default async function EditCommandesPage({
    params,
}: {
    params: Promise<{id : string}>;
}) {
    const { id } = await params;
    const order = orders.find((o) => o.id === Number(id));

    if(!order) {
        return <div>Commandes introuvable</div>
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Voir détails: {order.name}</h1>
            <p>Client : {order.name}</p>
            <p>Date : {order.date}</p>
            <p>Total : {order.total}</p>
            <p>Status : {order.status}</p>
        </div>
    );
}