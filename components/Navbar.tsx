"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, User, Menu } from "lucide-react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-md relative">
            <Link href="/" className="text-xl font-bold text-gray-800">
                DIA            
            </Link>

            <button
                className="md:hidden text-2xl"
                onClick={() => setIsOpen(!isOpen)}
                >
                    <Menu size={24} />
            </button>

            <ul
             className={`${
                    isOpen ? "flex" : "hidden"
                    } md:flex flex-col md:flex-row gap-8 text-gray-600 absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent px-8 md:px-0 py-4 md:py-0 items-center`}
            >
                <li>
                    <Link href="/">Acceuil</Link>
                </li>
                <li>
                    <Link href="/produits">Catalogue</Link>
                </li>
                <li>
                    <Link href="/categories">Categories</Link>
                </li>
                </ul>

                <div className="hidden md:flex items-center gap-4">
                    <Link href="/panier" className="text-gray-600 hover:text-blue-600">
                        <ShoppingCart size={20} />
                    </Link>
                    <Link href="/profil" className="text-gray-600 hover:text-blue-600">
                        <User size={20} />
                    </Link>
                </div>
        </nav>
    )
}