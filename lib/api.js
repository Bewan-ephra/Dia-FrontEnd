const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCategories() {
  const res = await fetch(`${API_URL}/categories`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.json();
}