"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        function handleScroll() {
            setVisible(window.scrollY > 300 );
        }
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: "smooth"});
    }

    if (!visible) return null;

    return (
        <button 
        onClick={scrollToTop}
        className="fixed bottom-30 right-6 bg-white border border-black text-gray-900 rounded-lg p-3 shadow-lg hover:bg-gray-100 z-40"
        >
            <ArrowUp size={20} />
        </button>
    );
}