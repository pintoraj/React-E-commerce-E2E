import localData from "../db.json";

// 2. The function now provides the imported data.
// We keep it as an async function to maintain a consistent API signature,
// which means you won't have to change any code in the components that call it.

export const fetchProducts = async () => {
  try {
    // 3. The data is already loaded. We just need to access it.
    // We assume your db.json file has a root object with a "products" array.
    if (localData && localData.products) {
      return localData.products;
    } else {
      // This error will show if your db.json is structured incorrectly.
      console.error("Error: 'db.json' does not contain a 'products' key.");
      return []; // Return an empty array to prevent crashes.
    }
  } catch (error) {
    console.error("Failed to read data from local db.json:", error);
    return []; // Return empty array on any other error.
  }
};
