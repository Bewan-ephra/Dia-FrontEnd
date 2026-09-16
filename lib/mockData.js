export const mockProducts = [
  {
    id: 1,
    name: "T-shirt Classic",
    description: "Un t-shirt confortable en coton bio.",
    price: 15000,
    stock: 25,
    category: { id: 1, name: "Vêtements" },
    onOrder: false,
  },
  {
    id: 2,
    name: "Sneakers Urban",
    description: "Des sneakers stylées pour tous les jours.",
    price: 35000,
    stock: 10,
    category: { id: 2, name: "Chaussures" },
    onOrder: false,
  },

   {
    id: 3,
    name: "Robe sur mesure",
    description: "Robe confectionnée selon vos mesures, délai 1 semaines.",
    price: 45000,
    stock: 5,
    category: { id: 1, name: "Vêtements" },
    onOrder: true,
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
    items: [
      {
        id: 1,
        product_id: 1,
        quantity: 2,
        product: mockProducts[0],
      },
    ],
  },
  total: 30000,
};

export const mockUser = {
  id: 1,
  name: "Test User",
  email: "test@test.com",
  roles: [{ id: 1, name: "client" }],
};