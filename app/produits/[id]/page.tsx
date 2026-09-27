"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { getProduct, addToCart, getCategoryImage } from "@/lib/api";
import { CheckCircle, Minus, Plus, Truck, CreditCard, MessageCircle, X, MapPin, Phone, Map } from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      getProduct(id).then((data) => {
        setProduct(data);
        if (data.sizes?.length) {
          setSelectedSize(data.sizes[0]);
        }
      });
    });
  }, [params]);

  useEffect(() => {
    function handleScroll() {
      setShowFloatingBar(window.scrollY > 400);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!product) {
    return <div>Chargement...</div>;
  }


  async function handleAddToCart() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Connecte-toi pour ajouter un produit au panier.");
      return;
    }
    await addToCart(token, product.id, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  const image = getCategoryImage(product.category?.name);

 
  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="relative h-[500px] rounded-xl overflow-hidden bg-gray-100">
            {image ? (
              <Image
                src={image}
                alt={product.name}
                fill className="object-cover" />
            ) : null}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-orange-400 mb-2">
              {product.name}
            </h1>
            <p className="text-2xl text-black font-semibold mb-4">
              {product.price} FCFA
            </p>

            <div className="flex items-center gap-2 text-green-600 text-sm mb-6">
              <CheckCircle size={16} />
              {product.stock > 0 ? "En stock" : "Rupture de stock"}
            </div>

            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <p className="font-medium text-gray-900 mb-2">Taille</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border text-sm ${
                        selectedSize === size
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="font-medium text-gray-900 mb-2">Quantité</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="hover:text-orange-400 w-9 h-9 rounded-lg border border-black flex items-center justify-center"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="hover:text-orange-400 w-9 h-9 rounded-lg border border-black flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {addedToCart && (
              <p className="text-green-600 font-medium mb-3">
                Produit ajouté au panier !
              </p>
            )}

            <button
              onClick={handleAddToCart}
              className="w-full bg-orange-400 text-white rounded-lg px-6 py-3 font-medium mb-6"
            >
              AJOUTER AU PANIER
            </button>

              <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="border border-gray-200 rounded-xl divide-y divide-gray-200 mb-6">
              <div className="flex items-start gap-3 p-4">
                <div className="bg-orange-50 text-orange-500 p-2 rounded-full">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm mb-2">
                    Livraison partout à Libreville
                  </p>
                  <p className="text-gray-500 text-xs">
                    2 000 FCFA, offerte dès 50 000 FCFA d'achat
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4">
                <div className="bg-orange-50 text-orange-500 p-2 rounded-full">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm mb-1">
                    Payez comme vous voulez
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-xs text-black px-2 py-1 rounded-full">
                      Airtel Money
                    </span>
                    <span className="bg-gray-100 text-xs text-black px-2 py-1 rounded-full">
                      Moov Money
                    </span>
                    <span className="bg-gray-100 text-xs text-black px-2 py-1 rounded-full">
                      À la livraison
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4">
                <div className="bg-orange-50 text-orange-500 p-2 rounded-full">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    Une question avant de commander ?
                  </p>
                  <a href="#" className="text-blue-600 text-xs hover:underline">
                    Un expert vous répond sur WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <CheckCircle size={18} className="text-green-600 mt-0.5" />
              <div>
                <p className="text-gray-900 text-sm">
                  Retrait disponible à <span className="font-semibold">NZENG-AYONG, GP</span>
                </p>
                <p className="text-gray-500 text-xs mb-2">
                  Habituellement prête en 1 heure
                </p>
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="text-blue-600 text-xs hover:underline"
                >
                  Voir les informations du magasin
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="font-medium text-gray-900 mb-3">Avis Clients</h2>
              <div className="text-center py-6 border border-gray-200 rounded-xl">
                <p className="text-gray-700 text-sm mb-3">
                  Soyez le premier à écrire un avis
                </p>
                <button className="bg-amber-500 text-white text-sm font-medium px-5 py-2 rounded-lg">
                  Écrire un avis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFloatingBar && (
        <div className="fixed bottom-8 left-4 right-4 md:left-8 md:right-8 bg-white border border-gray-200 rounded-xl shadow-xl z-40">
          <div className="max-w-6xl mx-auto px-3 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {image ? (
                  <Image src={image} alt={product.name} fill className="object-cover" />
                ) : null}
              </div>
              <div>
                <p className="font-medium text-black text-sm">{product.name}</p>
                <p className="text-orange-400 font-semibold text-sm">
                  {product.price} FCFA
                </p>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-orange-400 text-white rounded-lg px-6 py-2 font-medium text-sm flex-shrink-0"
            >
              Ajouter au panier
            </button>
          </div>
        </div>
      )}

      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white  max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-7 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-gray-500 text-sm">{selectedSize}</p>
                <p className="text-gray-900 text-sm">{product.price} FCFA</p>
              </div>
              <button onClick={() => setShowLocationModal(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <p className="font-bold text-gray-900 mb-4">
                NZENG-AYONG GP ( à la descende d'ONDO)
              </p>

              <div className="flex items-center gap-2 text-green-600 text-sm mb-4">
                <CheckCircle size={16} />
                Retrait disponible, Habituellement prête en 1 heure
              </div>

              <div className="flex items-start gap-2 mb-4">
                <MapPin size={16} className="text-gray-700 mt-1" />
                <div className="text-sm text-gray-900">
                  <p>DIA, NZENG-AYONG, GP</p>
                  <p>à la descente d'ONDO</p>
                  <p>Libreville</p>
                  <p>Gabon</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 text-sm text-gray-900">
                <Phone size={16} className="text-gray-700" />
                +241 60.34.82.25
              </div>

              
                <a href="CFHC+HHJ, Libreville, Gabon"
                className="flex items-center gap-2 text-orange-600 text-sm hover:underline"
              >
                <Map size={16} />
                Vérifiez ceci sur Google Maps
              </a>
            </div>
          </div>
        </div>
      )}
        <ScrollToTop />
      <Footer />
    </>
  );
}