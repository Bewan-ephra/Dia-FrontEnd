"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getCategoriesPublic, getCategoryImage } from "@/lib/api";
import Footer from "@/components/Footer";

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
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col items-center justify-end p-3 text-center">
    <p className="font-bold text-white text-2xl mb-3">Sur commande</p>
  </div>
</Link>

  <div className="md:col-span-3 relative h-64 md:h-80 rounded-xl overflow-hidden">
    {slides.map((slide, index) => (
      <Image
        key={slide}
        src={slide}
        alt="Bannière promotionnelle"
        fill
        className={`object-cover object-top transition-opacity duration-1000 ${
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

 <Link
  href="/produits"
  className="relative h-64 md:h-80 rounded-xl overflow-hidden group"
>
  <Image
    src="/banners/vignette-droite.png"
    alt="Image promotionnelle"
    fill
    className="object-cover group-hover:scale-105 transition"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col items-center justify-end p-3 text-center">
    <p className="font-bold text-white text-2xl mb-3">Sur commande</p>

  </div>
</Link>

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
  className="relative rounded-xl overflow-hidden h-40 group bg-gray-100"
>
  {getCategoryImage(category.name) ? (
    <>
      <Image
        src={getCategoryImage(category.name)!}
        alt={category.name}
        fill
        className="object-cover group-hover:scale-105 transition"
      />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <p className="font-medium text-white">{category.name}</p>
      </div>
    </>
  ) : (
    <div className="h-full flex items-center justify-center">
      <p className="font-medium text-gray-700">{category.name}</p>
    </div>
  )}
</Link>

    ))}
  </div>
</div>
        </div>
      </div>
      <Footer />
    </>
  );
}