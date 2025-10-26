import React, { createContext, useContext, useEffect, useState } from 'react';

const ProductContext = createContext();

export function useProducts() {
  return useContext(ProductContext);
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/db1.json')
      .then(res => res.json())
      .then(data => setProducts(data.products || []));
  }, []);

  return (
    <ProductContext.Provider value={{ products }}>
      {children}
    </ProductContext.Provider>
  );
}
