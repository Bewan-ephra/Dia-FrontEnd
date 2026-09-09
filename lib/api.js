const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCategories() {
  const res = await fetch(`${API_URL}/categories`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.json();
}

export async function registerUser(name, email, password, passwordConfirmation) {
  const res= await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getMe(token) {
  const res = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.json();
}

export async function getProducts() {
  const res = await fetch(`${API_URL}/products`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  const data = await res.json();
  return data.data;
}

export async function getProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.json();
}

export async function getCategoriesPublic() {
  const res = await fetch(`${API_URL}/categories`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return res.json();
}