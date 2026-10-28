"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ImagePlus, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Photo from "@/components/Photo";
import { getProduct, getProductsPage } from "@/lib/api";
import { createCustomRequest } from "@/lib/api/custom-requests";
import { productThumb } from "@/lib/product-media";
import { formatPrice } from "@/lib/format";

const STEPS = [
  { title: "Décrivez votre idée", text: "Modèle, matière, couleur, mesures, photos d'inspiration." },
  { title: "Recevez un devis", text: "Nous étudions votre demande et vous proposons un prix et un délai." },
  { title: "Acceptez et payez l'acompte", text: "La commande n'est lancée qu'après votre accord." },
  { title: "Nous confectionnons", text: "Retrait en magasin ou livraison à Libreville." },
];

const inputClass = "border border-gray-300 rounded-lg px-4 py-3 w-full text-gray-900";

function RequestForm() {
  const searchParams = useSearchParams();
  const productParam = searchParams.get("produit");

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [baseProduct, setBaseProduct] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [sizeInfo, setSizeInfo] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [desiredDate, setDesiredDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  // Produit de départ (bouton « Personnaliser »)
  useEffect(() => {
    if (!productParam) {
      setBaseProduct(null);
      return;
    }
    getProduct(productParam)
      .then((p: any) => {
        setBaseProduct(p);
        setTitle((current) => current || `Personnalisation : ${p.name}`);
      })
      .catch(() => setBaseProduct(null));
  }, [productParam]);

  // Aperçus des photos choisies
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";

    if (files.length + picked.length > 3) {
      setError("3 photos maximum.");
      return;
    }
    if (picked.some((f) => f.size > 5 * 1024 * 1024)) {
      setError("Chaque photo doit faire 5 Mo au maximum.");
      return;
    }
    setError(null);
    setFiles([...files, ...picked]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (description.trim().length < 10) {
      setError("Décrivez votre idée en quelques phrases (10 caractères minimum).");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("quantity", quantity || "1");
    if (color.trim()) formData.append("color", color.trim());
    if (sizeInfo.trim()) formData.append("size_info", sizeInfo.trim());
    if (desiredDate) formData.append("desired_date", desiredDate);
    if (baseProduct) formData.append("product_id", String(baseProduct.id));
    files.forEach((f) => formData.append("images[]", f));

    setIsSubmitting(true);
    try {
      await createCustomRequest(formData);
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer la demande.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-xl p-6">
        <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
          <CheckCircle size={20} />
          Demande envoyée
        </div>
        <p className="text-sm text-gray-700 mb-5">
          Nous étudions votre demande et revenons vers vous avec un devis (prix et délai). Vous le
          retrouverez dans « Mes demandes ». Rien n&apos;est facturé avant votre accord.
        </p>
        <Link
          href="/mes-demandes"
          className="inline-block bg-black text-white rounded-lg px-5 py-3 text-sm font-medium hover:bg-blue-400"
        >
          Suivre mes demandes
        </Link>
      </div>
    );
  }

  if (isLoggedIn === false) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 text-center">
        <p className="text-gray-900 font-medium mb-2">Connectez-vous pour envoyer une demande</p>
        <p className="text-gray-500 text-sm mb-5">
          Un compte nous permet de vous répondre et de suivre votre devis.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/connexion" className="bg-black text-white rounded-lg px-5 py-2.5 text-sm font-medium">
            Se connecter
          </Link>
          <Link href="/inscription" className="border border-black text-black rounded-lg px-5 py-2.5 text-sm font-medium">
            Créer un compte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {baseProduct && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-gray-800 flex items-center justify-between">
          <span>
            Basé sur : <span className="font-medium">{baseProduct.name}</span>
          </span>
          <Link href="/sur-commande" className="text-blue-600 hover:underline">
            Retirer
          </Link>
        </div>
      )}

      <input
        type="text" required maxLength={120} placeholder="Que souhaitez-vous faire réaliser ? (ex. Robe de soirée)"
        value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass}
      />
      <textarea
        required rows={5} maxLength={2000}
        placeholder="Décrivez votre idée : modèle, matière, détails, occasion..."
        value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text" maxLength={50} placeholder="Couleur souhaitée (facultatif)"
          value={color} onChange={(e) => setColor(e.target.value)} className={inputClass}
        />
        <input
          type="text" maxLength={255} placeholder="Taille ou mesures (facultatif)"
          value={sizeInfo} onChange={(e) => setSizeInfo(e.target.value)} className={inputClass}
        />
        <div>
          <label className="block text-xs text-gray-500 mb-1">Quantité</label>
          <input
            type="number" min={1} max={50} required
            value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date souhaitée (facultatif)</label>
          <input
            type="date" min={tomorrow}
            value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} className={inputClass}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-900 mb-2">
          Photos d&apos;inspiration (facultatif, 3 maximum)
        </p>
        <div className="flex flex-wrap gap-3">
          {previews.map((url, index) => (
            <div key={url} className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
              <Photo src={url} alt="" />
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, i) => i !== index))}
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {files.length < 3 && (
            <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 text-xs cursor-pointer hover:border-gray-900">
              <ImagePlus size={22} />
              Ajouter
              <input
                type="file" multiple className="hidden"
                accept="image/jpeg,image/png,image/jpg,image/webp" onChange={handleFiles}
              />
            </label>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">{error}</div>
      )}

      <button
        type="submit" disabled={isSubmitting}
        className="bg-black text-white rounded-lg py-3 font-medium hover:bg-blue-400 disabled:opacity-50"
      >
        {isSubmitting ? "Envoi..." : "Demander un devis"}
      </button>
      <p className="text-xs text-gray-500 text-center">
        Gratuit et sans engagement : vous recevrez un prix et un délai avant de décider.
      </p>
    </form>
  );
}

function OnOrderProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProductsPage({ onOrder: true })
      .then((res) => {
        setProducts(res.items);
        setLastPage(res.lastPage);
      })
      .catch((err: Error) => setError(err.message || "Impossible de charger les produits."))
      .finally(() => setIsLoading(false));
  }, []);

  async function loadMore() {
    const next = page + 1;
    setIsLoadingMore(true);
    try {
      const res = await getProductsPage({ onOrder: true, page: next });
      setProducts((prev) => [...prev, ...res.items]);
      setPage(next);
      setLastPage(res.lastPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger la suite.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  if (isLoading) return <p className="text-gray-500">Chargement...</p>;
  if (error) return <p className="text-red-600 text-sm">{error}</p>;
  if (products.length === 0) return null;

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-2 mt-16">Nos modèles sur commande</h2>
      <p className="text-gray-600 text-sm mb-6">
        Partez d&apos;un de nos modèles et personnalisez-le.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <Link href={`/produits/${product.id}`}>
              <div className="relative h-40 rounded-lg overflow-hidden mb-3 bg-gray-100">
                <Photo src={productThumb(product)} alt={product.name} />
              </div>
              <p className="font-medium text-gray-900">{product.name}</p>
            </Link>
            <p className="text-gray-500 text-sm mb-3">À partir de {formatPrice(Number(product.price))}</p>
            <Link
              href={`/sur-commande?produit=${product.id}#formulaire`}
              className="block text-center border border-black text-black rounded-lg py-2 text-sm font-medium hover:bg-gray-100"
            >
              Personnaliser
            </Link>
          </div>
        ))}
      </div>

      {page < lastPage && (
        <div className="text-center mt-10">
          <button
            onClick={loadMore} disabled={isLoadingMore}
            className="border border-black text-black rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
          >
            {isLoadingMore ? "Chargement..." : "Voir plus de modèles"}
          </button>
        </div>
      )}
    </>
  );
}

export default function SurCommandePage() {
  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-8 py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sur commande, sur mesure</h1>
          <p className="text-gray-600 mb-8">
            Des créations personnalisées, confectionnées spécialement pour vous.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {STEPS.map((step, index) => (
              <div key={step.title} className="border border-gray-200 rounded-xl p-4">
                <div className="w-7 h-7 rounded-full bg-pink-400 text-white text-sm font-bold flex items-center justify-center mb-2">
                  {index + 1}
                </div>
                <p className="font-medium text-gray-900 text-sm mb-1">{step.title}</p>
                <p className="text-gray-500 text-xs">{step.text}</p>
              </div>
            ))}
          </div>

          <div id="formulaire" className="max-w-2xl scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Votre demande de devis</h2>
            <Suspense fallback={<p className="text-gray-500">Chargement...</p>}>
              <RequestForm />
            </Suspense>
          </div>

          <OnOrderProducts />
        </div>
      </div>
      <ScrollToTop />
      <Footer />
    </>
  );
}