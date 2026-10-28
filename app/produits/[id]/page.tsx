"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getProduct,
  addToCart,
  getCategoryImage,
  getProducts,
  trackRecentlyViewed,
  getRecentlyViewed,
  submitReview,
  getCart,
} from "@/lib/api";
import {
  CheckCircle, Minus, Plus, Truck, CreditCard, MessageCircle, X, MapPin, Phone,
  Map, Droplet, Shirt, Zap, Heart, Check, ShoppingCart, Star,
} from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";
import Link from "next/link";
import ReviewModal from "@/components/ReviewModal";
import { useShopSettings } from "@/lib/useShopSettings";

const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR");

// Image d'un produit : sa première photo, sinon l'image de sa catégorie
function thumb(p: any): string | null {
  return p?.image ?? p?.images?.[0]?.url ?? getCategoryImage(p?.category?.name) ?? null;
}

function Photo({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" />;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [product, setProduct] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const settings = useShopSettings();
  const [cartSubtotal, setCartSubtotal] = useState(0);

  useEffect(() => {
    let cancelled = false;

    params.then(async ({ id }) => {
      try {
        const data = await getProduct(id);
        if (cancelled) return;

        setProduct(data);

        // Sélection par défaut : première couleur avec du stock, puis première taille disponible
        const vs: any[] = data.variants ?? [];
        const first = vs.find((v) => v.stock > 0) ?? vs[0];
        if (first) {
          setSelectedColor(first.color ?? "");
          setSelectedSize(first.size ?? "");
        }

        // On garde une version légère pour « récemment consultés »
        trackRecentlyViewed({
          id: data.id,
          name: data.name,
          price: data.price,
          category: data.category,
          image: thumb(data),
        });
        setRecentlyViewed(getRecentlyViewed().filter((p: any) => p.id !== data.id));

        const same = await getProducts(data.category?.id);
        if (!cancelled) setSimilarProducts(same.filter((p: any) => p.id !== data.id));
      } catch {
        if (!cancelled) setNotFound(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [params]);

  useEffect(() => {
    function handleScroll() {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 300;
      setShowFloatingBar(window.scrollY > 400 && !nearBottom);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (notFound) {
    return (
      <>
        <Navbar />
        <div className="max-w-6xl mx-auto px-8 py-24 text-center text-gray-700">
          <p className="mb-4">Ce produit n'existe pas ou n'est plus disponible.</p>
          <Link href="/produits" className="text-blue-600 hover:underline">
            Retour aux produits
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return <div className="p-8 text-gray-600">Chargement...</div>;
  }

  // ---------- Données dérivées ----------
  const variants: any[] = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const details = product.details ?? {};

  const colors: string[] = Array.from(
    new Set(variants.map((v) => v.color).filter(Boolean))
  ) as string[];

  // Variantes de la couleur choisie (ou toutes si le produit n'a pas de couleur)
  const variantsOfColor = variants.filter((v) => (v.color ?? "") === selectedColor);
  const sizes: any[] = variantsOfColor.filter((v) => v.size);

  const selectedVariant = hasVariants
    ? variants.find(
        (v) => (v.color ?? "") === selectedColor && (v.size ?? "") === selectedSize
      )
    : null;

  const onOrder = !!product.on_order;
  const available = hasVariants ? selectedVariant?.stock ?? 0 : product.stock ?? 0;
  const canBuy = onOrder || (hasVariants ? !!selectedVariant && available > 0 : available > 0);
  const maxQty = onOrder ? 99 : Math.max(available, 1);

  const unitPrice = Number(product.price) + Number(selectedVariant?.price_adjustment ?? 0);
  const comparePrice = product.compare_price ? Number(product.compare_price) : null;
  const variantLabel = selectedVariant?.label ?? "";

  // Galerie : photos de la couleur choisie d'abord, puis les photos générales
  const allImages: any[] = [...(product.images ?? [])].sort((a, b) => a.order - b.order);
  const colorImages = allImages.filter((i) => i.color && i.color === selectedColor);
  const generalImages = allImages.filter((i) => !i.color);
  const gallery: string[] = (
    colorImages.length > 0
      ? [...colorImages, ...generalImages]
      : generalImages.length > 0
      ? generalImages
      : allImages
  ).map((i) => i.url);
  const mainImage: string | null =
    gallery[selectedImage] ?? gallery[0] ?? getCategoryImage(product.category?.name);

  // ---------- Actions ----------
  function handleColorChange(color: string) {
    setSelectedColor(color);
    setSelectedImage(0);
    setQuantity(1);
    setCartError(null);
    // On sélectionne la première taille en stock pour cette couleur
    const options = variants.filter((v) => (v.color ?? "") === color);
    const next = options.find((v) => v.stock > 0) ?? options[0];
    setSelectedSize(next?.size ?? "");
  }

  function handleSizeChange(size: string) {
    setSelectedSize(size);
    setQuantity(1);
    setCartError(null);
  }

  async function handleAddToCart() {
    setCartError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Connecte-toi pour ajouter un produit au panier.");
      return;
    }
    if (hasVariants && !selectedVariant) {
      setCartError("Choisis une couleur et une taille.");
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(token, product.id, quantity, selectedVariant?.id ?? null);
      try {
  const cart = await getCart(token);
  setCartSubtotal(Number(cart.total) || 0);
} catch {
  setCartSubtotal(unitPrice * quantity);
}
setShowCartModal(true);
    } catch (err) {
      setCartError(err instanceof Error ? err.message : "Erreur lors de l'ajout au panier");
    } finally {
      setIsAdding(false);
    }
  }

  function openReview() {
  if (!localStorage.getItem("token")) {
    alert("Connecte-toi pour écrire un avis.");
    return;
  }
  setShowReview(true);
}

async function handleSubmitReview(review: { rating: number; content: string; title: string }) {
  // En cas d'erreur, la modale affiche le message du serveur
  await submitReview(product.id, review);

  // On recharge le produit pour afficher le nouvel avis et la nouvelle moyenne
  try {
    setProduct(await getProduct(product.id));
  } catch {
    // L'avis est enregistré : un simple rafraîchissement raté ne doit rien bloquer
  }
}

  const stockMessage = onOrder
    ? `Sur commande${product.lead_time_days ? ` · disponible en ${product.lead_time_days} jours` : ""}`
    : available <= 0
    ? "Rupture de stock"
    : available <= 5
    ? `Plus que ${available} en stock`
    : "En stock";
  const stockColor = onOrder ? "text-blue-600" : available > 0 ? "text-green-600" : "text-red-600";

  const reviews: any[] = product.reviews ?? [];

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Galerie */}
          <div>
            <div className="relative h-[700px] rounded-xl overflow-hidden bg-gray-100 mb-3">
              <Photo src={mainImage} alt={product.name} />
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {gallery.map((url, index) => (
                  <button
                    key={url}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-24 h-28 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? "border-gray-900" : "border-gray-200"
                    }`}
                  >
                    <Photo src={url} alt={product.name} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations */}
          <div>
            <h1 className="text-3xl font-black text-blue-300 mb-2">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-4">
              <p className="text-2xl text-black font-semibold">{fmt(unitPrice)} FCFA</p>
              {comparePrice && comparePrice > unitPrice && (
                <p className="text-gray-400 line-through">{fmt(comparePrice)} FCFA</p>
              )}
            </div>

            <div className={`flex items-center gap-2 text-sm mb-6 ${stockColor}`}>
              <CheckCircle size={16} />
              {stockMessage}
            </div>

            {colors.length > 0 && (
              <div className="mb-6">
                <p className="font-medium text-gray-900 mb-2">
                  Couleur : <span className="font-normal text-gray-600">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => {
                    const inStock = variants.some((v) => v.color === color && v.stock > 0);
                    return (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`px-4 py-2 rounded-lg border text-sm ${
                          selectedColor === color
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-300"
                        } ${!inStock && !onOrder ? "opacity-50" : ""}`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="mb-6">
                <p className="font-medium text-gray-900 mb-2">Taille</p>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((v) => {
                    const out = v.stock <= 0 && !onOrder;
                    return (
                      <button
                        key={v.id}
                        onClick={() => handleSizeChange(v.size)}
                        disabled={out}
                        className={`px-4 py-2 rounded-lg border text-sm ${
                          selectedSize === v.size
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-300"
                        } ${out ? "opacity-40 line-through cursor-not-allowed" : ""}`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="font-medium text-gray-900 mb-2">Quantité</p>
              <div className="flex items-center gap-3 text-black">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="hover:text-pink-400 w-9 h-9 rounded-lg border border-black flex items-center justify-center text-black"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                  className="hover:text-pink-400 w-9 h-9 rounded-lg border border-black flex items-center justify-center text-black disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {cartError && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">
                {cartError}
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={!canBuy || isAdding}
              className="w-full bg-blue-300 text-white rounded-lg px-6 py-3 font-bold mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding
                ? "AJOUT EN COURS..."
                : canBuy
                ? onOrder
                  ? "COMMANDER (SUR COMMANDE)"
                  : "AJOUTER AU PANIER"
                : "INDISPONIBLE"}
            </button>
            {onOrder && (
  <p className="text-center text-sm text-gray-600 -mt-3 mb-6">
    Besoin d&apos;une personnalisation ?{" "}
    <Link href={`/sur-commande?produit=${product.id}#formulaire`} className="text-blue-600 hover:underline">
      Demandez un devis
    </Link>
  </p>
)}

            <div className="border border-gray-200 rounded-xl divide-y divide-gray-200 mb-5">
              <div className="flex items-start gap-3 p-4">
                <div className="bg-blue-50 text-pink-300 p-2 rounded-full">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="text-gray-600 text-xs">
  {fmt(settings.shipping_fee)} FCFA, offerte dès {fmt(settings.free_shipping_from)} FCFA d&apos;achat
</p>
                  <p className="text-gray-600 text-xs">
                    2 000 FCFA, offerte dès 50 000 FCFA d'achat
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4">
                <div className="bg-blue-50 text-pink-300 p-2 rounded-full">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="font-bold text-black text-sm mb-1">Payez comme vous voulez</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-xs font-medium text-black px-2 py-1 rounded-full">
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
                <div className="bg-blue-50 text-pink-300 p-2 rounded-full">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <p className="font-bold text-black text-sm">Une question avant de commander ?</p>
                  <a
                    href="https://wa.me/24160348225"
                    className="text-blue-600 text-xs hover:underline"
                  >
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
                <p className="text-gray-500 text-xs mb-2">Habituellement prête en 1 heure</p>
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="text-blue-600 text-xs hover:underline"
                >
                  Voir les informations du magasin
                </button>
              </div>
            </div>

            {/* Avis */}
            <div className="mb-6">
              <h2 className="font-medium text-gray-900 mb-3">
                Avis Clients
                {product.reviews_count > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    <Star size={14} className="inline text-yellow-500 fill-yellow-500 -mt-0.5" />{" "}
                    {product.average_rating} ({product.reviews_count})
                  </span>
                )}
              </h2>

              {reviews.length === 0 ? (
                <div className="text-center py-6 border border-gray-200 rounded-xl">
                  <p className="text-gray-700 text-sm mb-3">Soyez le premier à écrire un avis</p>
                  <button
                    onClick={openReview}
                    className="bg-pink-400 text-white text-sm font-medium px-5 py-2 rounded-lg"
                  >
                    Écrire un avis
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-black text-sm">{r.user?.name}</p>
                        <p className="text-yellow-500 text-sm">
                          {"★".repeat(r.rating)}
                          <span className="text-gray-300">{"★".repeat(5 - r.rating)}</span>
                        </p>
                      </div>
                      {r.title && <p className="font-medium text-black text-sm">{r.title}</p>}
{r.comment && <p className="text-gray-700 text-sm">{r.comment}</p>}
                      {r.verified_purchase && (
                        <p className="text-green-600 text-xs mt-1">Achat vérifié</p>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={openReview}
                    className="text-pink-400 text-sm font-medium hover:underline"
                  >
                    Écrire un avis
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <ReviewModal 
          onSubmit={handleSubmitReview}
          open={showReview}
          onClose={() => setShowReview(false)}
          productName={product.name}
          productImage={mainImage}
        />

        {/* Description enrichie : s'affiche seulement si le produit a des specs */}
        {(details.specs?.length > 0 || product.description) && (
          <div className="max-w-6xl mx-auto px-8 pb-12">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">DESCRIPTION</h2>
              <div className="w-10 h-0.5 bg-gray-900 mt-1"></div>
            </div>

            <div className="bg-black rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-pink-400 rounded-full opacity-30 blur-3xl"></div>
              <p className="text-pink-400 text-xs font-semibold uppercase mb-2">
                {product.category?.name} · Description
              </p>
              <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
              {product.description && (
                <p className="text-gray-300 mb-6 max-w-2xl">{product.description}</p>
              )}

              {details.specs?.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {details.specs.map((spec: any, index: number) => (
                    <div key={index} className="bg-blue-300 rounded-xl p-4">
                      <p className="text-2xl font-bold">{spec.value}</p>
                      <p className="text-black text-sm">{spec.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {details.features?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {details.features.map((feature: string, index: number) => (
                    <span key={index} className="bg-blue-300 text-sm px-4 py-2 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                <span className="bg-pink-400 font-bold px-4 py-2 rounded-full">
                  {fmt(unitPrice)} FCFA
                </span>
               <p className="text-gray-400 text-sm">
  Livraison {fmt(settings.shipping_fee)} FCFA partout à Libreville
</p>
              </div>
            </div>
          </div>
        )}

        {(details.summary || details.benefits || details.idealFor || hasVariants || details.care) && (
          <div className="max-w-6xl mx-auto px-8 pb-12">
            {details.summary && (
              <div className="border-l-4 border-pink-400 bg-white rounded-r-xl p-6 mb-8">
                <p className="text-pink-400 text-xs font-semibold uppercase mb-1">En bref</p>
                <p className="text-gray-700 text-sm">{details.summary}</p>
              </div>
            )}

            {details.benefits?.length > 0 && (
              <div className="mb-8">
                <h2 className="font-black text-gray-900 mb-4">POURQUOI VOUS ALLEZ L'ADOPTER</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {details.benefits.map((benefit: any, index: number) => {
                    const icons: { [key: string]: any } = {
                      droplet: Droplet,
                      shirt: Shirt,
                      zap: Zap,
                      heart: Heart,
                    };
                    const Icon = icons[benefit.icon] || Heart;
                    return (
                      <div key={index} className="border border-gray-200 rounded-xl p-4">
                        <div className="bg-blue-50 text-pink-400 w-9 h-9 rounded-lg flex items-center justify-center mb-3">
                          <Icon size={22} />
                        </div>
                        <p className="font-bold text-black mb-1">{benefit.title}</p>
                        <p className="text-gray-500 text-sm">{benefit.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {details.idealFor?.length > 0 && (
              <div className="mb-8">
                <h2 className="font-black text-black mb-4">IDÉAL POUR</h2>
                <div className="flex flex-wrap gap-2">
                  {details.idealFor.map((item: string, index: number) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 bg-blue-50 text-black text-sm px-3 py-1.5 rounded-full"
                    >
                      <Check size={14} />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hasVariants && (
              <div className="mb-8">
                <h2 className="font-black text-black mb-4">TAILLES ET COLORIS</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from(new Set(variants.map((v) => v.size).filter(Boolean))).length > 0 && (
                    <div className="bg-gray-100 rounded-xl p-5">
                      <p className="font-black text-gray-500 text-xs uppercase mb-2">Tailles</p>
                      <div className="flex flex-wrap gap-2 text-black">
                        {Array.from(new Set(variants.map((v) => v.size).filter(Boolean))).map(
                          (size: any) => (
                            <span
                              key={size}
                              className="bg-white border border-gray-300 text-sm px-3 py-1 rounded-full"
                            >
                              {size}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {colors.length > 0 && (
                    <div className="bg-gray-100 rounded-xl p-5">
                      <p className="font-black text-gray-500 text-xs uppercase mb-2">Coloris</p>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((color) => (
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
              </div>
            )}

            {details.care?.length > 0 && (
              <div>
                <h2 className="font-black text-gray-900 mb-4">MATIÈRE ET ENTRETIEN</h2>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {details.care.map((item: any, index: number) => (
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
          <div className="mt-12 max-w-6xl mx-auto px-8">
            <h2 className="text-center font-bold text-black text-lg mb-1">PRODUITS SIMILAIRES</h2>
            <div className="w-10 h-0.5 bg-pink-400 mx-auto mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.slice(0, 8).map((p) => (
                <Link
                  key={p.id}
                  href={`/produits/${p.id}`}
                  className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition"
                >
                  <div className="relative h-80 rounded-lg overflow-hidden mb-2 bg-gray-100">
                    <Photo src={thumb(p)} alt={p.name} />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                  <p className="font-bold text-black text-base">{fmt(Number(p.price))} FCFA</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {recentlyViewed.length > 0 && (
          <div className="mt-12 max-w-6xl mx-auto px-8 pb-12">
            <h2 className="text-center font-bold text-black text-lg mb-1">
              PRODUITS RÉCEMMENT CONSULTÉS
            </h2>
            <div className="w-10 h-0.5 bg-pink-400 mx-auto mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentlyViewed.map((p) => (
                <Link
                  key={p.id}
                  href={`/produits/${p.id}`}
                  className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition"
                >
                  <div className="relative h-80 rounded-lg overflow-hidden mb-2 bg-gray-100">
                    <Photo src={thumb(p)} alt={p.name} />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                  <p className="font-bold text-black text-base">{fmt(Number(p.price))} FCFA</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Barre flottante */}
      {showFloatingBar && (
        <div className="fixed bottom-8 left-4 right-4 md:left-8 md:right-8 bg-white border border-gray-200 rounded-xl shadow-xl z-40">
          <div className="max-w-6xl mx-auto px-3 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <Photo src={mainImage} alt={product.name} />
              </div>
              <div>
                <p className="font-medium text-black text-sm">{product.name}</p>
                {variantLabel && <p className="text-gray-500 text-xs">{variantLabel}</p>}
                <p className="text-pink-400 font-semibold text-sm">
                  {fmt(unitPrice * quantity)} FCFA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-3 text-black">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="hover:text-pink-400 w-8 h-8 rounded-lg border border-black text-black flex items-center justify-center"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  className="w-8 h-8 rounded-lg border border-black flex items-center justify-center text-black hover:text-pink-400"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!canBuy || isAdding}
                className="bg-black text-white hover:text-blue-400 rounded-lg p-2.5 disabled:opacity-50"
              >
                <ShoppingCart size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale « ajouté au panier » */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                <p className="font-bold text-gray-900">AJOUTÉ AVEC SUCCÈS À VOTRE PANIER</p>
              </div>
              <button onClick={() => setShowCartModal(false)}>
                <X size={20} className="text-gray-500 hover:text-pink-300" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="flex gap-4">
                <div className="relative w-24 h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Photo src={mainImage} alt={product.name} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  {variantLabel && (
                    <p className="text-gray-700 text-sm mb-2">{variantLabel}</p>
                  )}
                  <p className="text-gray-700 text-sm mb-2">Quantité : {quantity}</p>
                  <p className="text-gray-900 text-base">{fmt(unitPrice)} FCFA</p>
                </div>
              </div>

              <div className="md:border-l md:border-gray-200 md:pl-6">
                <p className="text-gray-900 mb-3">
                  Total : <span className="font-bold">{fmt(unitPrice * quantity)} FCFA</span>
                </p>
                <div className="flex gap-3 mb-4">
                  <Link
                    href="/panier"
                    className="flex-1 border border-black text-center rounded-lg py-2.5 text-sm text-black font-medium"
                  >
                    VOIR LE PANIER
                  </Link>
                  <Link
                    href="/checkout"
                    className="flex-1 bg-gray-900 text-white text-center rounded-lg py-2.5 text-sm font-medium hover:bg-blue-400"
                  >
                    COMMANDER
                  </Link>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-sm text-gray-800">
  {cartSubtotal >= settings.free_shipping_from
    ? "Votre panier bénéficie de la livraison gratuite !"
    : `Dépensez ${fmt(settings.free_shipping_from - cartSubtotal)} FCFA de plus et obtenez la livraison gratuite !`}
  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
    <div
      className="bg-gray-900 h-1.5 rounded-full"
      style={{
        width: `${Math.min((cartSubtotal / Math.max(settings.free_shipping_from, 1)) * 100, 100)}%`,
      }}
    ></div>
  </div>
</div>
              </div>
            </div>

            {similarProducts.length > 0 && (
              <div className="border-t border-gray-200 p-6">
                <h3 className="text-center text-lg font-bold text-gray-900 mb-1">
                  VOUS AIMEREZ AUSSI
                </h3>
                <div className="w-10 h-0.5 bg-pink-400 mx-auto mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {similarProducts.slice(0, 4).map((p) => (
                    <Link
                      key={p.id}
                      href={`/produits/${p.id}`}
                      onClick={() => setShowCartModal(false)}
                      className="bg-white rounded-xl"
                    >
                      <div className="relative h-48 rounded-lg overflow-hidden mb-2 bg-gray-100">
                        <Photo src={thumb(p)} alt={p.name} />
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                      <p className="font-bold text-black text-base">{fmt(Number(p.price))} FCFA</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modale magasin */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between p-7 border-b border-gray-200 bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                {variantLabel && <p className="text-gray-500 text-sm">{variantLabel}</p>}
                <p className="text-gray-900 text-sm">{fmt(unitPrice)} FCFA</p>
              </div>
              <button onClick={() => setShowLocationModal(false)}>
                <X size={20} className="text-gray-500 hover:text-pink-400" />
              </button>
            </div>

            <div className="p-6">
              <p className="font-bold text-gray-900 mb-4">NZENG-AYONG GP ( à la descende d'ONDO)</p>

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

              <a
                href="https://maps.app.goo.gl/VfDQ61SnMEzDFmc58"
                className="flex items-center gap-2 text-pink-400 text-sm hover:underline"
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