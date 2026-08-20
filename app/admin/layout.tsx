import Sidebar from "@/components/Sidebar";

export default function AdminLayout({ children,
    }: { children: React.ReactNode;
     }) {  
        return (
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8 bg-white text-gray-900 min-h-screen">{children}</main>
            </div>
        );
}
 