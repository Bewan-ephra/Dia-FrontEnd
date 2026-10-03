export const mockProducts = [
  {
    id: 1,
    name: "T-shirt Classic",
    description: "Un t-shirt confortable en coton bio.",
    price: 15000,
    stock: 25,
    category: { id: 1, name: "Vêtements" },
    onOrder: false,
    sizes: ["S", "M", "L", "XL"],
      specs: [
    { label: "coton", value: "100%" },
    { label: "tailles", value: "S à XL" },
    { label: "coloris", value: "3" },
  ],
  features: ["Manches courtes", "Coton doux", "Respirant"],

  summary: "Le T-shirt Classic est une pièce essentielle de la garde-robe DIA. Son tissu en coton bio respire bien et reste confortable toute la journée.",
benefits: [
  { icon: "droplet", title: "Respirant", description: "Un coton doux qui laisse la peau respirer." },
  { icon: "shirt", title: "Coupe classique", description: "Une coupe intemporelle, facile à assortir." },
  { icon: "zap", title: "Liberté de mouvement", description: "Aucune gêne au quotidien." },
  { icon: "heart", title: "Sobre", description: "Un design minimaliste, facile à porter." },
],
idealFor: ["Quotidien", "Sorties décontractées", "Superposition", "Lifestyle"],
colors: ["Noir", "Blanc", "Gris"],
care: [
  { label: "Composition", value: "100% coton bio" },
  { label: "Coupe", value: "Classique" },
  { label: "Coloris", value: "Gris" },
  { label: "Entretien", value: "Lavage en machine à 30°C, séchage à l'air libre." },
],
  },


  {
    id: 2,
    name: "Sneakers Urban",
    description: "Des sneakers stylées pour tous les jours.",
    price: 35000,
    stock: 10,
    category: { id: 2, name: "Chaussures" },
    onOrder: false,
    sizes: ["38", "40", "42", "44"],
  },

   {
    id: 3,
    name: "Robe sur mesure",
    description: "Robe confectionnée selon vos mesures, délai 1 semaines.",
    price: 45000,
    stock: 5,
    category: { id: 1, name: "Vêtements" },
    onOrder: true,
    sizes: ["S", "M", "L"],
     sizes: ["S", "M", "L", "XL"],
      specs: [
    { label: "soie", value: "100%" },
    { label: "tailles", value: "S à XL" },
    { label: "coloris", value: "3" },
  ],
  features: ["Robe élégante", "tissu doux", "éclatant"],

  },

];

export const mockCategories = [
  { id: 1, name: "Vêtements", slug: "vetements", children: [] },
  { id: 2, name: "Chaussures", slug: "chaussures", children: [] },
];

export const mockCart = {
  cart: {
    id: 1,
    user_id: 1,
    items: [],
  },
  total: 0,
};

export const mockUser = {
  id: 1,
  name: "Test User",
  email: "test@test.com",
  roles: [{ id: 1, name: "client" }],
};