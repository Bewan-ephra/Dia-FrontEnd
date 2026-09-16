"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getCategoriesPublic } from "@/lib/api";

const slides = ["/banners/banner1.png", "/banners/banner2.png", "/banners/banner3.png"];

export default function Home() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const [categories, setCategories] = useState<any[]>([]);

useEffect(() => {
  getCategoriesPublic().then((data) => setCategories(data));
}, []);

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
<Link
  href="/sur-commande"
  className="relative h-64 md:h-80 rounded-xl overflow-hidden group"
>
  <Image
    src="/banners/sur-commande.png"
    alt="Sur commande"
    fill
    className="object-cover group-hover:scale-105 transition"
  />
  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
    <p className="font-medium text-white text-2xl mb-1">Sur commande</p>
  </div>
</Link>

  <div className="md:col-span-3 relative h-64 md:h-80 rounded-xl overflow-hidden">
    {slides.map((slide, index) => (
      <Image
        key={slide}
        src={slide}
        alt="Bannière promotionnelle"
        fill
        className={`object-cover transition-opacity duration-1000 ${
          current === index ? "opacity-100" : "opacity-0"
        }`}
      />
    ))}

    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
      {slides.map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrent(index)}
          className={`w-2 h-2 rounded-full ${
            current === index ? "bg-white" : "bg-white/50"
          }`}
        />
      ))}
    </div>
  </div>

  <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
  <Image
    src="/banners/vignette-droite.png"
    alt="Image promotionnelle"
    fill
    className="object-cover"
  />
            </div>

          </div>
          <div className="mt-12">
  <h2 className="text-xl font-bold text-gray-900 mb-6">
    Catégories populaires
  </h2>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {categories.map((category) => (
      <Link
        key={category.id}
        href={`/produits?category_id=${category.id}`}
        className="bg-gray-50 rounded-xl p-6 text-center hover:bg-gray-100 transition"
      >
        <p className="font-medium text-gray-900">{category.name}</p>
      </Link>
    ))}
  </div>
</div>
        </div>
      </div>
    </>
  );
}