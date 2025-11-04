const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}`;


const handleResponse = async (response) => {
  if (response.status === 204) {
    return true;
  }
  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = { message: "Response was not valid JSON." };
  }

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  return data;
};


export const fetchProducts = async (category = "") => {
  try {
    const url = category
      ? `${API_URL}/products?categories=${encodeURIComponent(category)}`
      : `${API_URL}/products`;

    const response = await fetch(url);
    return handleResponse(response);
  } catch (error) {
    console.error("Failed to fetch products from backend:", error);
    return [];
  }
};

export const fetchDealProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products/deals`);
    return handleResponse(response);
  } catch (error) {
    console.error("Failed to fetch deal products:", error);
    return [];
  }
};


export const fetchFilteredProducts = async (filters) => {
  try {
    const params = new URLSearchParams();

    // --- FIX 1: READ THE CORRECT KEY FROM THE FILTERS OBJECT ---
    // The key from AdminProducts.jsx should be 'searchTerm'
    if (filters.searchTerm != null) {
      params.append("search", filters.searchTerm);
    }

    // --- (Filters that are working) ---
    if (filters.brands?.length) filters.brands.forEach(b => params.append("brands", b));
    if (filters.categories?.length) filters.categories.forEach(c => params.append("categories", c));
    if (filters.priceMin) params.append("minPrice", filters.priceMin);
    if (filters.priceMax) params.append("maxPrice", filters.priceMax);
    if (filters.ratingMin) params.append("minRating", filters.ratingMin);

    // --- FIX 2: CORRECTLY HANDLE SORTING ---
    // The component is already sending the correct Spring Sort format
    // (e.g., "id,asc", "price,desc"). We can append it directly.
    // The old switch statement was incorrect.
    if (filters.sortBy) {
      params.append("sort", filters.sortBy);
    }

    // --- FIX 3: CORRECTLY HANDLE PAGINATION ---
    // Check for null/undefined instead of just falsy (to allow page 0)
    if (filters.page != null) {
      // The component is 1-based (1, 2, 3)
      // Spring Pageable is 0-based (0, 1, 2)
      // We MUST subtract 1
      params.append("page", filters.page - 1);
    }

    if (filters.limit) params.append("size", filters.limit); // Spring uses 'size'

    const response = await fetch(`${API_URL}/products?${params.toString()}`);
    return handleResponse(response);

  } catch (error) {
    console.error("Failed to fetch filtered products:", error);
    // Return an empty Page object structure on failure
    return { content: [], totalPages: 0, totalElements: 0 };
  }
};

export const fetchProductById = async (productId) => {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`);
    return handleResponse(response);
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return null;
  }
};

export const createProduct = async (productData, thumbnailFile, token) => {
  try {

    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(productData)], {
      type: 'application/json'
    });
    formData.append('productData', jsonBlob);

    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    const response = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Create product error:", error);
    throw error;
  }
};


export const updateProduct = async (productId, productData, thumbnailFile, token) => {
  try {
    // 1. Create FormData
    const formData = new FormData();

    // 2. Append the JSON data as a Blob
    const jsonBlob = new Blob([JSON.stringify(productData)], {
      type: 'application/json'
    });
    formData.append('productData', jsonBlob);

    // 3. Append the file *only if* a new one was provided
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    // 4. Send the request
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "PUT", // Use PUT to match your @PutMapping
      headers: {
        // DO NOT set 'Content-Type', FormData does it automatically
        Authorization: `Bearer ${token}`, // Uses the correct token
      },
      body: formData, // Send the FormData object
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Update product error:", error);
    throw error;
  }
};


export const deleteProduct = async (productId, token) => {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Delete product error:", error);
    throw error;
  }
};

export const addProductReview = async (productId, reviewData, token) => {
  try {
    const response = await fetch(`${API_URL}/products/${productId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Add review error:", error);
    throw error;
  }
};

// Pinto module ends --

export const addToWishlist = async (userId, productId, token) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}/wishlist/${productId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to add to wishlist");
    return await response.json();
  } catch (error) {
    console.error("Wishlist error:", error);
    throw error;
  }
};

// ✅ Remove product from wishlist
export const removeFromUserWishlist = async (userId, productId, token) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}/wishlist/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to remove from wishlist");
    return true;
  } catch (error) {
    console.error("Remove wishlist error:", error);
    throw error;
  }
};

// ✅ Get user's wishlist
export const getUserWishlist = async (userId, token) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}/wishlist`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch wishlist");
    return await response.json();
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    return [];
  }
};

// --- User Cart Functions (Unchanged) ---

// ✅ Add product to cart

export const addToUserCart = async (userId, productId, token) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}/cart/${productId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to add to cart");
    return await response.json();
  } catch (error) {
    console.error("Cart error:", error);
    throw error;
  }
};

// ✅ Update cart item quantity
export const updateCartItem = async (userId, productId, quantity, token) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}/cart/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) throw new Error("Failed to update cart item");
    return await response.json();
  } catch (error) {
    console.error("Update cart error:", error);
    throw error;
  }
};

// ✅ Remove product from cart
export const removeFromUserCart = async (userId, productId, token) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}/cart/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to remove from cart");
    return true;
  } catch (error) {
    console.error("Remove cart error:", error);
    throw error;
  }
};

// ✅ Clear entire cart
export const clearUserCart = async (userId, token) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}/cart`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to clear cart");
    return true;
  } catch (error) {
    console.error("Clear cart error:", error);
    throw error;
  }
};

// ✅ Get user's cart
export const getUserCart = async (userId, token) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch cart");
    return await response.json();
  } catch (error) {
    console.error("Fetch cart error:", error);
    return [];
  }
};
