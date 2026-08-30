import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <main className="max-w-6xl mx-auto px-8 py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bienvenue chez DIA
          </h1>
          <p className="text-gray-600">
            Découvrez notre catalogue de produits.
          </p>
        </main>
      </div>
    </>
  );
}