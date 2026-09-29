"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { getProduct, addToCart, getCategoryImage, getProducts, trackRecentlyViewed, getRecentlyViewed } from "@/lib/api";
import { CheckCircle, Minus, Plus, Truck, CreditCard, MessageCircle, X, MapPin, Phone, Map, Droplet, Shirt, Zap, Heart, Check, ShoppingCart } from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";
import Link from "next/link";


export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    params.then(({ id }) => {
      getProduct(id).then((data) => {
        setProduct(data);
        if (data.sizes?.length) {
          setSelectedSize(data.sizes[0]);
        }
          trackRecentlyViewed(data);
          getProducts().then((all) => {
            setSimilarProducts(
              all.filter(
               (p: any) =>
              p.category?.id === data.category?.id && p.id !== data.id
          )
        );
      });
    });
     setRecentlyViewed(getRecentlyViewed());
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
    setShowCartModal(true);
  }

  const image = getCategoryImage(product.category?.name);

 
  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
         <div>
  <div className="relative h-[500px] rounded-xl overflow-hidden bg-gray-100 mb-3">
    {image ? (
      <Image src={image} alt={product.name} fill className="object-cover" />
    ) : null}
  </div>

  <div className="flex gap-3">
    {[0, 1].map((index) => (
      <button
        key={index}
        onClick={() => setSelectedImage(index)}
        className={`relative w-30 h-40 rounded-lg overflow-hidden border-2 ${
          selectedImage === index ? "border-gray-900" : "border-gray-200"
        }`}
      >
        {image ? (
          <Image src={image} alt={product.name} fill className="object-cover" />
        ) : null}
      </button>
    ))}
  </div>
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


            <button
              onClick={handleAddToCart}
              className="w-full bg-orange-400 text-white rounded-lg px-6 py-3 font-medium mb-6"
            >
              AJOUTER AU PANIER
            </button>

            <div className="border border-gray-200 rounded-xl divide-y divide-gray-200 mb-5">
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

           {product.specs && (
  <div className="max-w-6xl mx-auto px-8 pb-12">
    
    <div className="mb-4">
  <h2 className="text-lg font-bold text-gray-900">DESCRIPTION</h2>
  <div className="w-10 h-0.5 bg-gray-900 mt-1"></div>
  </div>

    <div className="bg-gradient-to-br from-black via-black to-black rounded-2xl p-8 text-white relative overflow-hidden">
    <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500 rounded-full opacity-30 blur-3xl"></div>
      <p className="text-orange-400 text-xs font-semibold uppercase mb-2">
        {product.category?.name} · Description
      </p>
      <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
      <p className="text-gray-300 mb-6 max-w-2xl">{product.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {product.specs.map((spec: any, index: number) => (
          <div key={index} className="bg-gray-800 rounded-xl p-4">
            <p className="text-2xl font-bold">{spec.value}</p>
            <p className="text-gray-400 text-sm">{spec.label}</p>
          </div>
        ))}
      </div>

      {product.features && (
        <div className="flex flex-wrap gap-2 mb-6">
          {product.features.map((feature: string, index: number) => (
            <span
              key={index}
              className="bg-gray-800 text-sm px-4 py-2 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
        <span className="bg-orange-500 font-bold px-4 py-2 rounded-full">
          {product.price} FCFA
        </span>
        <p className="text-gray-400 text-sm">
          Livraison 2 000 FCFA partout au Sénégal
        </p>
      </div>
    </div>
  </div>
)}


  {product.summary && (
  <div className="max-w-6xl mx-auto px-8 pb-12">
    <div className="border-l-4 border-orange-400 bg-white rounded-r-xl p-6 mb-8">
      <p className="text-orange-500 text-xs font-semibold uppercase mb-1">
        En bref
      </p>
      <p className="text-gray-700 text-sm">{product.summary}</p>
    </div>

    {product.benefits && (
      <div className="mb-8">
        <h2 className="font-black text-gray-900 mb-4">
          POURQUOI VOUS ALLEZ L'ADOPTER
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.benefits.map((benefit: any, index: number) => {
            const icons: { [key: string]: any } = {
              droplet: Droplet,
              shirt: Shirt,
              zap: Zap,
              heart: Heart,
            };
            const Icon = icons[benefit.icon] || Heart;
            return (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4"
              >
                <div className="bg-orange-50 text-orange-500 w-9 h-9 rounded-lg flex items-center justify-center mb-3">
                  <Icon size={22} />
                </div>
                <p className="font-bold text-black mb-1">
                  {benefit.title}
                </p>
                <p className="text-gray-500 text-sm">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {product.idealFor && (
      <div className="mb-8">
        <h2 className="font-black text-black mb-4">IDÉAL POUR</h2>
        <div className="flex flex-wrap gap-2">
          {product.idealFor.map((item: string, index: number) => (
            <span
              key={index}
              className="flex items-center gap-1 bg-orange-50 text-orange-700 text-sm px-3 py-1.5 rounded-full"
            >
              <Check size={14} />
              {item}
            </span>
          ))}
        </div>
      </div>
    )}

    {(product.sizes || product.colors) && (
      <div className="mb-8">
        <h2 className="font-black text-black mb-4">TAILLES ET COLORIS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {product.sizes && (
            <div className="bg-gray-100 rounded-xl p-5">
              <p className="font-black text-gray-500 text-xs uppercase mb-2">Tailles</p>
              <div className="flex flex-wrap gap-2 text-black">
                {product.sizes.map((size: string) => (
                  <span
                    key={size}
                    className="bg-white border border-gray-300 text-sm px-3 py-1 rounded-full"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}
          {product.colors && (
            <div className="bg-gray-100 rounded-xl p-5">
              <p className="font-black text-gray-500 text-xs uppercase mb-2">Coloris</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color: string) => (
                  <span
                    key={color}
                    className="bg-white border border-gray-300 text-sm text-black px-3 py-1 rounded-full"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="bg-gray-900 text-white text-sm rounded-xl p-4">
          Prenez votre taille habituelle pour un ajustement classique, ou la taille au-dessus pour plus d'ampleur.
        </div>
      </div>
    )}

    {product.care && (
      <div>
        <h2 className="font-black text-gray-900 mb-4">MATIÈRE ET ENTRETIEN</h2>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {product.care.map((item: any, index: number) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row md:items-center gap-1 md:gap-4 p-4 text-sm ${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              }`}
            >
              <p className="font-bold text-gray-900 md:w-40">{item.label}</p>
              <p className="text-gray-600">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}

  {similarProducts.length > 0 && (
  <div className="mt-12">
    <h2 className="text-center font-bold text-black text-lg mb-1">
      PRODUITS SIMILAIRES
    </h2>
    <div className="w-10 h-0.5 bg-orange-400 mx-auto mb-6"></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {similarProducts.map((p) => {
        const img = getCategoryImage(p.category?.name);
        return (
          <Link
            key={p.id}
            href={`/produits/${p.id}`}
            className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition"
          >
            <div className="relative h-32 rounded-lg overflow-hidden mb-2 bg-gray-100">
              {img ? (
                <Image src={img} alt={p.name} fill className="object-cover" />
              ) : null}
            </div>
            <p className="font-medium text-gray-900 text-sm">{p.name}</p>
            <p className="font-bold text-black text-base">{p.price} FCFA</p>
          </Link>
        );
      })}
    </div>
  </div>
)}

{recentlyViewed.length > 0 && (
  <div className="mt-12">
    <h2 className="text-center font-bold text-black text-lg mb-1">
      PRODUITS RÉCEMMENT CONSULTÉS
    </h2>
    <div className="w-10 h-0.5 bg-orange-400 mx-auto mb-6"></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {recentlyViewed.map((p) => {
        const img = getCategoryImage(p.category?.name);
        return (
          <Link
            key={p.id}
            href={`/produits/${p.id}`}
            className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition"
          >
            <div className="relative h-32 rounded-lg overflow-hidden mb-2 bg-gray-100">
              {img ? (
                <Image src={img} alt={p.name} fill className="object-cover" />
              ) : null}
            </div>
            <p className="font-medium text-gray-900 text-sm">{p.name}</p>
            <p className="font-bold text-black text-base">{p.price} FCFA</p>
          </Link>
        );
      })}
    </div>
  </div>
)}

      </div>

      {showFloatingBar && (
        <div className="fixed bottom-8 left-4 right-4 md:left-8 md:right-8 bg-white border border-gray-200 rounded-xl shadow-xl z-40">
          <div className="max-w-6xl mx-auto px-3 py-5 flex items-center justify-between gap-4">
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
            <div className="flex items-center gap-3 flex-shrink-0">

  <div className="flex items-center gap-3 text-black">
    <button
      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
      className="hover hover:text-orange-400 w-8 h-8 rounded-lg border border-black text-black flex items-center justify-center"
    >
      <Minus size={14} />
    </button>
    <span className="w-6 text-center text-sm">{quantity}</span>
    <button
      onClick={() => setQuantity((q) => q + 1)}
      className="w-8 h-8 rounded-lg border border-black flex items-center justify-center text-black hover hover:text-orange-400"
    >
      <Plus size={14} />
    </button>
  </div>
  <button
    onClick={handleAddToCart}
    className="bg-black text-white hover hover:text-orange-400 rounded-lg p-2.5"
  >
    <ShoppingCart size={18} />
  </button>
</div>
          </div>
        </div>
      )}

      {showCartModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <CheckCircle size={20} className="text-green-600" />
          <p className="font-bold text-gray-900">
            AJOUTÉ AVEC SUCCÈS À VOTRE PANIER
          </p>
        </div>
        <button onClick={() => setShowCartModal(false)}>
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="flex gap-4">
          <div className="relative w-24 h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {image ? (
              <Image src={image} alt={product.name} fill className="object-cover" />
            ) : null}
          </div>
          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="text-gray-500 text-sm mb-2">Taille : {selectedSize}</p>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center"
              >
                <Minus size={12} />
              </button>
              <span className="w-6 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center"
              >
                <Plus size={12} />
              </button>
            </div>
            <p className="text-gray-900 text-sm">{product.price} FCFA</p>
          </div>
        </div>

        <div className="md:border-l md:border-gray-200 md:pl-6">
          <p className="text-gray-900 mb-3">
            Total du panier : <span className="font-bold">{product.price * quantity} FCFA</span>
          </p>
          <div className="flex gap-3 mb-4">
            <Link
              href="/panier"
              className="flex-1 border border-gray-300 text-center rounded-lg py-2.5 text-sm font-medium"
            >
              VOIR LE PANIER
            </Link>
            <Link
              href="/checkout"
              className="flex-1 bg-gray-900 text-white text-center rounded-lg py-2.5 text-sm font-medium"
            >
              COMMANDER
            </Link>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-sm text-gray-700">
            Dépensez 50 000 FCFA de plus et obtenez la livraison gratuite !
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-gray-900 h-1.5 rounded-full"
                style={{ width: `${Math.min((product.price * quantity / 50000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-center font-bold text-gray-900 mb-1">
            YOU MAY ALSO LIKE
          </h3>
          <div className="w-10 h-0.5 bg-orange-400 mx-auto mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {similarProducts.slice(0, 4).map((p) => {
              const img = getCategoryImage(p.category?.name);
              return (
                <Link
                  key={p.id}
                  href={`/produits/${p.id}`}
                  onClick={() => setShowCartModal(false)}
                  className="relative h-28 rounded-lg overflow-hidden bg-gray-100"
                >
                  {img ? (
                    <Image src={img} alt={p.name} fill className="object-cover" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      )}
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